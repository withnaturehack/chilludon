import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, Platform, ScrollView, Animated,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const DIFF_GRAD: Record<string, [string, string]> = {
  easy: ["#059669", "#10B981"],
  medium: ["#D97706", "#F59E0B"],
  hard: ["#DC2626", "#EF4444"],
  expert: ["#7C3AED", "#8B5CF6"],
};

export default function CTFScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [flag, setFlag] = useState("");
  const [filter, setFilter] = useState("all");
  const isWeb = Platform.OS === "web";
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["ctf-challenges"],
    queryFn: () => apiFetch("/ctf"),
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, flag }: { id: string; flag: string }) =>
      apiFetch(`/ctf/${id}/submit`, { method: "POST", body: JSON.stringify({ flag }) }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["ctf-challenges"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      if (res.correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("🏆 Correct Flag!", res.message || "Points awarded!", [{ text: "Awesome!", onPress: () => { setSelected(null); setFlag(""); } }]);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("❌ Wrong Flag", "Keep trying! Read the hints carefully.");
      }
    },
    onError: () => Alert.alert("Error", "Failed to submit flag"),
  });

  const challenges = data?.challenges || [];
  const filtered = filter === "all" ? challenges : challenges.filter((c: any) => c.difficulty === filter);
  const solved = challenges.filter((c: any) => c.is_solved).length;
  const topPad = insets.top + (isWeb ? 16 : 0);

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0F2040", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>CTF Challenges</Text>
            <Text style={styles.headerSub}>Solve challenges · Earn points · Level up</Text>
          </View>
          <LinearGradient colors={["#7C3AED", "#8B5CF6"]} style={styles.ctfBadge}>
            <MaterialCommunityIcons name="flag" size={14} color="#FFF" />
            <Text style={styles.ctfBadgeText}>CTF</Text>
          </LinearGradient>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{challenges.length}</Text>
            <Text style={styles.statLbl}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: "#10B981" }]}>{solved}</Text>
            <Text style={styles.statLbl}>Solved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: "#EAB308" }]}>{challenges.length - solved}</Text>
            <Text style={styles.statLbl}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: "#3B82F6" }]}>
              {challenges.filter((c: any) => c.is_solved).reduce((a: number, c: any) => a + (c.points || 0), 0)}
            </Text>
            <Text style={styles.statLbl}>Points</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Difficulty filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}>
        {["all", "easy", "medium", "hard", "expert"].map(f => {
          const grad = DIFF_GRAD[f] || ["#3B82F6", "#60A5FA"];
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => { setFilter(f); Haptics.selectionAsync(); }}
              activeOpacity={0.75}
            >
              {active ? (
                <LinearGradient colors={f === "all" ? ["#1D4ED8", "#3B82F6"] : grad} style={styles.filterChipActive}>
                  <Text style={styles.filterChipTextActive}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          style={{ opacity: fadeAnim }}
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => {
            const diff = item.difficulty || "easy";
            const [c1] = DIFF_GRAD[diff] || DIFF_GRAD.easy;
            const hints = (() => { try { return JSON.parse(item.hints || "[]"); } catch { return []; } })();
            return (
              <TouchableOpacity
                style={[styles.card, item.is_solved && { borderColor: "rgba(16,185,129,0.3)" }]}
                onPress={() => { setSelected(item); setFlag(""); Haptics.selectionAsync(); }}
                activeOpacity={0.8}
              >
                {item.is_solved && <LinearGradient colors={["rgba(16,185,129,0.06)", "transparent"]} style={StyleSheet.absoluteFill} />}
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.diffDot, { backgroundColor: c1 }]} />
                    <View style={[styles.diffBadge, { backgroundColor: c1 + "20" }]}>
                      <Text style={[styles.diffText, { color: c1 }]}>{diff.toUpperCase()}</Text>
                    </View>
                    {item.category && (
                      <View style={styles.catBadge}>
                        <Text style={styles.catText}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                  {item.is_solved ? (
                    <View style={styles.solvedBadge}>
                      <Feather name="check-circle" size={14} color="#10B981" />
                      <Text style={styles.solvedText}>Solved</Text>
                    </View>
                  ) : (
                    <LinearGradient colors={DIFF_GRAD[diff] || ["#3B82F6", "#60A5FA"]} style={styles.ptsBadge}>
                      <MaterialCommunityIcons name="star" size={12} color="#FFF" />
                      <Text style={styles.ptsText}>{item.points} pts</Text>
                    </LinearGradient>
                  )}
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                )}
                <View style={styles.cardFooter}>
                  <View style={styles.cardMeta}>
                    <Feather name="users" size={12} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.cardMetaText}>{item.solve_count || 0} solves</Text>
                  </View>
                  {hints.length > 0 && (
                    <View style={styles.cardMeta}>
                      <Feather name="help-circle" size={12} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.cardMetaText}>{hints.length} hints</Text>
                    </View>
                  )}
                  {!item.is_solved && (
                    <Text style={styles.tryNow}>Try Now →</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 16 }}>
              <MaterialCommunityIcons name="flag-outline" size={64} color="rgba(255,255,255,0.08)" />
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontFamily: "Inter_400Regular" }}>No challenges found</Text>
            </View>
          }
        />
      )}

      {/* Challenge Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelected(null)} />
        <View style={styles.modal}>
          <LinearGradient colors={["#0F1A2E", "#0B1120"]} style={{ flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" }}>
            <LinearGradient colors={["rgba(59,130,246,0.12)", "transparent"]} style={{ padding: 24, paddingBottom: 16 }}>
              <View style={styles.modalHdr}>
                <View style={{ flex: 1, gap: 6 }}>
                  {selected?.difficulty && (
                    <View style={[styles.diffBadge, { backgroundColor: (DIFF_GRAD[selected.difficulty]?.[0] || "#3B82F6") + "25", alignSelf: "flex-start" }]}>
                      <Text style={[styles.diffText, { color: DIFF_GRAD[selected.difficulty]?.[0] || "#3B82F6" }]}>
                        {selected.difficulty.toUpperCase()} · {selected.points} pts
                      </Text>
                    </View>
                  )}
                  <Text style={styles.modalTitle}>{selected?.title}</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                  <Feather name="x" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
              {selected?.description && (
                <View style={styles.descCard}>
                  <Text style={styles.descLabel}>Challenge Description</Text>
                  <Text style={styles.descText}>{selected.description}</Text>
                </View>
              )}
              {(() => {
                try {
                  const hints = JSON.parse(selected?.hints || "[]");
                  return hints.length > 0 ? (
                    <View style={styles.hintCard}>
                      <View style={styles.hintHdr}>
                        <Feather name="zap" size={14} color="#F59E0B" />
                        <Text style={styles.hintTitle}>{hints.length} Hint{hints.length > 1 ? "s" : ""}</Text>
                      </View>
                      {hints.map((h: string, i: number) => (
                        <Text key={i} style={styles.hintText}>• {h}</Text>
                      ))}
                    </View>
                  ) : null;
                } catch { return null; }
              })()}
              {!selected?.is_solved ? (
                <View style={styles.flagSection}>
                  <Text style={styles.flagLabel}>Submit Your Flag</Text>
                  <View style={styles.flagRow}>
                    <View style={styles.flagWrap}>
                      <Text style={styles.flagPre}>CTF&#123;</Text>
                      <TextInput
                        style={styles.flagInput}
                        placeholder="your_flag_here"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={flag}
                        onChangeText={setFlag}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <Text style={styles.flagSuf}>&#125;</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (!flag.trim()) { Alert.alert("Error", "Enter the flag"); return; }
                        submitMutation.mutate({ id: selected.id, flag: `CTF{${flag.trim()}}` });
                      }}
                      disabled={submitMutation.isPending || !flag}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={submitMutation.isPending || !flag ? ["#334155", "#334155"] : ["#059669", "#10B981"]}
                        style={styles.submitFlagBtn}
                      >
                        {submitMutation.isPending ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Feather name="send" size={18} color="#FFF" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.solvedCard}>
                  <Feather name="check-circle" size={28} color="#10B981" />
                  <Text style={styles.solvedCardText}>Challenge Solved! 🏆</Text>
                  <Text style={styles.solvedCardSub}>Great work! Points have been added to your account.</Text>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  ctfBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  ctfBadgeText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_700Bold" },
  statsRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14 },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { color: "#FFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  statLbl: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  filterChipText: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter_500Medium" },
  filterChipActive: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  filterChipTextActive: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  card: { backgroundColor: "#0F1A2E", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 10, overflow: "hidden" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  diffDot: { width: 8, height: 8, borderRadius: 4 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  catBadge: { backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter_500Medium" },
  ptsBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  ptsText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_700Bold" },
  solvedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  solvedText: { color: "#10B981", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  cardTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardDesc: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardMetaText: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular" },
  tryNow: { color: "#3B82F6", fontSize: 13, fontFamily: "Inter_600SemiBold", marginLeft: "auto" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  modal: { maxHeight: "85%", backgroundColor: "#0F1A2E", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHdr: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  modalTitle: { color: "#F8FAFC", fontSize: 20, fontFamily: "Inter_700Bold" },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  descCard: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 14, gap: 8 },
  descLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  descText: { color: "#F8FAFC", fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  hintCard: { backgroundColor: "rgba(245,158,11,0.08)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(245,158,11,0.2)", gap: 8 },
  hintHdr: { flexDirection: "row", alignItems: "center", gap: 6 },
  hintTitle: { color: "#F59E0B", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hintText: { color: "#F8FAFC", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  flagSection: { gap: 10 },
  flagLabel: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  flagRow: { flexDirection: "row", gap: 10 },
  flagWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#1E293B", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 10, height: 50 },
  flagPre: { color: "#06B6D4", fontSize: 15, fontFamily: "Inter_700Bold" },
  flagInput: { flex: 1, color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_400Regular", paddingHorizontal: 4 },
  flagSuf: { color: "#06B6D4", fontSize: 15, fontFamily: "Inter_700Bold" },
  submitFlagBtn: { width: 50, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  solvedCard: { alignItems: "center", gap: 10, backgroundColor: "rgba(16,185,129,0.08)", borderRadius: 16, padding: 24, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
  solvedCardText: { color: "#10B981", fontSize: 18, fontFamily: "Inter_700Bold" },
  solvedCardSub: { color: "rgba(255,255,255,0.45)", fontSize: 13, textAlign: "center", fontFamily: "Inter_400Regular" },
});
