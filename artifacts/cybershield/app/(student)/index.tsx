import React, { useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#EF4444",
  high: "#F97316",
  medium: "#EAB308",
  low: "#84CC16",
  info: "#60A5FA",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308",
  under_review: "#60A5FA",
  verified: "#10B981",
  rejected: "#EF4444",
  fraud: "#DC2626",
  escalated: "#8B5CF6",
};

export default function StudentDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch("/dashboard/stats"),
  });

  const stats = data;
  const topPad = insets.top + (isWeb ? 16 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greeting, { fontFamily: "Inter_400Regular" }]}>
                Jai Hind,
              </Text>
              <Text style={[styles.userName, { fontFamily: "Inter_700Bold" }]}>
                {user?.name?.split(" ")[0]}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(student)/profile")} style={styles.avatarBtn}>
              <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
                  {user?.name?.[0]?.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Rank badge */}
          <View style={styles.rankRow}>
            <View style={[styles.rankBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <MaterialCommunityIcons name="trophy" size={14} color="#FCD34D" />
              <Text style={[styles.rankText, { fontFamily: "Inter_600SemiBold" }]}>
                {stats?.national_rank ? `#${stats.national_rank} National` : "Unranked"}
              </Text>
            </View>
            <View style={[styles.rankBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <MaterialCommunityIcons name="star-circle" size={14} color="#FCD34D" />
              <Text style={[styles.rankText, { fontFamily: "Inter_600SemiBold" }]}>
                {stats?.skill_level?.charAt(0).toUpperCase() + (stats?.skill_level?.slice(1) || "")}
              </Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Stats cards */}
            <View style={styles.statsGrid}>
              <StatCard icon="award" label="Points" value={stats?.total_points?.toLocaleString() || "0"} color="#3B82F6" bg="#EFF6FF" colors={colors} />
              <StatCard icon="dollar-sign" label="Wallet" value={`₹${stats?.wallet_balance?.toLocaleString() || "0"}`} color="#10B981" bg="#F0FDF4" colors={colors} />
              <StatCard icon="check-circle" label="Verified" value={stats?.verified_submissions || 0} color="#8B5CF6" bg="#F5F3FF" colors={colors} />
              <StatCard icon="file-text" label="Total Reports" value={stats?.total_submissions || 0} color="#F59E0B" bg="#FFFBEB" colors={colors} />
            </View>

            {/* Quick actions */}
            <SectionHeader title="Quick Actions" colors={colors} />
            <View style={styles.quickActions}>
              <QuickAction icon="upload" label="Submit Bug" onPress={() => router.push("/(student)/submit")} bg="#3B82F6" colors={colors} />
              <QuickAction icon="list" label="My Reports" onPress={() => router.push("/(student)/submissions")} bg="#8B5CF6" colors={colors} />
              <QuickAction icon="trending-up" label="Leaderboard" onPress={() => router.push("/(student)/leaderboard")} bg="#F59E0B" colors={colors} />
              <QuickAction icon="dollar-sign" label="Wallet" onPress={() => router.push("/(student)/wallet")} bg="#10B981" colors={colors} />
              <QuickAction icon="book-open" label="Learn" onPress={() => router.push("/(student)/learn")} bg="#EC4899" colors={colors} />
              <QuickAction icon="briefcase" label="Internships" onPress={() => router.push("/(student)/internships")} bg="#06B6D4" colors={colors} />
            </View>

            {/* Recent alerts */}
            {stats?.recent_alerts?.length > 0 && (
              <>
                <SectionHeader title="Active Threat Alerts" colors={colors} actionLabel="View All" onAction={() => router.push("/(student)/alerts")} />
                {stats.recent_alerts.map((alert: any) => (
                  <AlertCard key={alert.id} alert={alert} colors={colors} />
                ))}
              </>
            )}

            {/* Recent submissions */}
            {stats?.recent_submissions?.length > 0 && (
              <>
                <SectionHeader title="Recent Reports" colors={colors} actionLabel="View All" onAction={() => router.push("/(student)/submissions")} />
                {stats.recent_submissions.map((sub: any) => (
                  <SubmissionCard key={sub.id} sub={sub} colors={colors} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color, bg, colors }: any) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIconBg, { backgroundColor: bg }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress, bg, colors }: any) {
  return (
    <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: bg + "20" }]}>
        <Feather name={icon} size={20} color={bg} />
      </View>
      <Text style={[styles.quickActionLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function AlertCard({ alert, colors }: any) {
  const severityColor = SEVERITY_COLORS[alert.severity] || colors.muted;
  return (
    <View style={[styles.alertCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: severityColor }]}>
      <View style={styles.alertHeader}>
        <View style={[styles.severityBadge, { backgroundColor: severityColor + "20" }]}>
          <Text style={[styles.severityText, { color: severityColor, fontFamily: "Inter_600SemiBold" }]}>
            {alert.severity?.toUpperCase()}
          </Text>
        </View>
        {alert.is_verified ? <Feather name="check-circle" size={14} color="#10B981" /> : null}
      </View>
      <Text style={[styles.alertTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={2}>
        {alert.title}
      </Text>
      {alert.description && (
        <Text style={[styles.alertDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
          {alert.description}
        </Text>
      )}
    </View>
  );
}

function SubmissionCard({ sub, colors }: any) {
  const statusColor = STATUS_COLORS[sub.status] || colors.muted;
  return (
    <TouchableOpacity style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.7}>
      <View style={styles.subHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: statusColor, fontFamily: "Inter_600SemiBold" }]}>
            {sub.status?.replace("_", " ").toUpperCase()}
          </Text>
        </View>
        {sub.severity && (
          <View style={[styles.severitySmall, { backgroundColor: (SEVERITY_COLORS[sub.severity] || "#666") + "20" }]}>
            <Text style={[styles.severitySmallText, { color: SEVERITY_COLORS[sub.severity] || "#666", fontFamily: "Inter_500Medium" }]}>
              {sub.severity}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.subTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
        {sub.title}
      </Text>
      {sub.points_awarded > 0 && (
        <Text style={[styles.subPoints, { color: "#10B981", fontFamily: "Inter_500Medium" }]}>
          +{sub.points_awarded} pts
        </Text>
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title, colors, actionLabel, onAction }: any) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.sectionAction, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  userName: { color: "#FFFFFF", fontSize: 24 },
  avatarBtn: {},
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 18 },
  rankRow: { flexDirection: "row", gap: 10 },
  rankBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  rankText: { color: "#FFFFFF", fontSize: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  statCard: { width: "47%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  statIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 10, marginTop: 8 },
  sectionTitle: { fontSize: 16 },
  sectionAction: { fontSize: 13 },
  quickActions: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  quickAction: { width: "30%", padding: 14, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 8 },
  quickActionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickActionLabel: { fontSize: 12, textAlign: "center" },
  alertCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 14, borderWidth: 1, borderLeftWidth: 4 },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  severityText: { fontSize: 10 },
  alertTitle: { fontSize: 14, marginBottom: 4 },
  alertDesc: { fontSize: 12, lineHeight: 18 },
  subCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  subHeader: { flexDirection: "row", gap: 8, marginBottom: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10 },
  severitySmall: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  severitySmallText: { fontSize: 10 },
  subTitle: { fontSize: 14 },
  subPoints: { fontSize: 13, marginTop: 4 },
});
