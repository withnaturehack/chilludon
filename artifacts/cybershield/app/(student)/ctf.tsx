import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, Platform,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const DIFF_COLORS: Record<string, string> = {
  easy: "#10B981",
  medium: "#EAB308",
  hard: "#F97316",
  expert: "#EF4444",
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

  const { data, isLoading } = useQuery({
    queryKey: ["ctf-challenges"],
    queryFn: () => apiFetch("/ctf"),
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, flag }: { id: string; flag: string }) =>
      apiFetch(`/ctf/${id}/submit`, { method: "POST", body: JSON.stringify({ flag }) }),
    onSuccess: (res, { id }) => {
      qc.invalidateQueries({ queryKey: ["ctf-challenges"] });
      if (res.correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Correct!", res.message, [{ text: "Awesome!", onPress: () => { setSelected(null); setFlag(""); } }]);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Wrong Flag", "Keep trying! Use the hints for guidance.");
      }
    },
    onError: () => Alert.alert("Error", "Failed to submit flag"),
  });

  const challenges = data?.challenges || [];
  const filtered = filter === "all" ? challenges : challenges.filter((c: any) => c.difficulty === filter);

  const topPad = insets.top + (isWeb ? 16 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          CTF Challenges
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Solve challenges, earn points
        </Text>
        {/* Filters */}
        <View style={styles.filters}>
          {["all", "easy", "medium", "hard", "expert"].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, { backgroundColor: filter === f ? colors.primary : colors.card, borderColor: filter === f ? colors.primary : colors.border }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, { color: filter === f ? "#FFF" : colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const diffColor = DIFF_COLORS[item.difficulty] || colors.muted;
            const hints = JSON.parse(item.hints || "[]");
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { setSelected(item); setFlag(""); Haptics.selectionAsync(); }}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardBadges}>
                    <View style={[styles.diffBadge, { backgroundColor: diffColor + "20", borderColor: diffColor }]}>
                      <Text style={[styles.diffText, { color: diffColor, fontFamily: "Inter_600SemiBold" }]}>
                        {item.difficulty?.toUpperCase()}
                      </Text>
                    </View>
                    {item.category && (
                      <View style={[styles.catBadge, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.catText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                          {item.category}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.pointsRow}>
                    <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
                    <Text style={[styles.points, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                      {item.points} pts
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {item.title}
                </Text>
                {item.description && (
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.cardFooter}>
                  <Text style={[styles.solveCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {item.solve_count} solves
                  </Text>
                  <View style={[styles.hintCount, { backgroundColor: colors.muted }]}>
                    <Feather name="help-circle" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.hintText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {hints.length} hints
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="flag-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                No challenges found
              </Text>
            </View>
          }
        />
      )}

      {/* Challenge modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]} numberOfLines={2}>
                {selected?.title}
              </Text>
              <TouchableOpacity onPress={() => { setSelected(null); setFlag(""); }}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={[styles.diffRow, { backgroundColor: (DIFF_COLORS[selected?.difficulty] || "#666") + "20" }]}>
              <Text style={[styles.diffLabel, { color: DIFF_COLORS[selected?.difficulty] || "#666", fontFamily: "Inter_600SemiBold" }]}>
                {selected?.difficulty?.toUpperCase()} · {selected?.points} POINTS
              </Text>
            </View>

            {selected?.description && (
              <Text style={[styles.modalDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {selected.description}
              </Text>
            )}

            {/* Hints */}
            {JSON.parse(selected?.hints || "[]").length > 0 && (
              <View>
                <Text style={[styles.hintsTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Hints:</Text>
                {JSON.parse(selected?.hints || "[]").map((h: string, i: number) => (
                  <View key={i} style={[styles.hint, { backgroundColor: colors.muted }]}>
                    <Feather name="help-circle" size={14} color={colors.primary} />
                    <Text style={[styles.hintItem, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{h}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Flag submission */}
            <Text style={[styles.flagLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Submit Flag:
            </Text>
            <View style={[styles.flagInput, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.flagPrefix, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>CTF&#123;</Text>
              <TextInput
                style={[styles.flagTextInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="your_flag_here"
                placeholderTextColor={colors.mutedForeground}
                value={flag}
                onChangeText={setFlag}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.flagSuffix, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>&#125;</Text>
            </View>

            <TouchableOpacity
              style={[styles.submitFlagBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (!flag.trim()) { Alert.alert("Error", "Enter the flag"); return; }
                submitMutation.mutate({ id: selected.id, flag: `CTF{${flag.trim()}}` });
              }}
              disabled={submitMutation.isPending}
              activeOpacity={0.8}
            >
              {submitMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={[styles.submitFlagText, { fontFamily: "Inter_600SemiBold" }]}>Submit Flag</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 22 },
  subtitle: { fontSize: 13, marginTop: 2, marginBottom: 12 },
  filters: { flexDirection: "row", gap: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardBadges: { flexDirection: "row", gap: 8 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  diffText: { fontSize: 10 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 10 },
  pointsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  points: { fontSize: 16 },
  cardTitle: { fontSize: 15 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  solveCount: { fontSize: 12 },
  hintCount: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  hintText: { fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24, gap: 14 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { flex: 1, fontSize: 18, marginRight: 12 },
  diffRow: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  diffLabel: { fontSize: 12 },
  modalDesc: { fontSize: 14, lineHeight: 20 },
  hintsTitle: { fontSize: 14, marginBottom: 8 },
  hint: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 8, marginBottom: 6 },
  hintItem: { flex: 1, fontSize: 13 },
  flagLabel: { fontSize: 14 },
  flagInput: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 50 },
  flagPrefix: { fontSize: 15 },
  flagTextInput: { flex: 1, fontSize: 15, paddingHorizontal: 4 },
  flagSuffix: { fontSize: 15 },
  submitFlagBtn: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  submitFlagText: { color: "#FFF", fontSize: 16 },
});
