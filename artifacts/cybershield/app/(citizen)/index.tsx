import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Platform, Animated, Alert, Image,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";

const QUICK_ACTIONS = [
  { icon: "shield-alert", label: "Report\nCrime", path: "/(citizen)/report", grad: ["#DC2626", "#EF4444"] },
  { icon: "bell-alert", label: "View\nAlerts", path: "/(citizen)/alerts", grad: ["#D97706", "#F59E0B"] },
  { icon: "newspaper-variant", label: "Cyber\nNews", path: "/(citizen)/news", grad: ["#7C3AED", "#8B5CF6"] },
  { icon: "phone-in-talk", label: "Helpline\n1930", path: "", grad: ["#059669", "#10B981"] },
];

const SAFETY_TIPS = [
  { icon: "lock", tip: "Use strong unique passwords for every app and enable 2FA", color: "#3B82F6" },
  { icon: "cellphone-nfc", tip: "Never share OTP with anyone — banks and govt never ask for it", color: "#10B981" },
  { icon: "wifi-off", tip: "Avoid using public Wi-Fi for banking or entering passwords", color: "#F59E0B" },
  { icon: "qrcode-scan", tip: "Verify UPI IDs and QR codes carefully before sending money", color: "#EF4444" },
  { icon: "account-alert", tip: "Keep your Aadhaar & PAN details private — never share on social media", color: "#8B5CF6" },
];

const EXPERT_PANEL = [
  { name: "Adv. Meera Joshi", role: "Cyber Law Expert", photo: "https://randomuser.me/api/portraits/women/68.jpg", tip: "Document everything — screenshots, emails, transaction IDs" },
  { name: "Rahul Nair, IPS", role: "Cyber Crime Unit", photo: "https://randomuser.me/api/portraits/men/55.jpg", tip: "Report within 24 hours for highest chance of fund recovery" },
  { name: "Dr. Sunita Rao", role: "Digital Forensics", photo: "https://randomuser.me/api/portraits/women/31.jpg", tip: "Never click links in SMS — go directly to the official app or website" },
];

const SCAM_TYPES = [
  { icon: "cash-minus", label: "UPI Fraud", count: "₹847Cr lost", color: "#EF4444" },
  { icon: "fish", label: "Phishing", count: "2.1L victims", color: "#F97316" },
  { icon: "account-multiple-minus", label: "Identity Theft", count: "89K cases", color: "#8B5CF6" },
  { icon: "phone-alert", label: "Call Fraud", count: "1.2L cases", color: "#EAB308" },
];

