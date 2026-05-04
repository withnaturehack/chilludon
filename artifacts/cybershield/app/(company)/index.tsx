import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, Alert, TouchableOpacity, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";

export default function CompanyDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["company-stats"],
    queryFn: () => apiFetch("/companies/stats"),
  });

  const STAT_CARDS = [
    { icon: "target", label: "Active Programs", value: data?.active_programs || 0, color: "#3B82F6", grad: ["#1D4ED8", "#3B82F6"] as [string,string] },
    { icon: "file-text", label: "Reports Received", value: data?.total_reports_received || 0, color: "#8B5CF6", grad: ["#7C3AED", "#8B5CF6"] as [string,string] },
    { icon: "dollar-sign", label: "Total Paid (₹)", value: `₹${(data?.total_paid || 0).toLocaleString("en-IN")}`, color: "#10B981", grad: ["#059669", "#10B981"] as [string,string] },
    { icon: "briefcase", label: "Open Internships", value: data?.open_internships || 0, color: "#F59E0B", grad: ["#D97706", "#F59E0B"] as [string,string] },
  ];

  const QUICK_LINKS = [
    { label: "Bounty Programs", icon: "target", desc: "Manage programs", color: "#3B82F6", tab: "bounty" },
    { label: "Internships", icon: "briefcase", desc: "Post opportunities", color: "#10B981", tab: "internships" },
    { label: "Analytics", icon: "bar-chart-2", desc: "View reports", color: "#8B5CF6", tab: "bounty" },
  ];

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={["#0A1A30", "#112244", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
          <View style={styles.decorCircle} />
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.companyBadge}>
                <MaterialCommunityIcons name="domain" size={12} color="#06B6D4" />
                <Text style={styles.companyBadgeText}>Company Portal</Text>
              </View>
              <Text style={styles.companyName}>{user?.company_name || user?.name}</Text>
              <Text style={styles.companyEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert("Logout", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: () => { logout(); router.replace("/auth/login"); } },
              ])}
              style={styles.logoutBtn}
            >
              <Feather name="log-out" size={18} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSub}>
            Secure your products · Find cyber talent · Track reports
          </Text>
        </LinearGradient>

        {isLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator color="#3B82F6" size="large" />
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {STAT_CARDS.map((card) => (
                <View key={card.label} style={styles.statCard}>
                  <LinearGradient colors={[card.color + "10", "transparent"]} style={StyleSheet.absoluteFill} />
                  <LinearGradient colors={card.grad} style={styles.statIconBg}>
                    <Feather name={card.icon as any} size={20} color="#FFF" />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
                  <Text style={styles.statLabel}>{card.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick Links */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Navigation</Text>
            </View>
            <View style={styles.quickLinks}>
              {QUICK_LINKS.map(link => (
                <TouchableOpacity key={link.label} style={styles.quickLink} activeOpacity={0.8}>
                  <LinearGradient colors={[link.color + "20", link.color + "08"]} style={StyleSheet.absoluteFill} />
                  <Feather name={link.icon as any} size={22} color={link.color} />
                  <Text style={[styles.quickLinkLabel, { color: link.color }]}>{link.label}</Text>
                  <Text style={styles.quickLinkDesc}>{link.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <LinearGradient colors={["rgba(6,182,212,0.08)", "transparent"]} style={StyleSheet.absoluteFill} />
              <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#06B6D4" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Getting Started</Text>
                <Text style={styles.infoText}>
                  Use the Bounty tab to view your active bug bounty programs and the Internships tab to post cybersecurity internship opportunities for India's top talent.
                </Text>
              </View>
            </View>

            {/* Platform Stats */}
            <LinearGradient colors={["#0F2040", "#1A3A6B"]} style={styles.platformCard}>
              <View style={styles.platformHeader}>
                <MaterialCommunityIcons name="shield-lock" size={18} color="#3B82F6" />
                <Text style={styles.platformTitle}>CyberShield Platform</Text>
              </View>
              <View style={styles.platformStats}>
                <View style={styles.platformStat}>
                  <Text style={styles.platformStatVal}>10K+</Text>
                  <Text style={styles.platformStatLabel}>Researchers</Text>
                </View>
                <View style={styles.platformStat}>
                  <Text style={styles.platformStatVal}>₹2Cr+</Text>
                  <Text style={styles.platformStatLabel}>Total Paid</Text>
                </View>
                <View style={styles.platformStat}>
                  <Text style={styles.platformStatVal}>28</Text>
                  <Text style={styles.platformStatLabel}>States</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24, overflow: "hidden" },
  decorCircle: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(6,182,212,0.05)", top: -60, right: -40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  headerLeft: { gap: 5 },
  companyBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(6,182,212,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  companyBadgeText: { color: "#06B6D4", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  companyName: { color: "#FFF", fontSize: 22, fontFamily: "Inter_700Bold" },
  companyEmail: { color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "Inter_400Regular" },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  statCard: { width: "47%", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 10, backgroundColor: "#0F1A2E", overflow: "hidden" },
  statIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  quickLinks: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  quickLink: { flex: 1, padding: 14, borderRadius: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  quickLinkLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  quickLinkDesc: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginHorizontal: 16, marginBottom: 16, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(6,182,212,0.15)", overflow: "hidden" },
  infoTitle: { color: "#06B6D4", fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  infoText: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  platformCard: { marginHorizontal: 16, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(59,130,246,0.2)", gap: 14 },
  platformHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  platformTitle: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  platformStats: { flexDirection: "row", justifyContent: "space-around" },
  platformStat: { alignItems: "center", gap: 4 },
  platformStatVal: { color: "#3B82F6", fontSize: 20, fontFamily: "Inter_700Bold" },
  platformStatLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular" },
});
