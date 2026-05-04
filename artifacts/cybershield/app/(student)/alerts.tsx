import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, TouchableOpacity, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16", info: "#60A5FA",
};

export default function AlertsScreen() {
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
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiFetch("/alerts?limit=50"),
  });

  const alerts = data?.alerts || [];
  const criticalCount = alerts.filter((a: any) => a.severity === "critical").length;

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#200A0A", "#1A0F0F", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.titleRow}>
              <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.title}>Threat Intelligence</Text>
            </View>
            <Text style={styles.subtitle}>{alerts.length} active alerts from CERT-In</Text>
          </View>
          {criticalCount > 0 && (
            <View style={styles.criticalBadge}>
              <MaterialCommunityIcons name="alert" size={14} color="#EF4444" />
              <Text style={styles.criticalText}>{criticalCount} CRITICAL</Text>
            </View>
          )}
        </View>
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
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
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
                  <View style={styles.cardTopLeft}>
                    <View style={[styles.sevBadge, { backgroundColor: sc + "20" }]}>
                      <View style={[styles.sevDot, { backgroundColor: sc }]} />
                      <Text style={[styles.sevText, { color: sc }]}>{item.severity?.toUpperCase()}</Text>
                    </View>
                    {item.category && (
                      <View style={styles.catBadge}>
                        <Text style={styles.catText}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                  {item.is_verified ? (
                    <View style={styles.verifiedBadge}>
                      <Feather name="shield" size={11} color="#10B981" />
                      <Text style={styles.verifiedText}>CERT-In</Text>
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
                    <Text style={styles.statesText} numberOfLines={1}>
                      Affected: {states.join(", ")}
                    </Text>
                  </View>
                )}
                <View style={styles.cardFooter}>
                  {item.source && (
                    <View style={styles.sourceRow}>
                      <Feather name="link" size={10} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.sourceText}>{item.source}</Text>
                    </View>
                  )}
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 14 }}>
              <MaterialCommunityIcons name="shield-check" size={64} color="rgba(255,255,255,0.06)" />
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontFamily: "Inter_400Regular" }}>No active alerts</Text>
              <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" }}>
                India's cyber landscape is currently clear.
              </Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
  title: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular" },
  criticalBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(239,68,68,0.15)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)" },
  criticalText: { color: "#EF4444", fontSize: 11, fontFamily: "Inter_700Bold" },
  card: { backgroundColor: "#0F1A2E", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 4, gap: 10, overflow: "hidden" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTopLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  sevBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sevDot: { width: 6, height: 6, borderRadius: 3 },
  sevText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  catBadge: { backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_400Regular" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(16,185,129,0.12)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  verifiedText: { color: "#10B981", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  unverifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(234,179,8,0.12)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  unverifiedText: { color: "#EAB308", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  cardTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardDesc: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  statesRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statesText: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sourceText: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "Inter_400Regular" },
  dateText: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "Inter_400Regular" },
});
