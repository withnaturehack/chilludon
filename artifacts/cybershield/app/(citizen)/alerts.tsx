import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Platform, Animated, ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16", info: "#60A5FA",
};
const FILTERS = ["all", "critical", "high", "medium", "low"];

export default function CitizenAlerts() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const [filter, setFilter] = useState("all");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["citizen-all-alerts"],
    queryFn: () => apiFetch("/citizen/alerts?limit=50"),
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const allAlerts = data?.alerts || [];
  const filtered = filter === "all" ? allAlerts : allAlerts.filter((a: any) => a.severity === filter);

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#1A0A05", "#2A1408", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.headerBadge}>
              <MaterialCommunityIcons name="alert" size={12} color="#F97316" />
              <Text style={styles.headerBadgeText}>Threat Intelligence</Text>
            </View>
            <Text style={styles.headerTitle}>Live Alerts</Text>
            <Text style={styles.headerSub}>CERT-In verified threat notifications</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{allAlerts.length}</Text>
            <Text style={styles.countLabel}>Active</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && { backgroundColor: (SEV_COLORS[f] || "#3B82F6") + "25", borderColor: (SEV_COLORS[f] || "#3B82F6") + "60" }]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            {f !== "all" && <View style={[styles.filterDot, { backgroundColor: SEV_COLORS[f] }]} />}
            <Text style={[styles.filterText, filter === f && { color: SEV_COLORS[f] || "#3B82F6" }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F97316" />}
      >
        {isLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator color="#F97316" size="large" />
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 12, paddingTop: 4 }}>
            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="shield-outline" size={40} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>No {filter === "all" ? "" : filter} alerts right now</Text>
              </View>
            )}
            {filtered.map((alert: any) => {
              const sc = SEV_COLORS[alert.severity] || "#666";
              return (
                <View key={alert.id} style={[styles.alertCard, { borderLeftColor: sc }]}>
                  <LinearGradient colors={[sc + "08", "transparent"]} style={StyleSheet.absoluteFill} />
                  <View style={styles.alertTop}>
                    <View style={[styles.sevBadge, { backgroundColor: sc + "20" }]}>
                      <Text style={[styles.sevText, { color: sc }]}>{alert.severity?.toUpperCase()}</Text>
                    </View>
                    {alert.is_verified === 1 && (
                      <View style={styles.verifiedBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={13} color="#10B981" />
                        <Text style={styles.verifiedText}>CERT-In Verified</Text>
                      </View>
                    )}
                    <Text style={styles.alertDate}>
                      {new Date(alert.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </Text>
                  </View>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDesc} numberOfLines={3}>{alert.description}</Text>
                  <View style={styles.alertFooter}>
                    <View style={styles.sourceRow}>
                      <MaterialCommunityIcons name="web" size={11} color="rgba(255,255,255,0.35)" />
                      <Text style={styles.sourceText}>{alert.source}</Text>
                    </View>
                    {alert.category && (
                      <View style={styles.catPill}>
                        <Text style={styles.catText}>{alert.category}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16, overflow: "hidden" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(249,115,22,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start", marginBottom: 8 },
  headerBadgeText: { color: "#F97316", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  headerTitle: { color: "#F8FAFC", fontSize: 26, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  countBadge: { alignItems: "center", backgroundColor: "rgba(239,68,68,0.12)", borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", borderRadius: 16, padding: 12 },
  countText: { color: "#EF4444", fontSize: 22, fontFamily: "Inter_700Bold" },
  countLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_400Regular" },
  filterBar: { maxHeight: 56, flexGrow: 0 },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_500Medium" },
  alertCard: { borderRadius: 18, padding: 16, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 4, gap: 10, overflow: "hidden" },
  alertTop: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedText: { color: "#10B981", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  alertDate: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Inter_400Regular", marginLeft: "auto" },
  alertTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_700Bold" },
  alertDesc: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  alertFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sourceText: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular" },
  catPill: { backgroundColor: "rgba(255,255,255,0.07)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_500Medium" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: "rgba(255,255,255,0.3)", fontSize: 15, fontFamily: "Inter_400Regular" },
});
