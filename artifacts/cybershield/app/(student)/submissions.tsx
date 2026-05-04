import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308", under_review: "#60A5FA", verified: "#10B981",
  rejected: "#EF4444", fraud: "#DC2626", escalated: "#8B5CF6",
};
const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16", info: "#60A5FA",
};

export default function SubmissionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["my-submissions"],
    queryFn: () => apiFetch("/submissions?limit=50"),
  });

  const submissions = data?.submissions || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>My Reports</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {data?.total || 0} total submissions
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] || "#666";
            const sevc = SEV_COLORS[item.severity] || "#666";
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: sc }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, { backgroundColor: sc + "20" }]}>
                    <Text style={[styles.badgeText, { color: sc, fontFamily: "Inter_600SemiBold" }]}>
                      {item.status?.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>
                  {item.severity && (
                    <View style={[styles.badge, { backgroundColor: sevc + "20" }]}>
                      <Text style={[styles.badgeText, { color: sevc, fontFamily: "Inter_600SemiBold" }]}>{item.severity}</Text>
                    </View>
                  )}
                  {item.points_awarded > 0 && (
                    <View style={[styles.badge, { backgroundColor: "#10B981" + "20" }]}>
                      <Text style={[styles.badgeText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>+{item.points_awarded} pts</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{item.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                  {item.description}
                </Text>
                {item.reviewer_notes && (
                  <View style={[styles.reviewNote, { backgroundColor: colors.muted }]}>
                    <Feather name="message-circle" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.reviewNoteText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {item.reviewer_notes}
                    </Text>
                  </View>
                )}
                <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  {item.category && ` · ${item.category}`}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="file-text" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>No submissions yet</Text>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(student)/submit")}
              >
                <Text style={[styles.submitBtnText, { fontFamily: "Inter_600SemiBold" }]}>Submit Your First Report</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22 },
  subtitle: { fontSize: 13, marginTop: 2 },
  card: { borderRadius: 16, padding: 14, borderWidth: 1, borderLeftWidth: 4, gap: 8 },
  cardHeader: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10 },
  cardTitle: { fontSize: 15 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  reviewNote: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 8, borderRadius: 8 },
  reviewNoteText: { flex: 1, fontSize: 12 },
  date: { fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 60, gap: 16 },
  emptyText: { fontSize: 15 },
  submitBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  submitBtnText: { color: "#FFF", fontSize: 15 },
});