export default function CitizenHome() {
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
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => { logout(); router.replace("/auth/login"); } },
    ]);
  }

  const SEV_COLORS: Record<string, string> = { critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16" };
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
                <MaterialCommunityIcons name="logout" size={17} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            <LinearGradient colors={[threatColor + "20", threatColor + "08"]} style={[styles.threatBar, { borderColor: threatColor + "30" }]}>
              <View style={styles.threatLeft}>
                <Animated.View style={[styles.threatDot, { backgroundColor: threatColor, transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.threatLabel}>National Threat Level</Text>
              </View>
              <View style={[styles.threatLevelBadge, { backgroundColor: threatColor + "25" }]}>
                <Text style={[styles.threatLevelText, { color: threatColor }]}>{threatLevel}</Text>
              </View>
            </LinearGradient>
          </LinearGradient>

          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionCard}
                onPress={() => {
                  if (!a.path) {
                    Alert.alert("Cyber Crime Helpline", "Call 1930 — India's national cyber crime helpline. Available 24/7, Free from any network.", [{ text: "Got it" }]);
                    return;
                  }
                  router.push(a.path as any);
                }}
                activeOpacity={0.75}
              >
                <LinearGradient colors={a.grad as any} style={styles.actionIcon}>
                  <MaterialCommunityIcons name={a.icon as any} size={24} color="#FFF" />
                </LinearGradient>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Scams This Month</Text>
          </View>
          <View style={styles.scamRow}>
            {SCAM_TYPES.map((s) => (
              <View key={s.label} style={styles.scamCard}>
                <LinearGradient colors={[s.color + "20", s.color + "08"]} style={StyleSheet.absoluteFill} />
                <MaterialCommunityIcons name={s.icon as any} size={24} color={s.color} />
                <Text style={[styles.scamLabel, { color: s.color }]}>{s.label}</Text>
                <Text style={styles.scamCount}>{s.count}</Text>
              </View>
            ))}
          </View>

          {alerts.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
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
                    <LinearGradient colors={[sc + "06", "transparent"]} style={StyleSheet.absoluteFill} />
                    <View style={[styles.sevBadge, { backgroundColor: sc + "20" }]}>
                      <Text style={[styles.sevText, { color: sc }]}>{alert.severity?.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.alertTitle} numberOfLines={2}>{alert.title}</Text>
                    <Text style={styles.alertSource}>{alert.source}</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expert Safety Panel</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {EXPERT_PANEL.map((expert) => (
              <View key={expert.name} style={styles.expertCard}>
                <LinearGradient colors={["rgba(6,182,212,0.1)", "transparent"]} style={StyleSheet.absoluteFill} />
                <Image source={{ uri: expert.photo }} style={styles.expertPhoto} />
                <Text style={styles.expertName}>{expert.name}</Text>
                <Text style={styles.expertRole}>{expert.role}</Text>
                <View style={styles.expertTipRow}>
                  <MaterialCommunityIcons name="format-quote-open" size={14} color="#06B6D4" />
                  <Text style={styles.expertTip}>{expert.tip}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Safety Tips</Text>
          </View>
          {SAFETY_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <LinearGradient colors={[tip.color + "15", tip.color + "05"]} style={StyleSheet.absoluteFill} />
              <View style={[styles.tipIcon, { backgroundColor: tip.color + "20" }]}>
                <MaterialCommunityIcons name={tip.icon as any} size={20} color={tip.color} />
              </View>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          ))}

          <LinearGradient colors={["#052020", "#083030"]} style={styles.helperCard}>
            <MaterialCommunityIcons name="phone-in-talk" size={28} color="#06B6D4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.helperTitle}>Cyber Crime Helpline</Text>
              <Text style={styles.helperNum}>1930</Text>
              <Text style={styles.helperSub}>Free · 24×7 · All of India</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Alert.alert("📞 Call 1930", "Dial 1930 from any phone — India's dedicated cyber crime reporting line. It's free and available around the clock.", [{ text: "OK" }])}
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
  threatBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 14, padding: 14, borderWidth: 1 },
  threatLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  threatDot: { width: 10, height: 10, borderRadius: 5 },
  threatLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_500Medium" },
  threatLevelBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  threatLevelText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  actionsRow: { flexDirection: "row", paddingHorizontal: 14, gap: 10, paddingTop: 16, paddingBottom: 4 },
  actionCard: { flex: 1, backgroundColor: "#0F1A2E", borderRadius: 18, padding: 12, alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  actionLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#EF4444" },
  sectionTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  seeAll: { color: "#06B6D4", fontSize: 13, fontFamily: "Inter_500Medium" },
  scamRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, gap: 10 },
  scamCard: { flexBasis: "47%", flexGrow: 1, padding: 14, borderRadius: 16, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", alignItems: "center", gap: 6, overflow: "hidden" },
  scamLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  scamCount: { color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "Inter_400Regular" },
  alertCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 3, gap: 6, overflow: "hidden" },
  sevBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  alertTitle: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  alertSource: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular" },
  expertCard: { width: 220, padding: 16, borderRadius: 18, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(6,182,212,0.15)", gap: 8, overflow: "hidden" },
  expertPhoto: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: "rgba(6,182,212,0.4)" },
  expertName: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_700Bold" },
  expertRole: { color: "#06B6D4", fontSize: 11, fontFamily: "Inter_500Medium" },
  expertTipRow: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
  expertTip: { flex: 1, color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  tipCard: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", overflow: "hidden" },
  tipIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tipText: { flex: 1, color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  helperCard: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "rgba(6,182,212,0.2)" },
  helperTitle: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Inter_400Regular" },
  helperNum: { color: "#06B6D4", fontSize: 28, fontFamily: "Inter_700Bold" },
  helperSub: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular" },
  callBtn: { overflow: "hidden", borderRadius: 12 },
  callBtnGrad: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  callBtnText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
