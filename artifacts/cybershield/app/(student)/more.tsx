import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, Animated, Image } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const MENU_GROUPS = [
  {
    label: "Activity",
    items: [
      { icon: "file-document-outline", label: "My Reports", sub: "View all submissions", path: "/(student)/submissions", color: "#3B82F6", grad: ["#1D4ED8", "#3B82F6"] },
      { icon: "trending-up", label: "Leaderboard", sub: "National rankings", path: "/(student)/leaderboard", color: "#F59E0B", grad: ["#D97706", "#F59E0B"] },
    ],
  },
  {
    label: "Learn & Grow",
    items: [
      { icon: "book-open-variant", label: "Cyber Academy", sub: "CERT-In certified courses", path: "/(student)/learn", color: "#8B5CF6", grad: ["#7C3AED", "#8B5CF6"] },
      { icon: "medal-outline", label: "Achievements", sub: "Badges & rewards", path: "/(student)/achievements", color: "#F59E0B", grad: ["#D97706", "#F59E0B"] },
      { icon: "briefcase", label: "Internships", sub: "Cyber career opportunities", path: "/(student)/internships", color: "#06B6D4", grad: ["#0891B2", "#06B6D4"] },
    ],
  },
  {
    label: "Finance",
    items: [
      { icon: "currency-usd", label: "Wallet", sub: "Balance & transactions", path: "/(student)/wallet", color: "#10B981", grad: ["#059669", "#10B981"] },
    ],
  },
  {
    label: "Security",
    items: [
      { icon: "bell-alert-outline", label: "Threat Alerts", sub: "Real-time cyber intelligence", path: "/(student)/alerts", color: "#EF4444", grad: ["#DC2626", "#EF4444"] },
      { icon: "account-circle-outline", label: "My Profile", sub: "Public profile & settings", path: "/(student)/profile", color: "#3B82F6", grad: ["#1D4ED8", "#3B82F6"] },
    ],
  },
];

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
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

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => { logout(); router.replace("/auth/login"); },
      },
    ]);
  }

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0F2040", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.headerTitle}>More</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 90, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity
            style={styles.userCardWrap}
            onPress={() => router.push("/(student)/profile")}
            activeOpacity={0.85}
          >
            <LinearGradient colors={["#0F2040", "#1A3A6B"]} style={styles.userCard}>
              <View style={styles.decorCircle} />
              <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
              </LinearGradient>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.userStats}>
                  <View style={styles.userStatItem}>
                    <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.userStatText}>
                      {(user?.skill_level || "Beginner").charAt(0).toUpperCase() + (user?.skill_level || "Beginner").slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.userStatDivider}>·</Text>
                  <Text style={styles.userStatText}>{(user?.total_points || 0).toLocaleString()} pts</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(255,255,255,0.3)" />
            </LinearGradient>
          </TouchableOpacity>

          {MENU_GROUPS.map((group) => (
            <View key={group.label} style={styles.menuGroup}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.groupItems}>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.path}
                    style={styles.menuItem}
                    onPress={() => router.push(item.path as any)}
                    activeOpacity={0.75}
                  >
                    <LinearGradient colors={item.grad as any} style={styles.menuIcon}>
                      <MaterialCommunityIcons name={item.icon as any} size={18} color="#FFF" />
                    </LinearGradient>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text style={styles.menuSub}>{item.sub}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color="rgba(255,255,255,0.2)" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.infoCard}>
            <LinearGradient colors={["rgba(59,130,246,0.08)", "rgba(6,182,212,0.04)"]} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.infoIconBg}>
              <MaterialCommunityIcons name="shield-lock" size={18} color="#FFF" />
            </LinearGradient>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>CyberShield India v2.0</Text>
              <Text style={styles.infoSub}>National Cybersecurity Platform · Owned by Kartik Chilkoti</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
            <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { color: "#F8FAFC", fontSize: 26, fontFamily: "Inter_700Bold" },
  userCardWrap: { margin: 16, borderRadius: 20, overflow: "hidden" },
  userCard: { padding: 16, flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  decorCircle: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(59,130,246,0.08)", top: -40, right: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  userInfo: { flex: 1, gap: 3 },
  userName: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  userEmail: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular" },
  userStats: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  userStatItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  userStatText: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Inter_500Medium" },
  userStatDivider: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  menuGroup: { paddingHorizontal: 16, marginBottom: 8 },
  groupLabel: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_700Bold", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  groupItems: { backgroundColor: "#0F1A2E", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuContent: { flex: 1 },
  menuLabel: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  menuSub: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(59,130,246,0.15)", overflow: "hidden" },
  infoIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  infoText: { flex: 1 },
  infoTitle: { color: "#F8FAFC", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  infoSub: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 16, marginBottom: 8, height: 50, borderRadius: 14, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", backgroundColor: "rgba(239,68,68,0.08)" },
  logoutText: { color: "#EF4444", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
