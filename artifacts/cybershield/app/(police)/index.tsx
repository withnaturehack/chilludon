import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert, Animated, Image, RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";

const OFFICER_PHOTOS = [
  "https://randomuser.me/api/portraits/men/41.jpg",
  "https://randomuser.me/api/portraits/men/52.jpg",
  "https://randomuser.me/api/portraits/women/36.jpg",
  "https://randomuser.me/api/portraits/men/17.jpg",
];

const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16",
};

const RECENT_CASES = [
  { id: "C001", title: "UPI Phishing Ring — Mumbai", severity: "critical", status: "Active", photo: 0, officer: "Insp. Ramesh Kumar", date: "Today, 2:30 PM" },
  { id: "C002", title: "Ransomware Hospital Attack", severity: "critical", status: "Escalated", photo: 2, officer: "SI Priya Nair", date: "Yesterday" },
  { id: "C003", title: "Fake Bank Portal Network", severity: "high", status: "Investigation", photo: 1, officer: "Insp. Amit Verma", date: "2 days ago" },
  { id: "C004", title: "OTP Bypass Scheme", severity: "high", status: "Closed", photo: 3, officer: "DSP Rajesh Singh", date: "3 days ago" },
];

export default function PoliceDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["police-stats"],
    queryFn: () => apiFetch("/police/stats"),
  });

  const STAT_CARDS = [
    { icon: "clock-outline", label: "Pending Review", value: data?.pending_review || 0, color: "#EAB308", grad: ["#D97706", "#F59E0B"] as [string,string], urgent: (data?.pending_review || 0) > 5 },
    { icon: "check-circle-outline", label: "Verified Today", value: data?.verified_today || 0, color: "#10B981", grad: ["#059669", "#10B981"] as [string,string], urgent: false },
    { icon: "briefcase-outline", label: "Open Cases", value: data?.open_cases || 0, color: "#3B82F6", grad: ["#1D4ED8", "#3B82F6"] as [string,string], urgent: false },
    { icon: "alert-decagram", label: "Critical", value: data?.critical_submissions || 0, color: "#EF4444", grad: ["#DC2626", "#EF4444"] as [string,string], urgent: (data?.critical_submissions || 0) > 0 },
    { icon: "file-document-outline", label: "Total Reports", value: data?.total_submissions || 0, color: "#8B5CF6", grad: ["#7C3AED", "#8B5CF6"] as [string,string], urgent: false },
    { icon: "flag-outline", label: "Fraud Flagged", value: data?.fraud_flagged || 0, color: "#F97316", grad: ["#EA580C", "#F97316"] as [string,string], urgent: false },
  ];

  const QUICK_ACTIONS = [
    { icon: "file-document-check", label: "Review Queue", grad: ["#D97706", "#F59E0B"], badge: data?.pending_review, onPress: () => router.push("/(police)/review") },
    { icon: "briefcase-search", label: "Active Cases", grad: ["#1D4ED8", "#3B82F6"], onPress: () => router.push("/(police)/cases") },
    { icon: "map-marker-radius", label: "Live Map", grad: ["#059669", "#10B981"], onPress: () => router.push("/(police)/location") },
    { icon: "radar", label: "Intelligence", grad: ["#7C3AED", "#8B5CF6"], onPress: () => router.push("/(police)/intelligence") },
    { icon: "alert-decagram", label: "Threat Alerts", grad: ["#DC2626", "#EF4444"], onPress: () => router.push("/(police)/alerts") },
    { icon: "chart-bar", label: "Analytics", grad: ["#0891B2", "#06B6D4"], onPress: () => router.push("/(police)/analytics") },
  ];

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FCD34D" />}
      >
        <LinearGradient colors={["#0A1F3A", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
          <View style={styles.decorCircle} />
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <MaterialCommunityIcons name="shield-star" size={14} color="#FCD34D" />
                <Text style={styles.headerBadge}>Cyber Crime Unit</Text>
              </View>
              <Text style={styles.officerName}>{user?.name || "Officer"}</Text>
              {user?.station_name && <Text style={styles.stationText}>{user.station_name}</Text>}
              {user?.badge_number && <Text style={styles.badgeNum}>Badge: {user.badge_number}</Text>}
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => Alert.alert("Logout", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Logout", style: "destructive", onPress: () => { logout(); router.replace("/auth/login"); } },
                ])}
                style={styles.logoutBtn}
              >
                <MaterialCommunityIcons name="logout" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
          </View>
          <LinearGradient colors={["rgba(252,211,77,0.15)", "rgba(252,211,77,0.05)"]} style={styles.statusBar}>
            <View style={styles.statusItem}>
              <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.statusText}>System Active</Text>
            </View>
            <Text style={styles.statusDate}>
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </LinearGradient>
        </LinearGradient>

        {isLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator color="#FCD34D" size="large" />
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.statsGrid}>
              {STAT_CARDS.map((card) => (
                <View key={card.label} style={[styles.statCard, card.urgent && { borderColor: card.color + "50" }]}>
                  {card.urgent && <LinearGradient colors={[card.color + "15", "transparent"]} style={StyleSheet.absoluteFill} />}
                  <View style={styles.statTop}>
                    <LinearGradient colors={card.grad} style={styles.statIconBg}>
                      <MaterialCommunityIcons name={card.icon as any} size={20} color="#FFF" />
                    </LinearGradient>
                    {card.urgent && (
                      <Animated.View style={[styles.urgentDot, { transform: [{ scale: pulseAnim }] }]}>
                        <View style={styles.urgentDotInner} />
                      </Animated.View>
                    )}
                  </View>
                  <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
                  <Text style={styles.statLabel}>{card.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((a) => (
                <TouchableOpacity key={a.label} style={styles.qAction} onPress={a.onPress} activeOpacity={0.75}>
                  <LinearGradient colors={a.grad as any} style={styles.qActionIcon}>
                    <MaterialCommunityIcons name={a.icon as any} size={22} color="#FFF" />
                  </LinearGradient>
                  {a.badge != null && a.badge > 0 && (
                    <View style={styles.qActionBadge}>
                      <Text style={styles.qActionBadgeText}>{a.badge}</Text>
                    </View>
                  )}
                  <Text style={styles.qActionLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Cases</Text>
              <TouchableOpacity onPress={() => router.push("/(police)/cases")}>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            </View>
            {RECENT_CASES.map((c) => {
              const sc = SEV_COLORS[c.severity] || "#666";
              const statusColor = c.status === "Active" ? "#10B981" : c.status === "Escalated" ? "#EF4444" : c.status === "Closed" ? "#6B7280" : "#F59E0B";
              return (
                <TouchableOpacity key={c.id} style={styles.caseCard} onPress={() => router.push("/(police)/cases")} activeOpacity={0.8}>
                  <LinearGradient colors={[sc + "08", "transparent"]} style={StyleSheet.absoluteFill} />
                  <View style={[styles.caseSevBar, { backgroundColor: sc }]} />
                  <View style={{ flex: 1, gap: 5 }}>
                    <View style={styles.caseTop}>
                      <Text style={[styles.caseId, { color: sc }]}>{c.id}</Text>
                      <View style={[styles.caseStatus, { backgroundColor: statusColor + "20" }]}>
                        <Text style={[styles.caseStatusText, { color: statusColor }]}>{c.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.caseTitle} numberOfLines={1}>{c.title}</Text>
                    <View style={styles.caseFooter}>
                      <Image source={{ uri: OFFICER_PHOTOS[c.photo] }} style={styles.officerPhoto} />
                      <Text style={styles.officerName2}>{c.officer}</Text>
                      <Text style={styles.caseDate}>{c.date}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <LinearGradient colors={["#0A1F3A", "#052020"]} style={styles.liveLocationCard}>
              <MaterialCommunityIcons name="map-marker-radius" size={28} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text style={styles.liveLocTitle}>Live Location Tracking</Text>
                <Text style={styles.liveLocSub}>Go on duty to track your position and receive location-based case alerts</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(police)/location")} activeOpacity={0.8} style={{ overflow: "hidden", borderRadius: 12 }}>
                <LinearGradient colors={["#059669", "#10B981"]} style={styles.liveLocBtn}>
                  <Text style={styles.liveLocBtnText}>Open</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24, overflow: "hidden" },
  decorCircle: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(59,130,246,0.06)", top: -60, right: -40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerLeft: { gap: 4 },
  headerRight: {},
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(252,211,77,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  headerBadge: { color: "#FCD34D", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  officerName: { color: "#FFF", fontSize: 24, fontFamily: "Inter_700Bold" },
  stationText: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_400Regular" },
  badgeNum: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular" },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  statusBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 12, padding: 12 },
  statusItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },
  statusText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_500Medium" },
  statusDate: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  statCard: { width: "47%", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 10, backgroundColor: "#0F1A2E", overflow: "hidden" },
  statTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  urgentDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "rgba(239,68,68,0.2)", alignItems: "center", justifyContent: "center" },
  urgentDotInner: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#EF4444" },
  statValue: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statLabel: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  sectionTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  seeAll: { color: "#FCD34D", fontSize: 13, fontFamily: "Inter_500Medium" },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10, marginBottom: 20 },
  qAction: { flexBasis: "30%", flexGrow: 1, backgroundColor: "#0F1A2E", borderRadius: 16, padding: 14, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", position: "relative" },
  qActionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  qActionBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "#EF4444", minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  qActionBadgeText: { color: "#FFF", fontSize: 10, fontFamily: "Inter_700Bold" },
  qActionLabel: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  caseCard: { flexDirection: "row", alignItems: "flex-start", marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 18, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 12, overflow: "hidden" },
  caseSevBar: { width: 4, height: "100%", borderRadius: 2, position: "absolute", left: 0, top: 0 },
  caseTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  caseId: { fontSize: 11, fontFamily: "Inter_700Bold" },
  caseStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  caseStatusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  caseTitle: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  caseFooter: { flexDirection: "row", alignItems: "center", gap: 8 },
  officerPhoto: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  officerName2: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  caseDate: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Inter_400Regular" },
  liveLocationCard: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
  liveLocTitle: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_700Bold" },
  liveLocSub: { color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16 },
  liveLocBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  liveLocBtnText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
