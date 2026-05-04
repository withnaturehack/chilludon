import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const MENU_ITEMS = [
  { icon: "file-text", label: "My Reports", sub: "View all submissions", path: "/(student)/submissions" },
  { icon: "trending-up", label: "Leaderboard", sub: "National rankings", path: "/(student)/leaderboard" },
  { icon: "book-open", label: "Learn", sub: "Courses & modules", path: "/(student)/learn" },
  { icon: "award", label: "Achievements", sub: "Badges & rewards", path: "/(student)/achievements" },
  { icon: "dollar-sign", label: "Wallet", sub: "Balance & transactions", path: "/(student)/wallet" },
  { icon: "briefcase", label: "Internships", sub: "Career opportunities", path: "/(student)/internships" },
  { icon: "bell", label: "Alerts", sub: "Cyber threat intel", path: "/(student)/alerts" },
  { icon: "user", label: "Profile", sub: "Your public profile", path: "/(student)/profile" },
];

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>More</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.primary }]}>
          <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
              {user?.name?.[0]?.toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.userName, { fontFamily: "Inter_700Bold" }]}>{user?.name}</Text>
            <Text style={[styles.userEmail, { fontFamily: "Inter_400Regular" }]}>{user?.email}</Text>
            <Text style={[styles.userRole, { fontFamily: "Inter_500Medium" }]}>
              {user?.skill_level?.charAt(0).toUpperCase() + (user?.skill_level?.slice(1) || "")} · {user?.total_points || 0} pts
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={{ padding: 16, gap: 8 }}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.path}
              style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(item.path as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {item.label}
                </Text>
                <Text style={[styles.menuSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {item.sub}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "30" }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>
            Logout
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          CyberShield India v1.0 · Owned by Kartik Chilkoti
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22 },
  userCard: { margin: 16, borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFF", fontSize: 22 },
  userName: { color: "#FFF", fontSize: 18 },
  userEmail: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  userRole: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  menuIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15 },
  menuSub: { fontSize: 12, marginTop: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, margin: 16, marginTop: 4, height: 50, borderRadius: 14, borderWidth: 1 },
  logoutText: { fontSize: 16 },
  footer: { textAlign: "center", fontSize: 11, paddingBottom: 16 },
});
