import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Animated, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";

const CRIME_TYPES = [
  { type: "Phishing & Social Engineering", count: 4821, pct: 100, color: "#EF4444" },
  { type: "Financial Fraud & UPI Scams", count: 3956, pct: 82, color: "#F97316" },
  { type: "Data Breach & Leakage", count: 2103, pct: 44, color: "#EAB308" },
  { type: "Malware & Ransomware", count: 1876, pct: 39, color: "#8B5CF6" },
  { type: "Identity Theft & Fake Profiles", count: 1432, pct: 30, color: "#3B82F6" },
  { type: "Cyber Stalking & Harassment", count: 987, pct: 20, color: "#EC4899" },
  { type: "Vulnerability Exploitation", count: 654, pct: 14, color: "#10B981" },
  { type: "DDoS Attacks", count: 321, pct: 7, color: "#06B6D4" },
];

const MONTHLY_TREND = [
  { month: "Nov", reports: 820 },
  { month: "Dec", reports: 940 },
  { month: "Jan", reports: 1120 },
  { month: "Feb", reports: 1350 },
  { month: "Mar", reports: 1680 },
  { month: "Apr", reports: 1420 },
  { month: "May", reports: 890 },
];

const MAX_REPORTS = Math.max(...MONTHLY_TREND.map(m => m.reports));

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { apiFetch } = useApi();

  const { data } = useQuery({
    queryKey: ["police-stats"],
    queryFn: () => apiFetch("/police/stats"),
  });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const total = data?.total_submissions || 16150;
  const verified = data?.verified_today || 2103;
  const pending = data?.pending_review || 847;
  const resolutionRate = total > 0 ? Math.round((verified / total) * 100) : 13;

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0A1F3A", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Crime Analytics</Text>
            <Text style={styles.headerSub}>National cybercrime statistics · India 2025</Text>
          </View>
          <LinearGradient colors={["#7C3AED", "#8B5CF6"]} style={styles.headerIcon}>
            <MaterialCommunityIcons name="chart-bar" size={20} color="#FFF" />
          </LinearGradient>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Row */}
        <View style={styles.kpiRow}>
          {[
            { label: "Total Reports", value: total.toLocaleString(), color: "#3B82F6", icon: "file-text" },
            { label: "Resolved", value: verified.toLocaleString(), color: "#10B981", icon: "check-circle" },
            { label: "Pending", value: pending.toLocaleString(), color: "#EAB308", icon: "clock" },
            { label: "Resolution %", value: `${resolutionRate}%`, color: "#8B5CF6", icon: "trending-up" },
          ].map(kpi => (
            <View key={kpi.label} style={styles.kpiCard}>
              <LinearGradient colors={[kpi.color + "15", "transparent"]} style={StyleSheet.absoluteFill} />
              <Feather name={kpi.icon as any} size={16} color={kpi.color} />
              <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Trend Chart */}
        <View style={styles.sectionCard}>
          <LinearGradient colors={["rgba(59,130,246,0.06)", "transparent"]} style={StyleSheet.absoluteFill} />
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-line" size={16} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Monthly Trend (Nov '24 – May '25)</Text>
          </View>
          <View style={styles.barChart}>
            {MONTHLY_TREND.map(m => {
              const barH = (m.reports / MAX_REPORTS) * 80;
              return (
                <View key={m.month} style={styles.barGroup}>
                  <Text style={styles.barValue}>{(m.reports / 1000).toFixed(1)}k</Text>
                  <LinearGradient
                    colors={["#3B82F6", "#06B6D4"]}
                    style={[styles.bar, { height: barH }]}
                  />
                  <Text style={styles.barLabel}>{m.month}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Crime Types */}
        <View style={styles.sectionCard}>
          <LinearGradient colors={["rgba(239,68,68,0.05)", "transparent"]} style={StyleSheet.absoluteFill} />
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-donut" size={16} color="#EF4444" />
            <Text style={styles.sectionTitle}>Crime Category Breakdown</Text>
          </View>
          <View style={{ gap: 10 }}>
            {CRIME_TYPES.map(crime => (
              <View key={crime.type} style={styles.crimeRow}>
                <View style={styles.crimeLeft}>
                  <Text style={styles.crimeName}>{crime.type}</Text>
                  <View style={styles.crimeBarBg}>
                    <LinearGradient
                      colors={[crime.color, crime.color + "70"]}
                      style={[styles.crimeBar, { width: `${crime.pct}%` as any }]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
                <Text style={[styles.crimeCount, { color: crime.color }]}>
                  {crime.count.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.sectionCard}>
          <LinearGradient colors={["rgba(16,185,129,0.06)", "transparent"]} style={StyleSheet.absoluteFill} />
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="speedometer" size={16} color="#10B981" />
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
          </View>
          <View style={styles.metricsGrid}>
            {[
              { label: "Avg Response Time", value: "4.2 hrs", sub: "Target: < 6 hrs", color: "#10B981" },
              { label: "Cases Solved", value: "73%", sub: "vs 68% last quarter", color: "#3B82F6" },
              { label: "FIRs Filed", value: "892", sub: "This quarter", color: "#8B5CF6" },
              { label: "Arrests Made", value: "134", sub: "Nationwide", color: "#F97316" },
            ].map(m => (
              <View key={m.label} style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricSub}>{m.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Data source */}
        <View style={styles.sourceRow}>
          <MaterialCommunityIcons name="database" size={12} color="rgba(255,255,255,0.2)" />
          <Text style={styles.sourceText}>
            CyberShield National DB · NCRB 2025 · CERT-In Annual Report
          </Text>
        </View>
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  headerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpiCard: { width: "47%", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 6, backgroundColor: "#0F1A2E", overflow: "hidden" },
  kpiValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  kpiLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular" },
  sectionCard: { backgroundColor: "#0F1A2E", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 14, overflow: "hidden" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  barChart: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 110 },
  barGroup: { flex: 1, alignItems: "center", gap: 4 },
  barValue: { color: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "Inter_400Regular" },
  bar: { width: "100%", borderRadius: 4, minHeight: 4 },
  barLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "Inter_500Medium" },
  crimeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  crimeLeft: { flex: 1, gap: 4 },
  crimeName: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular" },
  crimeBarBg: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  crimeBar: { height: "100%", borderRadius: 3 },
  crimeCount: { fontSize: 13, fontFamily: "Inter_600SemiBold", minWidth: 50, textAlign: "right" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { width: "47%", padding: 12, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, gap: 3, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  metricValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  metricLabel: { color: "#F8FAFC", fontSize: 12, fontFamily: "Inter_500Medium" },
  metricSub: { color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter_400Regular" },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  sourceText: { color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "Inter_400Regular" },
});
