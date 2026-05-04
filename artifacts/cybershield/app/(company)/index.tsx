import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, Alert, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
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

  const { data, isLoading } = useQuery({ queryKey: ["company-stats"], queryFn: () => apiFetch("/companies/stats") });

  const statCards = [
    { icon: "target", label: "Active Programs", value: data?.active_programs || 1, color: "#3B82F6", bg: "#EFF6FF" },
    { icon: "file-text", label: "Reports Received", value: data?.total_reports_received || 58, color: "#8B5CF6", bg: "#F5F3FF" },
    { icon: "dollar-sign", label: "Total Paid (₹)", value: (data?.total_paid || 1250000).toLocaleString(), color: "#10B981", bg: "#F0FDF4" },
    { icon: "briefcase", label: "Open Internships", value: data?.open_internships || 1, color: "#F59E0B", bg: "#FFFBEB" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1A1A2E" }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greeting, { fontFamily: "Inter_400Regular" }]}>Company Portal</Text>
              <Text style={[styles.name, { fontFamily: "Inter_700Bold" }]}>{user?.company_name || user?.name}</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert("Logout", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              { text: "Logout", style: "destructive", onPress: logout },
            ])}>
              <View style={[styles.logoutBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <Feather name="log-out" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={[styles.subheading, { fontFamily: "Inter_400Regular" }]}>
            Manage your security programs and find cyber talent
          </Text>
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

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Use the Bounty tab to view your programs and the Internships tab to post new opportunities for India's top cyber talent.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  greeting: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  name: { color: "#FFF", fontSize: 20 },
  subheading: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  statCard: { width: "47%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 12 },
  infoCard: { margin: 16, flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
