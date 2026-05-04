import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Modal, TextInput, Alert, Platform, ScrollView, Animated,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308", under_review: "#60A5FA", verified: "#10B981",
  rejected: "#EF4444", fraud: "#DC2626", escalated: "#8B5CF6",
};
const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16",
};

const ACTION_BTNS = [
  { status: "verified", label: "Verify", icon: "check-circle", color: "#10B981" },
  { status: "under_review", label: "Review", icon: "eye", color: "#60A5FA" },
  { status: "escalated", label: "Escalate", icon: "alert-triangle", color: "#8B5CF6" },
  { status: "rejected", label: "Reject", icon: "x-circle", color: "#EF4444" },
  { status: "fraud", label: "Fraud", icon: "flag", color: "#DC2626" },
];

export default function ReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [points, setPoints] = useState("0");
  const [statusFilter, setStatusFilter] = useState("pending");
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["police-submissions", statusFilter],
    queryFn: () => apiFetch(`/police/submissions?status=${statusFilter}`),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/police/submissions/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status, reviewer_notes: notes, points_awarded: Number(points) }),
      }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["police-submissions"] });
      qc.invalidateQueries({ queryKey: ["police-stats"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Done!", `Submission marked as ${status.replace("_", " ")}.`);
      setSelected(null); setNotes(""); setPoints("0");
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0A1F3A", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.headerTitle}>Review Queue</Text>
        <Text style={styles.headerSub}>{data?.total || 0} submissions · Select to review</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10 }}>
          {["pending", "under_review", "verified", "rejected", "escalated"].map(s => {
            const sc = STATUS_COLORS[s];
            const active = statusFilter === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.filterChip, active && { backgroundColor: sc + "25", borderColor: sc }]}
                onPress={() => { setStatusFilter(s); Haptics.selectionAsync(); }}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterText, active && { color: sc }]}>
                  {s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          style={{ opacity: fadeAnim }}
          data={data?.submissions || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] || "#666";
            const sevc = SEV_COLORS[item.severity] || "#666";
            return (
              <TouchableOpacity
                style={[styles.card, { borderLeftColor: sc }]}
                onPress={() => { setSelected(item); setNotes(item.reviewer_notes || ""); setPoints(item.points_awarded?.toString() || "0"); Haptics.selectionAsync(); }}
                activeOpacity={0.8}
              >
                <LinearGradient colors={[sc + "06", "transparent"]} style={StyleSheet.absoluteFill} />
                <View style={styles.cardTop}>
                  <View style={styles.cardBadges}>
                    <View style={[styles.badge, { backgroundColor: sc + "20" }]}>
                      <Text style={[styles.badgeText, { color: sc }]}>{item.status?.replace("_", " ").toUpperCase()}</Text>
                    </View>
                    {item.severity && (
                      <View style={[styles.badge, { backgroundColor: sevc + "15" }]}>
                        <Text style={[styles.badgeText, { color: sevc }]}>{item.severity?.toUpperCase()}</Text>
                      </View>
                    )}
                    {item.type && (
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{item.type.replace("_", " ")}</Text>
                      </View>
                    )}
                  </View>
                  <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.25)" />
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardFooter}>
                  {item.user_name && (
                    <View style={styles.reporterRow}>
                      <Feather name="user" size={11} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.reporterText}>{item.user_name}</Text>
                    </View>
                  )}
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={64} color="rgba(255,255,255,0.06)" />
              <Text style={styles.emptyText}>No {statusFilter.replace("_", " ")} submissions</Text>
            </View>
          }
        />
      )}

      {/* Review Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelected(null)} />
        <View style={styles.modal}>
          <LinearGradient colors={["#0F1A2E", "#0B1120"]} style={{ flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" }}>
            <LinearGradient colors={["rgba(59,130,246,0.1)", "transparent"]} style={{ padding: 20, paddingBottom: 14 }}>
              <View style={styles.modalHdr}>
                <Text style={styles.modalTitle} numberOfLines={2}>{selected?.title}</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                  <Feather name="x" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBadges}>
                {selected?.severity && (
                  <View style={[styles.badge, { backgroundColor: (SEV_COLORS[selected.severity] || "#666") + "20" }]}>
                    <Text style={[styles.badgeText, { color: SEV_COLORS[selected.severity] || "#666" }]}>{selected.severity?.toUpperCase()}</Text>
                  </View>
                )}
                {selected?.type && <View style={styles.typeBadge}><Text style={styles.typeText}>{selected.type.replace("_", " ")}</Text></View>}
                {selected?.user_name && <Text style={styles.byText}>by {selected.user_name}</Text>}
              </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} showsVerticalScrollIndicator={false}>
              {selected?.description && (
                <View style={styles.descBox}>
                  <Text style={styles.boxLabel}>Description</Text>
                  <Text style={styles.boxText}>{selected.description}</Text>
                </View>
              )}
              {selected?.steps_to_reproduce && (
                <View style={styles.stepsBox}>
                  <Text style={styles.boxLabel}>Steps to Reproduce</Text>
                  <Text style={styles.boxText}>{selected.steps_to_reproduce}</Text>
                </View>
              )}
              {selected?.impact_description && (
                <View style={styles.impactBox}>
                  <Text style={styles.boxLabel}>Impact</Text>
                  <Text style={styles.boxText}>{selected.impact_description}</Text>
                </View>
              )}
              {selected?.ai_analysis && (
                <View style={styles.aiBox}>
                  <MaterialCommunityIcons name="robot" size={14} color="#3B82F6" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aiLabel}>RakshBot AI Analysis</Text>
                    <Text style={styles.aiText}>{selected.ai_analysis}</Text>
                  </View>
                </View>
              )}
              {selected?.target_url && (
                <View style={styles.urlBox}>
                  <Feather name="link" size={13} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.urlText} numberOfLines={2}>{selected.target_url}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Reviewer Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add review notes..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={styles.pointsRow}>
                <Text style={styles.inputLabel}>Award Points</Text>
                <View style={styles.pointsInput}>
                  <TextInput
                    style={styles.pointsTextField}
                    value={points}
                    onChangeText={setPoints}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                  <Text style={styles.ptsLabel}>pts</Text>
                </View>
              </View>

              <View style={styles.actionGrid}>
                {ACTION_BTNS.map(btn => (
                  <TouchableOpacity
                    key={btn.status}
                    style={[styles.actionBtn, { borderColor: btn.color + "50", backgroundColor: btn.color + "12" }]}
                    onPress={() => {
                      Alert.alert(
                        `${btn.label} Submission`,
                        `Mark this as "${btn.label}"?${btn.status === "verified" && Number(points) > 0 ? ` Award ${points} points to reporter.` : ""}`,
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Confirm", onPress: () => reviewMutation.mutate({ id: selected.id, status: btn.status }) },
                        ]
                      );
                    }}
                    disabled={reviewMutation.isPending}
                    activeOpacity={0.75}
                  >
                    <Feather name={btn.icon as any} size={16} color={btn.color} />
                    <Text style={[styles.actionBtnText, { color: btn.color }]}>{btn.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  filterText: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_500Medium" },
  card: { backgroundColor: "#0F1A2E", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 4, gap: 8, overflow: "hidden" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardBadges: { flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  typeBadge: { backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_400Regular" },
  cardTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardDesc: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reporterRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  reporterText: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular" },
  dateText: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: "rgba(255,255,255,0.3)", fontSize: 15, fontFamily: "Inter_400Regular" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  modal: { maxHeight: "90%", backgroundColor: "#0F1A2E", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHdr: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  modalTitle: { flex: 1, color: "#F8FAFC", fontSize: 18, fontFamily: "Inter_700Bold" },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  modalBadges: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" },
  byText: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular" },
  descBox: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 12, gap: 6 },
  stepsBox: { backgroundColor: "rgba(59,130,246,0.06)", borderRadius: 12, padding: 12, gap: 6 },
  impactBox: { backgroundColor: "rgba(239,68,68,0.06)", borderRadius: 12, padding: 12, gap: 6 },
  boxLabel: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  boxText: { color: "#F8FAFC", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  aiBox: { flexDirection: "row", gap: 10, backgroundColor: "rgba(59,130,246,0.08)", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "rgba(59,130,246,0.15)" },
  aiLabel: { color: "#3B82F6", fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  aiText: { color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular" },
  urlBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 10 },
  urlText: { color: "#3B82F6", fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  inputLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  notesInput: { backgroundColor: "#1E293B", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, paddingVertical: 12, color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 80 },
  pointsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pointsInput: { flexDirection: "row", alignItems: "center", backgroundColor: "#1E293B", borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, height: 44, gap: 6 },
  pointsTextField: { color: "#F8FAFC", fontSize: 18, fontFamily: "Inter_700Bold", minWidth: 60, textAlign: "center" },
  ptsLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular" },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
