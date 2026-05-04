import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Animated, Platform, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16",
};

const MOCK_REPORTS = [
  {
    id: "rpt-001", title: "SQL Injection in /api/v2/search endpoint", severity: "critical",
    type: "SQL Injection", status: "pending", reporter: "Arjun Sharma", date: "2025-05-03",
    program: "Web Application", points: 0,
    desc: "The /api/v2/search endpoint is vulnerable to blind SQL injection via the `q` parameter. An attacker can extract the full database schema and all user records.",
  },
  {
    id: "rpt-002", title: "Stored XSS in User Profile Bio Field", severity: "high",
    type: "XSS", status: "under_review", reporter: "Priya Nair", date: "2025-05-02",
    program: "Web Application", points: 15000,
    desc: "The user profile bio field does not properly sanitize HTML input, allowing stored XSS. Malicious scripts execute for every user who visits the profile.",
  },
  {
    id: "rpt-003", title: "Insecure Direct Object Reference in Order API", severity: "high",
    type: "IDOR", status: "verified", reporter: "Rahul Gupta", date: "2025-05-01",
    program: "API Security", points: 25000,
    desc: "The GET /orders/{id} endpoint lacks authorization checks, allowing any authenticated user to view any order by simply modifying the order ID.",
  },
  {
    id: "rpt-004", title: "Exposed S3 Bucket with PII Data", severity: "critical",
    type: "Misconfiguration", status: "verified", reporter: "Kavya Reddy", date: "2025-04-30",
    program: "Cloud Security", points: 50000,
    desc: "An AWS S3 bucket containing user PII (name, email, phone, Aadhaar numbers) was publicly accessible without authentication.",
  },
  {
    id: "rpt-005", title: "Missing Rate Limiting on Login Endpoint", severity: "medium",
    type: "Brute Force", status: "pending", reporter: "Amit Patel", date: "2025-04-29",
    program: "Web Application", points: 0,
    desc: "The /auth/login endpoint has no rate limiting or CAPTCHA, making it vulnerable to credential stuffing and brute force attacks.",
  },
  {
    id: "rpt-006", title: "JWT Token Expiry Not Enforced", severity: "medium",
    type: "Auth Issue", status: "rejected", reporter: "Sneha Iyer", date: "2025-04-28",
    program: "API Security", points: 0,
    desc: "JWT tokens issued by the authentication service do not expire. Once issued, a token remains valid indefinitely even after logout.",
  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308", under_review: "#60A5FA", verified: "#10B981", rejected: "#EF4444",
};

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const filtered = filter === "all"
    ? MOCK_REPORTS
    : MOCK_REPORTS.filter(r => r.severity === filter || r.status === filter);

  const counts = {
    critical: MOCK_REPORTS.filter(r => r.severity === "critical").length,
    high: MOCK_REPORTS.filter(r => r.severity === "high").length,
    pending: MOCK_REPORTS.filter(r => r.status === "pending").length,
    verified: MOCK_REPORTS.filter(r => r.status === "verified").length,
  };

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient colors={["#0A1A30", "#112244", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Vulnerability Reports</Text>
            <Text style={styles.headerSub}>{MOCK_REPORTS.length} total reports received</Text>
          </View>
          <LinearGradient colors={["#DC2626", "#EF4444"]} style={styles.headerIcon}>
            <MaterialCommunityIcons name="shield-bug" size={20} color="#FFF" />
          </LinearGradient>
        </View>

        {/* Summary stats */}
        <View style={styles.summaryRow}>
          {[
            { label: "Critical", count: counts.critical, color: "#EF4444" },
            { label: "High", count: counts.high, color: "#F97316" },
            { label: "Pending", count: counts.pending, color: "#EAB308" },
            { label: "Verified", count: counts.verified, color: "#10B981" },
          ].map(s => (
            <TouchableOpacity
              key={s.label}
              style={[styles.summaryItem, filter === s.label.toLowerCase() && { backgroundColor: s.color + "20" }]}
              onPress={() => setFilter(filter === s.label.toLowerCase() ? "all" : s.label.toLowerCase())}
            >
              <Text style={[styles.summaryCount, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10 }}>
          {["all", "pending", "under_review", "verified", "rejected"].map(s => {
            const active = filter === s;
            const sc = STATUS_COLORS[s] || "#06B6D4";
            return (
              <TouchableOpacity
                key={s}
                style={[styles.chip, active && { backgroundColor: sc + "20", borderColor: sc }]}
                onPress={() => setFilter(s)}
              >
                <Text style={[styles.chipText, active && { color: sc }]}>
                  {s === "all" ? "All Reports" : s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      <Animated.FlatList
        style={{ opacity: fadeAnim }}
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const sevc = SEV_COLORS[item.severity] || "#666";
          const stc = STATUS_COLORS[item.status] || "#666";
          return (
            <View style={[styles.reportCard, { borderLeftColor: sevc }]}>
              <LinearGradient colors={[sevc + "06", "transparent"]} style={StyleSheet.absoluteFill} />
              <View style={styles.cardTop}>
                <View style={styles.badges}>
                  <View style={[styles.sevBadge, { backgroundColor: sevc + "20" }]}>
                    <Text style={[styles.sevText, { color: sevc }]}>{item.severity.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.stBadge, { backgroundColor: stc + "15" }]}>
                    <Text style={[styles.stText, { color: stc }]}>{item.status.replace("_", " ").toUpperCase()}</Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                </View>
                {item.points > 0 && (
                  <View style={styles.bountyTag}>
                    <MaterialCommunityIcons name="cash" size={12} color="#10B981" />
                    <Text style={styles.bountyText}>₹{item.points.toLocaleString()}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.reportTitle}>{item.title}</Text>
              <Text style={styles.reportDesc} numberOfLines={2}>{item.desc}</Text>
              <View style={styles.cardFooter}>
                <View style={styles.reporterRow}>
                  <Feather name="user" size={11} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.reporterText}>{item.reporter}</Text>
                </View>
                <View style={styles.programTag}>
                  <Text style={styles.programText}>{item.program}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
            <MaterialCommunityIcons name="shield-search" size={64} color="rgba(255,255,255,0.06)" />
            <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 15, fontFamily: "Inter_400Regular" }}>
              No reports matching filter
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  headerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  summaryItem: { flex: 1, alignItems: "center", padding: 8, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 2 },
  summaryCount: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_400Regular" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  chipText: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_500Medium" },
  reportCard: { backgroundColor: "#0F1A2E", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 4, gap: 8, overflow: "hidden" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badges: { flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  stBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.06)" },
  typeText: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "Inter_400Regular" },
  bountyTag: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(16,185,129,0.12)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bountyText: { color: "#10B981", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  reportTitle: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  reportDesc: { color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  reporterRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  reporterText: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular" },
  programTag: { backgroundColor: "rgba(6,182,212,0.1)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  programText: { color: "#06B6D4", fontSize: 10, fontFamily: "Inter_500Medium" },
  dateText: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "Inter_400Regular", marginLeft: "auto" },
});
