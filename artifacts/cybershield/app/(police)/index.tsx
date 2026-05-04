import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";

export default function PoliceDashboard() {
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

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["police-stats"],
    queryFn: () => apiFetch("/police/stats"),
  });

  const STAT_CARDS = [
    { icon: "clock", label: "Pending Review", value: data?.pending_review || 0, color: "#EAB308", grad: ["#D97706", "#F59E0B"] as [string,string], urgent: (data?.pending_review || 0) > 10 },
    { icon: "check-circle", label: "Verified Reports", value: data?.verified_today || 0, color: "#10B981", grad: ["#059669", "#10B981"] as [string,string], urgent: false },
    { icon: "briefcase", label: "Open Cases", value: data?.open_cases || 0, color: "#3B82F6", grad: ["#1D4ED8", "#3B82F6"] as [string,string], urgent: false },
    { icon: "alert-triangle", label: "Critical", value: data?.critical_submissions || 0, color: "#EF4444", grad: ["#DC2626", "#EF4444"] as [string,string], urgent: (data?.critical_submissions || 0) > 0 },
    { icon: "file-text", label: "Total Reports", value: data?.total_submissions || 0, color: "#8B5CF6", grad: ["#7C3AED", "#8B5CF6"] as [string,string], urgent: false },
    { icon: "flag", label: "Fraud Flagged", value: data?.fraud_flagged || 0, color: "#F97316", grad: ["#EA580C", "#F97316"] as [string,string], urgent: false },
  ];

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={undefined}
      >
        {/* Header */}
        <LinearGradient colors={["#0A1F3A", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
          <View style={styles.decorCircle} />
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <MaterialCommunityIcons name="shield-star" size={14} color="#FCD34D" />
                <Text style={styles.headerBadge}>Cyber Crime Unit</Text>
              </View>
              <Text style={styles.officerName}>{user?.name}</Text>
              {user?.station_name && (
                <Text style={styles.stationText}>{user.station_name}</Text>
              )}
              {user?.badge_number && (
                <Text style={styles.badgeNum}>Badge: {user.badge_number}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert("Logout", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: logout },
              ])}
              style={styles.logoutBtn}
            >
              <Feather name="log-out" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {/* Status bar */}
          <LinearGradient colors={["rgba(59,130,246,0.2)", "rgba(6,182,212,0.1)"]} style={styles.statusBar}>
            <View style={styles.statusItem}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>System Active</Text>
            </View>
            <Text style={styles.statusDate}>
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </LinearGradient>
        </LinearGradient>

        {isLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator color="#3B82F6" size="large" />
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.statsGrid}>
              {STAT_CARDS.map((card) => (
                <View key={card.label} style={[styles.statCard, card.urgent && { borderColor: card.color + "40" }]}>
                  {card.urgent && <LinearGradient colors={[card.color + "10", "transparent"]} style={StyleSheet.absoluteFill} />}
                  <View style={styles.statTop}>
                    <LinearGradient colors={card.grad} style={styles.statIconBg}>
                      <Feather name={card.icon as any} size={18} color="#FFF" />
                    </LinearGradient>
                    {card.urgent && (
                      <View style={styles.urgentDot}>
                        <View style={styles.urgentDotInner} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
                  <Text style={styles.statLabel}>{card.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.qAction} activeOpacity={0.8}>
                <LinearGradient colors={["#D97706", "#F59E0B"]} style={styles.qActionIcon}>
                  <Feather name="file-text" size={20} color="#FFF" />
                </LinearGradient>
                <Text style={styles.qActionLabel}>Review Queue</Text>
                {(data?.pending_review || 0) > 0 && (
                  <View style={styles.qActionBadge}>
                    <Text style={styles.qActionBadgeText}>{data?.pending_review}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.qAction} activeOpacity={0.8}>
                <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.qActionIcon}>
                  <MaterialCommunityIcons name="briefcase-outline" size={20} color="#FFF" />
                </LinearGradient>
                <Text style={styles.qActionLabel}>Active Cases</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qAction} activeOpacity={0.8}>
                <LinearGradient colors={["#DC2626", "#EF4444"]} style={styles.qActionIcon}>
                  <Feather name="alert-triangle" size={20} color="#FFF" />
                </LinearGradient>
                <Text style={styles.qActionLabel}>Threat Alerts</Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <LinearGradient colors={["rgba(59,130,246,0.08)", "transparent"]} style={StyleSheet.absoluteFill} />
              <MaterialCommunityIcons name="information-outline" size={18} color="#3B82F6" />
              <Text style={styles.infoText}>
                Use the Review tab to approve/reject submissions. Critical cases are automatically escalated. All actions are audited.
              </Text>
            </View>
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
  statIconBg: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  urgentDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "rgba(239,68,68,0.2)", alignItems: "center", justifyContent: "center" },
  urgentDotInner: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#EF4444" },
  statValue: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statLabel: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  quickActions: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  qAction: { flex: 1, backgroundColor: "#0F1A2E", borderRadius: 16, padding: 14, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  qActionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  qActionLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  qActionBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "#EF4444", width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  qActionBadgeText: { color: "#FFF", fontSize: 10, fontFamily: "Inter_700Bold" },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginHorizontal: 16, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(59,130,246,0.15)", overflow: "hidden" },
  infoText: { flex: 1, color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
});
