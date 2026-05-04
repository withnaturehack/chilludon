import React, { useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Platform, Animated, Alert,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";

const QUICK_ACTIONS = [
  { icon: "shield-alert-outline", label: "Report\nCrime", path: "/(citizen)/report", grad: ["#DC2626", "#EF4444"], lib: "mci" },
  { icon: "alert-triangle", label: "View\nAlerts", path: "/(citizen)/alerts", grad: ["#D97706", "#F59E0B"], lib: "feather" },
  { icon: "radio", label: "Cyber\nNews", path: "/(citizen)/news", grad: ["#7C3AED", "#8B5CF6"], lib: "feather" },
  { icon: "phone-in-talk", label: "Helpline\n1930", path: "", grad: ["#059669", "#10B981"], lib: "mci" },
];

const SAFETY_TIPS = [
  { icon: "lock", tip: "Use strong unique passwords for every app and enable 2FA", color: "#3B82F6" },
  { icon: "smartphone", tip: "Never share OTP — banks and govt never ask for it", color: "#10B981" },
  { icon: "wifi-off", tip: "Avoid using public Wi-Fi for banking or sensitive apps", color: "#F59E0B" },
  { icon: "shield", tip: "Verify UPI IDs carefully before sending money", color: "#EF4444" },
];

export default function CitizenHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { data, isRefetching, refetch } = useQuery({
    queryKey: ["citizen-alerts"],
    queryFn: () => apiFetch("/citizen/alerts?limit=3"),
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => { logout(); router.replace("/auth/login"); } },
    ]);
  }

  const SEV_COLORS: Record<string, string> = {
    critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16",
  };

  const alerts = data?.alerts || [];
  const threatLevel = alerts.some((a: any) => a.severity === "critical") ? "HIGH" : alerts.some((a: any) => a.severity === "high") ? "MEDIUM" : "LOW";
  const threatColor = threatLevel === "HIGH" ? "#EF4444" : threatLevel === "MEDIUM" ? "#F97316" : "#10B981";

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#06B6D4" />}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient colors={["#052020", "#083030", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
            <View style={styles.decorCircle} />
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <View style={styles.roleBadge}>
                  <MaterialCommunityIcons name="shield-home" size={12} color="#06B6D4" />
                  <Text style={styles.roleBadgeText}>Digital Safety Portal</Text>
                </View>
                <Text style={styles.greeting}>Namaste, {user?.name?.split(" ")[0] || "Citizen"} 🇮🇳</Text>
                <Text style={styles.subText}>{user?.state ? `${user.state} · ` : ""}Stay safe online</Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Feather name="log-out" size={17} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            <LinearGradient colors={[threatColor + "20", threatColor + "08"]} style={[styles.threatBar, { borderColor: threatColor + "30" }]}>
              <View style={styles.threatLeft}>
                <Animated.View style={[styles.threatDot, { backgroundColor: threatColor, transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.threatLabel}>Threat Level</Text>
              </View>
              <Text style={[styles.threatLevel, { color: threatColor }]}>{threatLevel}</Text>
            </LinearGradient>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionCard}
                onPress={() => {
                  if (!a.path) {
                    Alert.alert("Cyber Crime Helpline", "Call 1930 to report cyber crimes. Available 24/7 across India.", [{ text: "OK" }]);
                    return;
                  }
                  router.push(a.path as any);
                }}
                activeOpacity={0.75}
              >
                <LinearGradient colors={a.grad as any} style={styles.actionIcon}>
                  {a.lib === "mci"
                    ? <MaterialCommunityIcons name={a.icon as any} size={22} color="#FFF" />
                    : <Feather name={a.icon as any} size={22} color="#FFF" />
                  }
                </LinearGradient>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {alerts.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.alertDot, { backgroundColor: "#EF4444" }]} />
                  <Text style={styles.sectionTitle}>Live Alerts</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/(citizen)/alerts")}>
                  <Text style={styles.seeAll}>View all</Text>
                </TouchableOpacity>
              </View>
              {alerts.map((alert: any) => {
                const sc = SEV_COLORS[alert.severity] || "#666";
                return (
                  <TouchableOpacity
                    key={alert.id}
                    style={[styles.alertCard, { borderLeftColor: sc }]}
                    onPress={() => router.push("/(citizen)/alerts")}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.sevBadge, { backgroundColor: sc + "20" }]}>
                      <Text style={[styles.sevText, { color: sc }]}>{alert.severity?.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.alertTitle} numberOfLines={2}>{alert.title}</Text>
                    <Text style={styles.alertDesc} numberOfLines={1}>{alert.source}</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Safety Tips</Text>
          </View>
          {SAFETY_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <LinearGradient colors={[tip.color + "20", tip.color + "08"]} style={StyleSheet.absoluteFill} />
              <View style={[styles.tipIcon, { backgroundColor: tip.color + "20" }]}>
                <Feather name={tip.icon as any} size={18} color={tip.color} />
              </View>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          ))}

          <LinearGradient colors={["#052020", "#083030"]} style={styles.helperCard}>
            <MaterialCommunityIcons name="phone-in-talk" size={24} color="#06B6D4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.helperTitle}>Cyber Crime Helpline</Text>
              <Text style={styles.helperNum}>1930</Text>
              <Text style={styles.helperSub}>Free · 24/7 · All India</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Alert.alert("Call 1930", "Dial 1930 to report cyber crime immediately. Free call from any network.")}
              activeOpacity={0.8}
            >
              <LinearGradient colors={["#059669", "#10B981"]} style={styles.callBtnGrad}>
                <Text style={styles.callBtnText}>Call Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, overflow: "hidden" },
  decorCircle: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(6,182,212,0.05)", top: -60, right: -40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  headerLeft: { gap: 5 },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(6,182,212,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  roleBadgeText: { color: "#06B6D4", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  greeting: { color: "#FFF", fontSize: 24, fontFamily: "Inter_700Bold" },
  subText: { color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "Inter_400Regular" },
  logoutBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  threatBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1 },
  threatLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  threatDot: { width: 10, height: 10, borderRadius: 5 },
  threatLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_500Medium" },
  threatLevel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  seeAll: { color: "#06B6D4", fontSize: 13, fontFamily: "Inter_500Medium" },
  actionsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 12 },
  actionCard: { flex: 1, backgroundColor: "#0F1A2E", borderRadius: 18, padding: 14, alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  actionLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  alertCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 3, gap: 6 },
  sevBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  alertTitle: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  alertDesc: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular" },
  tipCard: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", overflow: "hidden" },
  tipIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tipText: { flex: 1, color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  helperCard: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "rgba(6,182,212,0.2)" },
  helperTitle: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Inter_400Regular" },
  helperNum: { color: "#06B6D4", fontSize: 24, fontFamily: "Inter_700Bold" },
  helperSub: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular" },
  callBtn: { overflow: "hidden", borderRadius: 12 },
  callBtnGrad: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  callBtnText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
