import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16", info: "#60A5FA",
};

export default function PoliceAlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["alerts-police"],
    queryFn: () => apiFetch("/alerts?limit=50"),
  });

  const alerts = data?.alerts || [];
  const criticalCount = alerts.filter((a: any) => a.severity === "critical").length;

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#1A0A0A", "#1A0F0F", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.liveRow}>
              <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.liveText}>LIVE FEED</Text>
            </View>
            <Text style={styles.headerTitle}>National Threat Alerts</Text>
            <Text style={styles.headerSub}>Active cyber threats requiring police attention</Text>
          </View>
        </View>
        {criticalCount > 0 && (
          <LinearGradient colors={["rgba(239,68,68,0.2)", "rgba(220,38,38,0.1)"]} style={styles.criticalBar}>
            <MaterialCommunityIcons name="alert" size={16} color="#EF4444" />
            <Text style={styles.criticalBarText}>{criticalCount} CRITICAL threat{criticalCount > 1 ? "s" : ""} require immediate attention</Text>
          </LinearGradient>
        )}
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#EF4444" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          style={{ opacity: fadeAnim }}
          data={alerts}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => {
            const sc = SEV_COLORS[item.severity] || "#666";
            const states = (() => { try { return JSON.parse(item.affected_states || "[]"); } catch { return []; } })();
            return (
              <View style={[styles.card, { borderLeftColor: sc }]}>
                <LinearGradient colors={[sc + "06", "transparent"]} style={StyleSheet.absoluteFill} />
                <View style={styles.cardTop}>
                  <View style={[styles.sevBadge, { backgroundColor: sc + "20" }]}>
                    <View style={[styles.sevDot, { backgroundColor: sc }]} />
                    <Text style={[styles.sevText, { color: sc }]}>{item.severity?.toUpperCase()}</Text>
                  </View>
                  {item.is_verified ? (
                    <View style={styles.verifiedBadge}>
                      <Feather name="shield" size={11} color="#10B981" />
                      <Text style={styles.verifiedText}>CERT-In Verified</Text>
                    </View>
                  ) : (
                    <View style={styles.unverifiedBadge}>
                      <Feather name="alert-circle" size={11} color="#EAB308" />
                      <Text style={styles.unverifiedText}>Unverified</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>
                )}
                {states.length > 0 && (
                  <View style={styles.statesRow}>
                    <Feather name="map-pin" size={12} color="rgba(255,255,255,0.35)" />
                    <Text style={styles.statesText}>Affected States: {states.join(", ")}</Text>
                  </View>
                )}
                <View style={styles.cardFooter}>
                  <Text style={styles.sourceText}>{item.source || "CERT-In"}</Text>
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 14 }}>
              <MaterialCommunityIcons name="shield-check" size={64} color="rgba(255,255,255,0.06)" />
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontFamily: "Inter_400Regular" }}>No active alerts</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { marginBottom: 12 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
  liveText: { color: "#EF4444", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  criticalBar: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)" },
  criticalBarText: { color: "#EF4444", fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  card: { backgroundColor: "#0F1A2E", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 4, gap: 10, overflow: "hidden" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  sevBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sevDot: { width: 6, height: 6, borderRadius: 3 },
  sevText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(16,185,129,0.12)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  verifiedText: { color: "#10B981", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  unverifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(234,179,8,0.12)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  unverifiedText: { color: "#EAB308", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  cardTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardDesc: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  statesRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statesText: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  sourceText: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "Inter_400Regular" },
  dateText: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "Inter_400Regular" },
});
