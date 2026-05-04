import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308", under_review: "#60A5FA", verified: "#10B981",
  rejected: "#EF4444", fraud: "#DC2626", escalated: "#8B5CF6",
};
const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16", info: "#60A5FA",
};

export default function SubmissionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const [statusFilter, setStatusFilter] = useState("all");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["my-submissions"],
    queryFn: () => apiFetch("/submissions?limit=100"),
  });

  const all = data?.submissions || [];
  const filtered = statusFilter === "all" ? all : all.filter((s: any) => s.status === statusFilter);
  const counts = all.reduce((acc: any, s: any) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {});

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0F2040", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>My Reports</Text>
            <Text style={styles.headerSub}>{data?.total || 0} total submissions</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push("/(student)/submit")}
            activeOpacity={0.8}
          >
            <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.newBtnGrad}>
              <Feather name="plus" size={16} color="#FFF" />
              <Text style={styles.newBtnText}>New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {/* Status filter pills */}
        <FlatList
          horizontal
          data={["all", "pending", "under_review", "verified", "rejected", "escalated"]}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item: s }) => {
            const sc = STATUS_COLORS[s] || "#3B82F6";
            const active = statusFilter === s;
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && { backgroundColor: sc + "25", borderColor: sc }]}
                onPress={() => setStatusFilter(s)}
                activeOpacity={0.75}
              >
                {counts[s] !== undefined && s !== "all" && (
                  <View style={[styles.countDot, { backgroundColor: sc }]} />
                )}
                <Text style={[styles.filterText, active && { color: sc }]}>
                  {s.replace("_", " ")}{s !== "all" && counts[s] ? ` (${counts[s]})` : s === "all" ? ` (${all.length})` : ""}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          style={{ opacity: fadeAnim }}
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] || "#666";
            const sevc = SEV_COLORS[item.severity] || "#666";
            return (
              <View style={[styles.card, { borderLeftColor: sc }]}>
                <LinearGradient colors={[sc + "06", "transparent"]} style={StyleSheet.absoluteFill} />
                <View style={styles.cardBadges}>
                  <View style={[styles.badge, { backgroundColor: sc + "20" }]}>
                    <Text style={[styles.badgeText, { color: sc }]}>
                      {item.status?.replace(/_/g, " ").toUpperCase()}
                    </Text>
                  </View>
                  {item.severity && (
                    <View style={[styles.badge, { backgroundColor: sevc + "15" }]}>
                      <Text style={[styles.badgeText, { color: sevc }]}>{item.severity}</Text>
                    </View>
                  )}
                  {item.type && (
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{item.type.replace("_", " ")}</Text>
                    </View>
                  )}
                  {item.points_awarded > 0 && (
                    <View style={styles.ptsBadge}>
                      <MaterialCommunityIcons name="star" size={10} color="#10B981" />
                      <Text style={styles.ptsText}>+{item.points_awarded} pts</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                )}
                {item.reviewer_notes && (
                  <View style={styles.reviewNote}>
                    <Feather name="message-square" size={12} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.reviewNoteText} numberOfLines={2}>{item.reviewer_notes}</Text>
                  </View>
                )}
                {item.ai_analysis && (
                  <View style={styles.aiBox}>
                    <MaterialCommunityIcons name="robot" size={12} color="#3B82F6" />
                    <Text style={styles.aiText} numberOfLines={2}>{item.ai_analysis}</Text>
                  </View>
                )}
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>
                    {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    {item.category ? ` · ${item.category}` : ""}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <LinearGradient colors={["rgba(59,130,246,0.15)", "rgba(6,182,212,0.08)"]} style={styles.emptyIcon}>
                <Feather name="file-text" size={40} color="#3B82F6" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptyText}>Submit your first bug or vulnerability report to start earning points!</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/(student)/submit")}>
                <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>Submit First Report</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  newBtn: { borderRadius: 12, overflow: "hidden" },
  newBtnGrad: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  newBtnText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  countDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "Inter_500Medium" },
  card: { backgroundColor: "#0F1A2E", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 4, gap: 8, overflow: "hidden" },
  cardBadges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  typeBadge: { backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_400Regular" },
  ptsBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ptsText: { color: "#10B981", fontSize: 10, fontFamily: "Inter_700Bold" },
  cardTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardDesc: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  reviewNote: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "rgba(255,255,255,0.04)", padding: 10, borderRadius: 8 },
  reviewNoteText: { flex: 1, color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular" },
  aiBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "rgba(59,130,246,0.06)", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "rgba(59,130,246,0.15)" },
  aiText: { flex: 1, color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "Inter_400Regular" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  cardDate: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 60, gap: 14 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "#F8FAFC", fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { color: "rgba(255,255,255,0.35)", fontSize: 13, textAlign: "center", fontFamily: "Inter_400Regular", paddingHorizontal: 20 },
  emptyBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  emptyBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
