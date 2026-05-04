import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#10B981", intermediate: "#3B82F6", advanced: "#8B5CF6", expert: "#EF4444",
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const { user, logout } = useAuth();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: () => apiFetch("/profile") });

  const profile = data?.user || user;
  const lc = LEVEL_COLORS[profile?.skill_level || "beginner"] || colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Feather name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>{profile?.name?.[0]?.toUpperCase()}</Text>
            </View>
            <Text style={[styles.name, { fontFamily: "Inter_700Bold" }]}>{profile?.name}</Text>
            <Text style={[styles.email, { fontFamily: "Inter_400Regular" }]}>{profile?.email}</Text>
            {profile?.college_name && (
              <Text style={[styles.college, { fontFamily: "Inter_400Regular" }]}>
                {profile.college_name}{profile.state ? `, ${profile.state}` : ""}
              </Text>
            )}
          </View>

          {/* Badges row */}
          <View style={styles.statsRow}>
            <StatItem label="Rank" value={profile?.national_rank ? `#${profile.national_rank}` : "—"} />
            <StatItem label="Points" value={(profile?.total_points || 0).toLocaleString()} />
            <StatItem label="Reports" value={data?.submission_count || 0} />
            <StatItem label="Badges" value={data?.badge_count || 0} />
          </View>
        </View>

        {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} /> : (
          <View style={{ padding: 16, gap: 16 }}>
            {/* Skill level */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Skill Level</Text>
              <View style={[styles.lvlRow, { backgroundColor: lc + "15" }]}>
                <MaterialCommunityIcons name="star-circle" size={24} color={lc} />
                <View>
                  <Text style={[styles.lvlName, { color: lc, fontFamily: "Inter_700Bold" }]}>
                    {profile?.skill_level?.charAt(0).toUpperCase() + profile?.skill_level?.slice(1)}
                  </Text>
                  <Text style={[styles.lvlScore, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Skill Score: {profile?.skill_score || 0}
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent badges */}
            {data?.recent_badges?.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Recent Badges</Text>
                  <TouchableOpacity onPress={() => router.push("/(student)/achievements")}>
                    <Text style={[styles.viewAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>View All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.badgesRow}>
                  {data.recent_badges.map((b: any) => (
                    <View key={b.badge?.id} style={styles.badgeItem}>
                      <Text style={styles.badgeEmoji}>{b.badge?.emoji || "🏅"}</Text>
                      <Text style={[styles.badgeName, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                        {b.badge?.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bio */}
            {profile?.bio && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>About</Text>
                <Text style={[styles.bio, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{profile.bio}</Text>
              </View>
            )}

            {/* Links */}
            {(profile?.github_url || profile?.linkedin_url) && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Links</Text>
                {profile.github_url && (
                  <View style={styles.linkRow}>
                    <Feather name="github" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.link, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>{profile.github_url}</Text>
                  </View>
                )}
                {profile.linkedin_url && (
                  <View style={styles.linkRow}>
                    <Feather name="linkedin" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.link, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>{profile.linkedin_url}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Logout */}
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "30" }]}
              onPress={() => Alert.alert("Logout", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: logout },
              ])}
            >
              <Feather name="log-out" size={18} color={colors.destructive} />
              <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.statItem}>
      <Text style={{ color: "#FFF", fontSize: 18, fontFamily: "Inter_700Bold" }}>{value}</Text>
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular" }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  avatarSection: { alignItems: "center", gap: 6, marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { color: "#FFF", fontSize: 32 },
  name: { color: "#FFF", fontSize: 22 },
  email: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  college: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 3 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 16 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between" },
  viewAll: { fontSize: 13 },
  lvlRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 10 },
  lvlName: { fontSize: 18 },
  lvlScore: { fontSize: 13 },
  badgesRow: { flexDirection: "row", gap: 12 },
  badgeItem: { alignItems: "center", gap: 4 },
  badgeEmoji: { fontSize: 28 },
  badgeName: { fontSize: 10, textAlign: "center", maxWidth: 60 },
  bio: { fontSize: 14, lineHeight: 20 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  link: { fontSize: 13 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 50, borderRadius: 14, borderWidth: 1 },
  logoutText: { fontSize: 16 },
});
