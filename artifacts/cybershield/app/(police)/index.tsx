import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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

  const { data, isLoading } = useQuery({ queryKey: ["police-stats"], queryFn: () => apiFetch("/police/stats") });

  function handleLogout() {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  }

  const statCards = [
    { icon: "clock", label: "Pending Review", value: data?.pending_review || 0, color: "#F59E0B", bg: "#FFFBEB" },
    { icon: "check-circle", label: "Verified Reports", value: data?.verified_today || 0, color: "#10B981", bg: "#F0FDF4" },
    { icon: "briefcase", label: "Open Cases", value: data?.open_cases || 0, color: "#3B82F6", bg: "#EFF6FF" },
    { icon: "alert-triangle", label: "Critical Alerts", value: data?.critical_submissions || 0, color: "#EF4444", bg: "#FEF2F2" },
    { icon: "file-text", label: "Total Reports", value: data?.total_submissions || 0, color: "#8B5CF6", bg: "#F5F3FF" },
    { icon: "flag", label: "Fraud Flagged", value: data?.fraud_flagged || 0, color: "#F97316", bg: "#FFF7ED" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1E3A5F" }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greeting, { fontFamily: "Inter_400Regular" }]}>CyberShield India</Text>
              <Text style={[styles.name, { fontFamily: "Inter_700Bold" }]}>{user?.name}</Text>
              {user?.station_name && (
                <Text style={[styles.station, { fontFamily: "Inter_400Regular" }]}>{user.station_name}</Text>
              )}
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <View style={[styles.logoutBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <Feather name="log-out" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <MaterialCommunityIcons name="shield-star" size={16} color="#FCD34D" />
            <Text style={[styles.roleText, { fontFamily: "Inter_600SemiBold" }]}>
              Cyber Crime Unit · {user?.badge_number || "Officer"}
            </Text>
          </View>
        </View>

        {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
          <View style={styles.statsGrid}>
            {statCards.map((card) => (
              <View key={card.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.statIcon, { backgroundColor: card.bg }]}>
                  <Feather name={card.icon as any} size={20} color={card.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{card.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{card.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Use the Review tab to approve or reject submissions. Cases are automatically created for escalated reports. All actions are logged and audited.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  greeting: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  name: { color: "#FFF", fontSize: 22 },
  station: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" },
  roleText: { color: "#FFF", fontSize: 13 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  statCard: { width: "47%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 24 },
  statLabel: { fontSize: 12 },
  infoCard: { margin: 16, flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
