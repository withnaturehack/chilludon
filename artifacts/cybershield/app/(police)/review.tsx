import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Modal, TextInput, Alert, Platform,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308", under_review: "#60A5FA", verified: "#10B981",
  rejected: "#EF4444", fraud: "#DC2626", escalated: "#8B5CF6",
};
const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16",
};

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["police-submissions"] });
      qc.invalidateQueries({ queryKey: ["police-stats"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelected(null); setNotes(""); setPoints("0");
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  const statuses = ["pending", "under_review", "verified", "rejected", "escalated"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Review Submissions</Text>
        <View style={styles.filters}>
          {statuses.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.filterBtn, { backgroundColor: statusFilter === s ? (STATUS_COLORS[s] || colors.primary) : colors.card, borderColor: STATUS_COLORS[s] || colors.border }]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.filterText, { color: statusFilter === s ? "#FFF" : colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {s.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
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
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: sc }]}
                onPress={() => { setSelected(item); setNotes(item.reviewer_notes || ""); Haptics.selectionAsync(); }}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, { backgroundColor: sc + "20" }]}>
                    <Text style={[styles.badgeText, { color: sc, fontFamily: "Inter_600SemiBold" }]}>{item.status?.replace("_", " ").toUpperCase()}</Text>
                  </View>
                  {item.severity && (
                    <View style={[styles.badge, { backgroundColor: sevc + "20" }]}>
                      <Text style={[styles.badgeText, { color: sevc, fontFamily: "Inter_600SemiBold" }]}>{item.severity?.toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.badgeText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{item.type?.replace("_", " ")}</Text>
                  </View>
                </View>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{item.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                  {item.description}
                </Text>
                {item.user_name && (
                  <Text style={[styles.reporter, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    By: {item.user_name} · {new Date(item.created_at).toLocaleDateString("en-IN")}
                  </Text>
                )}
                {item.target_url && (
                  <Text style={[styles.targetUrl, { color: colors.primary, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                    {item.target_url}
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>No {statusFilter} submissions</Text>
            </View>
          }
        />
      )}

      {/* Review Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]} numberOfLines={2}>
                {selected?.title}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={4}>
              {selected?.description}
            </Text>

            {selected?.steps_to_reproduce && (
              <View style={[styles.stepsBox, { backgroundColor: colors.muted }]}>
                <Text style={[styles.stepsTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Steps to Reproduce:</Text>
                <Text style={[styles.stepsText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {selected.steps_to_reproduce}
                </Text>
              </View>
            )}

            {selected?.ai_analysis && (
              <View style={[styles.aiBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                <Feather name="cpu" size={12} color={colors.primary} />
                <Text style={[styles.aiText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={3}>
                  {selected.ai_analysis}
                </Text>
              </View>
            )}

            <TextInput
              style={[styles.notesInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="Reviewer notes (optional)..."
              placeholderTextColor={colors.mutedForeground}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.pointsRow}>
              <Text style={[styles.pointsLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Points to Award:</Text>
              <TextInput
                style={[styles.pointsInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
                value={points}
                onChangeText={setPoints}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.actionBtns}>
              {["verified", "rejected", "under_review", "escalated", "fraud"].map(action => (
                <TouchableOpacity
                  key={action}
                  style={[styles.actionBtn, { backgroundColor: (STATUS_COLORS[action] || colors.primary) + "15", borderColor: STATUS_COLORS[action] || colors.primary }]}
                  onPress={() => reviewMutation.mutate({ id: selected.id, status: action })}
                  disabled={reviewMutation.isPending}
                >
                  <Text style={[styles.actionBtnText, { color: STATUS_COLORS[action] || colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                    {action.replace("_", " ").toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, paddingTop: 16 },
  title: { fontSize: 22, marginBottom: 12 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 11 },
  card: { borderRadius: 16, padding: 14, borderWidth: 1, borderLeftWidth: 4, gap: 8 },
  cardHeader: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10 },
  cardTitle: { fontSize: 15 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  reporter: { fontSize: 12 },
  targetUrl: { fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20, gap: 14, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { flex: 1, fontSize: 16, marginRight: 12 },
  modalDesc: { fontSize: 13, lineHeight: 18 },
  stepsBox: { padding: 10, borderRadius: 8 },
  stepsTitle: { fontSize: 12, marginBottom: 4 },
  stepsText: { fontSize: 12, lineHeight: 18 },
  aiBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 10, borderRadius: 8, borderWidth: 1 },
  aiText: { flex: 1, fontSize: 11 },
  notesInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, minHeight: 80 },
  pointsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  pointsLabel: { fontSize: 14 },
  pointsInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, height: 44, fontSize: 18, width: 100 },
  actionBtns: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  actionBtnText: { fontSize: 11 },
});
