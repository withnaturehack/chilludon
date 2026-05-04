import React, { useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";

const MOCK_RESEARCHERS = [
  { rank: 1, name: "Arjun Sharma", college: "IIT Delhi", state: "Delhi", points: 48750, reports: 89, verified: 72, bounty: 245000, badge: "Elite Hunter", badgeColor: "#F59E0B" },
  { rank: 2, name: "Priya Nair", college: "NIT Trichy", state: "Tamil Nadu", points: 42310, reports: 76, verified: 64, bounty: 198000, badge: "Bug Master", badgeColor: "#8B5CF6" },
  { rank: 3, name: "Rahul Gupta", college: "BITS Pilani", state: "Rajasthan", points: 38920, reports: 68, verified: 55, bounty: 175000, badge: "Top Hunter", badgeColor: "#3B82F6" },
  { rank: 4, name: "Kavya Reddy", college: "IIIT Hyderabad", state: "Telangana", points: 31540, reports: 54, verified: 43, bounty: 132000, badge: "Bug Hunter", badgeColor: "#10B981" },
  { rank: 5, name: "Amit Patel", college: "IIT Bombay", state: "Maharashtra", points: 27180, reports: 49, verified: 38, bounty: 98000, badge: "Bug Hunter", badgeColor: "#10B981" },
  { rank: 6, name: "Sneha Iyer", college: "VIT Vellore", state: "Tamil Nadu", points: 19870, reports: 38, verified: 29, bounty: 67000, badge: "Researcher", badgeColor: "#06B6D4" },
  { rank: 7, name: "Vikram Singh", college: "DTU Delhi", state: "Delhi", points: 15340, reports: 31, verified: 22, bounty: 43000, badge: "Researcher", badgeColor: "#06B6D4" },
  { rank: 8, name: "Aisha Khan", college: "AMU Aligarh", state: "Uttar Pradesh", points: 11230, reports: 24, verified: 16, bounty: 28000, badge: "Scout", badgeColor: "#6B7280" },
];

const RANK_COLORS = ["#F59E0B", "#94A3B8", "#CD7C2F"];

export default function ResearchersScreen() {
  const insets = useSafeAreaInsets();
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

  const top3 = MOCK_RESEARCHERS.slice(0, 3);
  const rest = MOCK_RESEARCHERS.slice(3);

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient colors={["#0A1A30", "#112244", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Hall of Fame</Text>
            <Text style={styles.headerSub}>Top security researchers for your programs</Text>
          </View>
          <LinearGradient colors={["#D97706", "#F59E0B"]} style={styles.headerIcon}>
            <MaterialCommunityIcons name="trophy" size={20} color="#FFF" />
          </LinearGradient>
        </View>

        {/* Platform stat */}
        <LinearGradient colors={["rgba(6,182,212,0.12)", "rgba(59,130,246,0.08)"]} style={styles.statStrip}>
          <View style={styles.stripItem}>
            <Text style={styles.stripVal}>10,247</Text>
            <Text style={styles.stripLabel}>Total Researchers</Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.stripItem}>
            <Text style={styles.stripVal}>₹2.4Cr</Text>
            <Text style={styles.stripLabel}>Total Paid Out</Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.stripItem}>
            <Text style={styles.stripVal}>28</Text>
            <Text style={styles.stripLabel}>States</Text>
          </View>
        </LinearGradient>
      </LinearGradient>

      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top 3 Podium */}
        <View style={styles.podiumSection}>
          <Text style={styles.podiumTitle}>Top 3 Researchers</Text>
          <View style={styles.podium}>
            {/* 2nd place */}
            <View style={[styles.podiumCard, { marginTop: 24 }]}>
              <View style={[styles.podiumAvatar, { backgroundColor: "rgba(148,163,184,0.2)", borderColor: "#94A3B8" }]}>
                <Text style={[styles.podiumAvatarText, { color: "#94A3B8" }]}>
                  {top3[1]?.name?.[0]}
                </Text>
              </View>
              <View style={[styles.podiumRank, { backgroundColor: "#94A3B8" }]}>
                <Text style={styles.podiumRankText}>2</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{top3[1]?.name?.split(" ")[0]}</Text>
              <Text style={styles.podiumPoints}>{(top3[1]?.points || 0).toLocaleString()} pts</Text>
              <Text style={styles.podiumBounty}>₹{((top3[1]?.bounty || 0) / 1000).toFixed(0)}k</Text>
            </View>

            {/* 1st place */}
            <View style={[styles.podiumCard, { transform: [{ scale: 1.08 }] }]}>
              <LinearGradient colors={["rgba(245,158,11,0.15)", "transparent"]} style={StyleSheet.absoluteFill} />
              <View style={[styles.podiumAvatar, { backgroundColor: "rgba(245,158,11,0.2)", borderColor: "#F59E0B", width: 60, height: 60, borderRadius: 30 }]}>
                <Text style={[styles.podiumAvatarText, { color: "#F59E0B", fontSize: 22 }]}>
                  {top3[0]?.name?.[0]}
                </Text>
              </View>
              <MaterialCommunityIcons name="crown" size={16} color="#F59E0B" style={{ marginTop: -6 }} />
              <View style={[styles.podiumRank, { backgroundColor: "#F59E0B", width: 28, height: 28 }]}>
                <Text style={[styles.podiumRankText, { fontSize: 14 }]}>1</Text>
              </View>
              <Text style={[styles.podiumName, { color: "#F59E0B" }]} numberOfLines={1}>{top3[0]?.name?.split(" ")[0]}</Text>
              <Text style={[styles.podiumPoints, { color: "#F59E0B" }]}>{(top3[0]?.points || 0).toLocaleString()} pts</Text>
              <Text style={styles.podiumBounty}>₹{((top3[0]?.bounty || 0) / 1000).toFixed(0)}k</Text>
            </View>

            {/* 3rd place */}
            <View style={[styles.podiumCard, { marginTop: 36 }]}>
              <View style={[styles.podiumAvatar, { backgroundColor: "rgba(205,124,47,0.2)", borderColor: "#CD7C2F" }]}>
                <Text style={[styles.podiumAvatarText, { color: "#CD7C2F" }]}>
                  {top3[2]?.name?.[0]}
                </Text>
              </View>
              <View style={[styles.podiumRank, { backgroundColor: "#CD7C2F" }]}>
                <Text style={styles.podiumRankText}>3</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{top3[2]?.name?.split(" ")[0]}</Text>
              <Text style={styles.podiumPoints}>{(top3[2]?.points || 0).toLocaleString()} pts</Text>
              <Text style={styles.podiumBounty}>₹{((top3[2]?.bounty || 0) / 1000).toFixed(0)}k</Text>
            </View>
          </View>
        </View>

        {/* Full Leaderboard */}
        <Text style={styles.leaderboardTitle}>Full Leaderboard</Text>
        {MOCK_RESEARCHERS.map((r) => (
          <View key={r.rank} style={styles.researcherCard}>
            {r.rank <= 3 && (
              <LinearGradient
                colors={[RANK_COLORS[r.rank - 1] + "10", "transparent"]}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={[styles.rankBadge, { backgroundColor: r.rank <= 3 ? RANK_COLORS[r.rank - 1] + "20" : "rgba(255,255,255,0.05)" }]}>
              <Text style={[styles.rankNum, { color: r.rank <= 3 ? RANK_COLORS[r.rank - 1] : "rgba(255,255,255,0.4)" }]}>#{r.rank}</Text>
            </View>

            <View style={styles.researcherInfo}>
              <View style={styles.researcherRow}>
                <Text style={styles.researcherName}>{r.name}</Text>
                <View style={[styles.badgeTag, { backgroundColor: r.badgeColor + "20" }]}>
                  <Text style={[styles.badgeTagText, { color: r.badgeColor }]}>{r.badge}</Text>
                </View>
              </View>
              <Text style={styles.researcherCollege}>{r.college} · {r.state}</Text>
              <View style={styles.researcherStats}>
                <View style={styles.statItem}>
                  <Feather name="file-text" size={11} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.statText}>{r.reports} reports</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="check-circle" size={11} color="#10B981" />
                  <Text style={[styles.statText, { color: "#10B981" }]}>{r.verified} verified</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="cash" size={11} color="#06B6D4" />
                  <Text style={[styles.statText, { color: "#06B6D4" }]}>₹{(r.bounty / 1000).toFixed(0)}k</Text>
                </View>
              </View>
            </View>

            <Text style={styles.researcherPoints}>{(r.points / 1000).toFixed(1)}k</Text>
          </View>
        ))}

        <View style={styles.inviteCard}>
          <LinearGradient colors={["rgba(6,182,212,0.1)", "rgba(59,130,246,0.05)"]} style={StyleSheet.absoluteFill} />
          <MaterialCommunityIcons name="account-plus-outline" size={20} color="#06B6D4" />
          <View style={{ flex: 1 }}>
            <Text style={styles.inviteTitle}>Invite More Researchers</Text>
            <Text style={styles.inviteDesc}>
              Share your bounty program link with ethical hackers to receive more vulnerability reports.
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  headerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statStrip: { flexDirection: "row", borderRadius: 12, padding: 12, gap: 12 },
  stripItem: { flex: 1, alignItems: "center", gap: 2 },
  stripVal: { color: "#06B6D4", fontSize: 18, fontFamily: "Inter_700Bold" },
  stripLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_400Regular" },
  stripDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  podiumSection: { backgroundColor: "#0F1A2E", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  podiumTitle: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 16, textAlign: "center" },
  podium: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", gap: 12 },
  podiumCard: { flex: 1, alignItems: "center", gap: 4, padding: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  podiumAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  podiumAvatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  podiumRank: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginTop: -4 },
  podiumRankText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_700Bold" },
  podiumName: { color: "#F8FAFC", fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  podiumPoints: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Inter_500Medium" },
  podiumBounty: { color: "#10B981", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  leaderboardTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  researcherCard: { backgroundColor: "#0F1A2E", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", flexDirection: "row", alignItems: "center", gap: 10, overflow: "hidden" },
  rankBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rankNum: { fontSize: 12, fontFamily: "Inter_700Bold" },
  researcherInfo: { flex: 1, gap: 3 },
  researcherRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  researcherName: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  badgeTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeTagText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  researcherCollege: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular" },
  researcherStats: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 2 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular" },
  researcherPoints: { color: "#06B6D4", fontSize: 16, fontFamily: "Inter_700Bold" },
  inviteCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(6,182,212,0.2)", overflow: "hidden" },
  inviteTitle: { color: "#06B6D4", fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  inviteDesc: { color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular" },
});
