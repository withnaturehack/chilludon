import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, TouchableOpacity, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

export default function AchievementsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const { data: myBadges, isLoading: loadingMine } = useQuery({ queryKey: ["my-badges"], queryFn: () => apiFetch("/badges/my-badges") });
  const { data: allBadges, isLoading: loadingAll } = useQuery({ queryKey: ["all-badges"], queryFn: () => apiFetch("/badges") });

  const combined = (allBadges?.badges || []).map((badge: any) => {
    const earned = myBadges?.badges?.find((b: any) => b.badge?.id === badge.id);
    return { badge, earned_at: earned?.earned_at || null };
  });

  const earnedCount = myBadges?.total_earned || 0;
  const totalCount = allBadges?.badges?.length || 0;
  const progress = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;
  const isLoading = loadingMine || loadingAll;

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0F2040", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient colors={["#D97706", "#F59E0B"]} style={styles.awardBg}>
            <MaterialCommunityIcons name="medal" size={24} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Achievements</Text>
            <Text style={styles.headerSub}>
              {earnedCount} / {totalCount} badges earned
            </Text>
          </View>
        </View>
        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressFill, { width: `${progress}%` as any }]}>
              <LinearGradient colors={["#1D4ED8", "#3B82F6", "#06B6D4"]} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          data={combined}
          keyExtractor={item => item.badge.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const earned = !!item.earned_at;
            const borderColor = earned ? (item.badge.color || "#3B82F6") : "rgba(255,255,255,0.05)";
            return (
              <View style={[styles.card, { borderColor, flex: 1 }]}>
                {earned && <LinearGradient colors={[(item.badge.color || "#3B82F6") + "15", "transparent"]} style={StyleSheet.absoluteFill} />}
                {!earned && <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 16 }]} />}
                {item.badge.is_rare && earned && (
                  <View style={styles.rareBadge}>
                    <Text style={styles.rareText}>RARE</Text>
                  </View>
                )}
                <Text style={[styles.emoji, { opacity: earned ? 1 : 0.3 }]}>{item.badge.emoji || "🏅"}</Text>
                <Text style={[styles.badgeName, { color: earned ? "#F8FAFC" : "rgba(255,255,255,0.35)" }]}>
                  {item.badge.name}
                </Text>
                <Text style={[styles.badgeDesc, { opacity: earned ? 0.6 : 0.3 }]} numberOfLines={2}>
                  {item.badge.description}
                </Text>
                {earned && item.earned_at && (
                  <View style={[styles.earnedBadge, { backgroundColor: (item.badge.color || "#3B82F6") + "20" }]}>
                    <Feather name="check-circle" size={10} color={item.badge.color || "#3B82F6"} />
                    <Text style={[styles.earnedText, { color: item.badge.color || "#3B82F6" }]}>
                      {new Date(item.earned_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </Text>
                  </View>
                )}
                {!earned && (
                  <View style={styles.lockedBadge}>
                    <Feather name="lock" size={12} color="rgba(255,255,255,0.25)" />
                    <Text style={styles.lockedText}>Locked</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  awardBg: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  progressWrap: { gap: 6 },
  progressBg: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressText: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_500Medium" },
  card: { padding: 16, borderRadius: 16, borderWidth: 1.5, alignItems: "center", gap: 8, backgroundColor: "#0F1A2E", overflow: "hidden" },
  rareBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(245,158,11,0.2)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  rareText: { color: "#F59E0B", fontSize: 9, fontFamily: "Inter_700Bold" },
  emoji: { fontSize: 36 },
  badgeName: { fontSize: 13, fontFamily: "Inter_700Bold", textAlign: "center" },
  badgeDesc: { color: "rgba(255,255,255,0.6)", fontSize: 11, textAlign: "center", lineHeight: 15, fontFamily: "Inter_400Regular" },
  earnedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  earnedText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  lockedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  lockedText: { color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "Inter_400Regular" },
});
