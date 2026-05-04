import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";

const LEVEL_GRADS: Record<string, [string, string]> = {
  beginner: ["#059669", "#10B981"],
  intermediate: ["#1D4ED8", "#3B82F6"],
  advanced: ["#7C3AED", "#8B5CF6"],
  expert: ["#DC2626", "#EF4444"],
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const { user, logout } = useAuth();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: () => apiFetch("/profile") });

  const profile = data?.user || user;
  const [lc1, lc2] = LEVEL_GRADS[profile?.skill_level || "beginner"] || LEVEL_GRADS.beginner;

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#0F2040", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View style={styles.decorCircle} />
          <View style={styles.decorCircle2} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <View style={styles.avatarSection}>
            <LinearGradient colors={["#1D4ED8", "#3B82F6", "#06B6D4"]} style={styles.avatar}>
              <Text style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase()}</Text>
            </LinearGradient>
            <Text style={styles.name}>{profile?.name}</Text>
            <Text style={styles.email}>{profile?.email}</Text>
            {profile?.college_name && (
              <View style={styles.collegeRow}>
                <Feather name="book" size={12} color="rgba(255,255,255,0.5)" />
                <Text style={styles.college}>{profile.college_name}{profile.state ? `, ${profile.state}` : ""}</Text>
              </View>
            )}
          </View>
          <View style={styles.statsRow}>
            <StatItem label="Rank" value={profile?.national_rank ? `#${profile.national_rank}` : "—"} color="#FCD34D" />
            <View style={styles.statDivider} />
            <StatItem label="Points" value={(profile?.total_points || 0).toLocaleString()} color="#60A5FA" />
            <View style={styles.statDivider} />
            <StatItem label="Reports" value={data?.submission_count || 0} color="#10B981" />
            <View style={styles.statDivider} />
            <StatItem label="Badges" value={data?.badge_count || 0} color="#F59E0B" />
          </View>
        </LinearGradient>

        {isLoading ? (
          <ActivityIndicator color="#3B82F6" style={{ marginTop: 40 }} size="large" />
        ) : (
          <Animated.View style={[{ opacity: fadeAnim }, { padding: 16, gap: 14 }]}>
            {/* Skill Level Card */}
            <View style={styles.card}>
              <LinearGradient colors={[lc1 + "10", "transparent"]} style={StyleSheet.absoluteFill} />
              <Text style={styles.cardTitle}>Skill Level</Text>
              <View style={[styles.lvlRow, { borderColor: lc1 + "30" }]}>
                <LinearGradient colors={[lc1, lc2]} style={styles.lvlIcon}>
                  <MaterialCommunityIcons name="star-circle" size={20} color="#FFF" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lvlName, { color: lc1 }]}>
                    {profile?.skill_level?.charAt(0).toUpperCase() + (profile?.skill_level?.slice(1) || "Beginner")}
                  </Text>
                  <Text style={styles.lvlScore}>
                    Skill Score: {profile?.skill_score || 0} · {data?.verified_count || 0} verified submissions
                  </Text>
                </View>
              </View>
              {/* Progress to next level */}
              <View style={styles.progressWrap}>
                <View style={styles.progressBg}>
                  <LinearGradient colors={[lc1, lc2]} style={[styles.progressFill, { width: `${Math.min(100, ((profile?.skill_score || 0) % 100))}%` as any }]} />
                </View>
                <Text style={styles.progressText}>Progress to next level</Text>
              </View>
            </View>

            {/* Recent Badges */}
            {data?.recent_badges?.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Recent Badges</Text>
                  <TouchableOpacity onPress={() => router.push("/(student)/achievements")}>
                    <Text style={styles.viewAll}>View All →</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.badgesRow}>
                  {data.recent_badges.map((b: any) => (
                    <View key={b.badge?.id} style={[styles.badgeItem, { borderColor: (b.badge?.color || "#3B82F6") + "40" }]}>
                      <Text style={styles.badgeEmoji}>{b.badge?.emoji || "🏅"}</Text>
                      <Text style={[styles.badgeName, { color: b.badge?.color || "#3B82F6" }]} numberOfLines={1}>
                        {b.badge?.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bio */}
            {profile?.bio && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>About</Text>
                <Text style={styles.bio}>{profile.bio}</Text>
              </View>
            )}

            {/* Links */}
            {(profile?.github_url || profile?.linkedin_url) && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Links</Text>
                {profile.github_url && (
                  <View style={styles.linkRow}>
                    <View style={styles.linkIcon}>
                      <Feather name="github" size={16} color="#F8FAFC" />
                    </View>
                    <Text style={styles.linkText} numberOfLines={1}>{profile.github_url}</Text>
                  </View>
                )}
                {profile.linkedin_url && (
                  <View style={styles.linkRow}>
                    <View style={[styles.linkIcon, { backgroundColor: "#0A66C2" }]}>
                      <Feather name="linkedin" size={16} color="#FFF" />
                    </View>
                    <Text style={styles.linkText} numberOfLines={1}>{profile.linkedin_url}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Logout */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => Alert.alert("Logout", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: logout },
              ])}
              activeOpacity={0.8}
            >
              <Feather name="log-out" size={18} color="#EF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function StatItem({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24, overflow: "hidden" },
  decorCircle: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(59,130,246,0.06)", top: -60, right: -30 },
  decorCircle2: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(6,182,212,0.04)", bottom: 0, left: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  avatarSection: { alignItems: "center", gap: 8, marginBottom: 20 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", marginBottom: 4, borderWidth: 3, borderColor: "rgba(255,255,255,0.15)" },
  avatarText: { color: "#FFF", fontSize: 34, fontFamily: "Inter_700Bold" },
  name: { color: "#FFFFFF", fontSize: 24, fontFamily: "Inter_700Bold" },
  email: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular" },
  collegeRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  college: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14 },
  statItem: { alignItems: "center", gap: 4 },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 4 },
  card: { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 12, backgroundColor: "#0F1A2E", overflow: "hidden" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  viewAll: { color: "#3B82F6", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  lvlRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.02)" },
  lvlIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  lvlName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  lvlScore: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  progressWrap: { gap: 5 },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular" },
  badgesRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  badgeItem: { alignItems: "center", gap: 5, padding: 10, borderRadius: 12, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.02)", minWidth: 64 },
  badgeEmoji: { fontSize: 28 },
  badgeName: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  bio: { color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  linkIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#24292E", alignItems: "center", justifyContent: "center" },
  linkText: { color: "#3B82F6", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 50, borderRadius: 14, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", backgroundColor: "rgba(239,68,68,0.08)" },
  logoutText: { color: "#EF4444", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
