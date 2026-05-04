import React, { useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform, Animated, Dimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";

const { width } = Dimensions.get("window");

const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16", info: "#60A5FA",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308", under_review: "#60A5FA", verified: "#10B981",
  rejected: "#EF4444", fraud: "#DC2626", escalated: "#8B5CF6",
};

const QUICK_ACTIONS = [
  { icon: "upload", label: "Submit Bug", path: "/(student)/submit", grad: ["#1D4ED8", "#3B82F6"] },
  { icon: "list", label: "My Reports", path: "/(student)/submissions", grad: ["#7C3AED", "#8B5CF6"] },
  { icon: "trending-up", label: "Rankings", path: "/(student)/leaderboard", grad: ["#D97706", "#F59E0B"] },
  { icon: "dollar-sign", label: "Wallet", path: "/(student)/wallet", grad: ["#059669", "#10B981"] },
  { icon: "book-open", label: "Learn", path: "/(student)/learn", grad: ["#DB2777", "#EC4899"] },
  { icon: "briefcase", label: "Jobs", path: "/(student)/internships", grad: ["#0891B2", "#06B6D4"] },
];

export default function StudentDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardsSlide = useRef(new Animated.Value(30)).current;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch("/dashboard/stats"),
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(cardsSlide, { toValue: 0, duration: 900, useNativeDriver: true, delay: 200 }),
    ]).start();
  }, []);

  const stats = data;
  const topPad = insets.top + (isWeb ? 16 : 0);

  const STAT_CARDS = [
    { label: "Points", value: (stats?.total_points || 0).toLocaleString(), icon: "zap", color: "#3B82F6", sub: "Total earned" },
    { label: "Wallet", value: `₹${(stats?.wallet_balance || 0).toLocaleString()}`, icon: "dollar-sign", color: "#10B981", sub: "Available" },
    { label: "Reports", value: stats?.total_submissions || 0, icon: "file-text", color: "#8B5CF6", sub: "Submitted" },
    { label: "Badges", value: stats?.badge_count || 0, icon: "award", color: "#F59E0B", sub: "Earned" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Header */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerSlide }] }}>
          <LinearGradient
            colors={["#0F2040", "#1A3A6B", "#0B1A35"]}
            style={[styles.header, { paddingTop: topPad + 20 }]}
          >
            {/* Decorative circles */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>Jai Hind 🇮🇳</Text>
                <Text style={styles.userName}>{user?.name?.split(" ")[0] || "Warrior"}</Text>
                <View style={styles.rankRow}>
                  <View style={styles.rankBadge}>
                    <MaterialCommunityIcons name="trophy" size={12} color="#FCD34D" />
                    <Text style={styles.rankText}>
                      {stats?.national_rank ? `#${stats.national_rank} India` : "Unranked"}
                    </Text>
                  </View>
                  <View style={[styles.rankBadge, { backgroundColor: "rgba(16,185,129,0.2)" }]}>
                    <MaterialCommunityIcons name="star-circle" size={12} color="#10B981" />
                    <Text style={[styles.rankText, { color: "#10B981" }]}>
                      {stats?.skill_level ? stats.skill_level.charAt(0).toUpperCase() + stats.skill_level.slice(1) : "Beginner"}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push("/(student)/profile")} activeOpacity={0.8}>
                <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.avatarBtn}>
                  <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "U"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Points highlight bar */}
            <LinearGradient colors={["rgba(59,130,246,0.25)", "rgba(6,182,212,0.15)"]} style={styles.pointsBar}>
              <View style={styles.pointsBarItem}>
                <Text style={styles.pointsBarVal}>{(stats?.total_points || 0).toLocaleString()}</Text>
                <Text style={styles.pointsBarLabel}>Points</Text>
              </View>
              <View style={styles.pointsBarDivider} />
              <View style={styles.pointsBarItem}>
                <Text style={styles.pointsBarVal}>₹{(stats?.wallet_balance || 0).toLocaleString()}</Text>
                <Text style={styles.pointsBarLabel}>Balance</Text>
              </View>
              <View style={styles.pointsBarDivider} />
              <View style={styles.pointsBarItem}>
                <Text style={styles.pointsBarVal}>{stats?.total_submissions || 0}</Text>
                <Text style={styles.pointsBarLabel}>Reports</Text>
              </View>
              <View style={styles.pointsBarDivider} />
              <View style={styles.pointsBarItem}>
                <Text style={styles.pointsBarVal}>{stats?.badge_count || 0}</Text>
                <Text style={styles.pointsBarLabel}>Badges</Text>
              </View>
            </LinearGradient>
          </LinearGradient>
        </Animated.View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} size="large" />
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: cardsSlide }] }}>
            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
              <TouchableOpacity onPress={() => router.push("/(student)/more")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsGrid}>
              {QUICK_ACTIONS.map((action, i) => (
                <TouchableOpacity
                  key={action.label}
                  style={styles.actionCard}
                  onPress={() => router.push(action.path as any)}
                  activeOpacity={0.75}
                >
                  <LinearGradient colors={action.grad as any} style={styles.actionIconBg}>
                    <Feather name={action.icon as any} size={20} color="#FFF" />
                  </LinearGradient>
                  <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Threat Alerts */}
            {stats?.recent_alerts?.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <View style={[styles.alertDot, { backgroundColor: "#EF4444" }]} />
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Live Threat Alerts</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push("/(student)/alerts")}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>View all</Text>
                  </TouchableOpacity>
                </View>
                {stats.recent_alerts.map((alert: any) => {
                  const sc = SEV_COLORS[alert.severity] || "#666";
                  return (
                    <TouchableOpacity
                      key={alert.id}
                      style={[styles.alertCard, { backgroundColor: colors.card, borderLeftColor: sc }]}
                      onPress={() => router.push("/(student)/alerts")}
                      activeOpacity={0.8}
                    >
                      <View style={styles.alertTop}>
                        <View style={[styles.sevBadge, { backgroundColor: sc + "20" }]}>
                          <Text style={[styles.sevText, { color: sc }]}>{alert.severity?.toUpperCase()}</Text>
                        </View>
                        {alert.is_verified ? (
                          <View style={styles.verifiedBadge}>
                            <Feather name="check-circle" size={11} color="#10B981" />
                            <Text style={styles.verifiedText}>CERT-In</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[styles.alertTitle, { color: colors.foreground }]} numberOfLines={2}>{alert.title}</Text>
                      {alert.description && (
                        <Text style={[styles.alertDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{alert.description}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* Recent Reports */}
            {stats?.recent_submissions?.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Reports</Text>
                  <TouchableOpacity onPress={() => router.push("/(student)/submissions")}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>View all</Text>
                  </TouchableOpacity>
                </View>
                {stats.recent_submissions.map((sub: any) => {
                  const sc = STATUS_COLORS[sub.status] || "#666";
                  const sevc = SEV_COLORS[sub.severity] || "#666";
                  return (
                    <TouchableOpacity
                      key={sub.id}
                      style={[styles.subCard, { backgroundColor: colors.card }]}
                      onPress={() => router.push("/(student)/submissions")}
                      activeOpacity={0.8}
                    >
                      <View style={styles.subTop}>
                        <View style={[styles.statusPill, { backgroundColor: sc + "20" }]}>
                          <Text style={[styles.statusText, { color: sc }]}>{sub.status?.replace(/_/g, " ").toUpperCase()}</Text>
                        </View>
                        {sub.severity && (
                          <View style={[styles.statusPill, { backgroundColor: sevc + "15" }]}>
                            <Text style={[styles.statusText, { color: sevc }]}>{sub.severity}</Text>
                          </View>
                        )}
                        {sub.points_awarded > 0 && (
                          <View style={[styles.statusPill, { backgroundColor: "#10B98120" }]}>
                            <Text style={[styles.statusText, { color: "#10B981" }]}>+{sub.points_awarded} pts</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.subTitle, { color: colors.foreground }]} numberOfLines={1}>{sub.title}</Text>
                      <Text style={[styles.subDate, { color: colors.mutedForeground }]}>
                        {new Date(sub.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        {sub.category ? ` · ${sub.category}` : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* Daily Mission Card */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Missions</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/(student)/submit")}>
              <LinearGradient colors={["#0F2040", "#1A3A6B"]} style={styles.missionCard}>
                <View style={styles.missionTop}>
                  <MaterialCommunityIcons name="target" size={24} color="#06B6D4" />
                  <View style={[styles.missionBadge]}>
                    <Text style={styles.missionBadgeText}>+50 pts</Text>
                  </View>
                </View>
                <Text style={styles.missionTitle}>Submit Your First Report Today</Text>
                <Text style={styles.missionDesc}>Find and report a vulnerability to earn bonus points and move up the leaderboard.</Text>
                <View style={styles.missionFooter}>
                  <View style={styles.missionProgress}>
                    <View style={[styles.missionProgressFill, { width: `${Math.min(100, (stats?.total_submissions || 0) > 0 ? 100 : 0)}%` }]} />
                  </View>
                  <Text style={styles.missionProgressText}>
                    {stats?.total_submissions > 0 ? "Completed!" : "0/1 done"}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, overflow: "hidden" },
  decorCircle1: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(59,130,246,0.08)", top: -60, right: -40 },
  decorCircle2: { position: "absolute", width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(6,182,212,0.06)", bottom: -30, left: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerLeft: { gap: 4 },
  greeting: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_400Regular" },
  userName: { color: "#FFFFFF", fontSize: 26, fontFamily: "Inter_700Bold" },
  rankRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  rankBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(252,211,77,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  rankText: { color: "#FCD34D", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  avatarBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  avatarText: { color: "#FFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  pointsBar: { flexDirection: "row", borderRadius: 16, padding: 16, marginTop: 4 },
  pointsBarItem: { flex: 1, alignItems: "center", gap: 3 },
  pointsBarVal: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  pointsBarLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "Inter_400Regular" },
  pointsBarDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 4 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10 },
  actionCard: { width: (width - 48 - 30) / 3, backgroundColor: "#0F1A2E", borderRadius: 16, padding: 14, alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  actionIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  alertCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 4, gap: 8 },
  alertTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedText: { color: "#10B981", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  alertTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  alertDesc: { fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular" },
  subCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 6 },
  subTop: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  subTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  subDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  missionCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(59,130,246,0.2)", overflow: "hidden", gap: 10 },
  missionTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  missionBadge: { backgroundColor: "#06B6D420", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  missionBadgeText: { color: "#06B6D4", fontSize: 12, fontFamily: "Inter_700Bold" },
  missionTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_700Bold" },
  missionDesc: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  missionFooter: { flexDirection: "row", alignItems: "center", gap: 12 },
  missionProgress: { flex: 1, height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" },
  missionProgressFill: { height: 4, backgroundColor: "#06B6D4", borderRadius: 2 },
  missionProgressText: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Inter_500Medium" },
});
