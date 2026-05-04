import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

export default function AchievementsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data: myBadges, isLoading: loadingMine } = useQuery({ queryKey: ["my-badges"], queryFn: () => apiFetch("/badges/my-badges") });
  const { data: allBadges, isLoading: loadingAll } = useQuery({ queryKey: ["all-badges"], queryFn: () => apiFetch("/badges") });

  const earnedIds = new Set((myBadges?.badges || []).map((b: any) => b.badge?.id));
  const combined = (allBadges?.badges || []).map((badge: any) => {
    const earned = myBadges?.badges?.find((b: any) => b.badge?.id === badge.id);
    return { badge, earned_at: earned?.earned_at || null };
  });

  const isLoading = loadingMine || loadingAll;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Achievements</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {myBadges?.total_earned || 0} / {allBadges?.badges?.length || 0} badges earned
        </Text>
        {/* Progress bar */}
        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, {
            backgroundColor: colors.primary,
            width: `${Math.min(100, ((myBadges?.total_earned || 0) / (allBadges?.badges?.length || 1)) * 100)}%` as any,
          }]} />
        </View>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={combined}
          keyExtractor={item => item.badge.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const earned = !!item.earned_at;
            return (
              <View style={[styles.card, {
                flex: 1,
                backgroundColor: earned ? colors.card : colors.muted,
                borderColor: earned ? (item.badge.color || colors.primary) : colors.border,
                opacity: earned ? 1 : 0.5,
              }]}>
                <Text style={styles.emoji}>{item.badge.emoji || "🏅"}</Text>
                <Text style={[styles.badgeName, { color: earned ? colors.foreground : colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
                  {item.badge.name}
                </Text>
                <Text style={[styles.badgeDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                  {item.badge.description}
                </Text>
                {earned && item.earned_at && (
                  <View style={[styles.earnedBadge, { backgroundColor: colors.success + "20" }]}>
                    <Feather name="check" size={10} color={colors.success} />
                    <Text style={[styles.earnedText, { color: colors.success, fontFamily: "Inter_600SemiBold" }]}>
                      {new Date(item.earned_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </Text>
                  </View>
                )}
                {item.badge.is_rare ? (
                  <Text style={[styles.rareLabel, { color: "#F59E0B", fontFamily: "Inter_600SemiBold" }]}>RARE</Text>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22 },
  subtitle: { fontSize: 13, marginTop: 2, marginBottom: 10 },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1.5, alignItems: "center", gap: 6 },
  emoji: { fontSize: 32 },
  badgeName: { fontSize: 13, textAlign: "center" },
  badgeDesc: { fontSize: 11, textAlign: "center", lineHeight: 15 },
  earnedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  earnedText: { fontSize: 10 },
  rareLabel: { fontSize: 10 },
});
