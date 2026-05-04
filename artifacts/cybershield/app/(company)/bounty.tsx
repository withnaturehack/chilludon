import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

export default function BountyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["bounty-programs"],
    queryFn: () => apiFetch("/companies/bounty-programs"),
  });

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0A1A30", "#112244", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Bug Bounty Programs</Text>
            <Text style={styles.headerSub}>Active programs receiving reports</Text>
          </View>
          <LinearGradient colors={["#059669", "#10B981"]} style={styles.headerIcon}>
            <MaterialCommunityIcons name="bug-check" size={20} color="#FFF" />
          </LinearGradient>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          style={{ opacity: fadeAnim }}
          data={data?.programs || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <LinearGradient colors={["rgba(16,185,129,0.06)", "transparent"]} style={StyleSheet.absoluteFill} />
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.companyName}>{item.company_name}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>ACTIVE</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>

              {item.description && (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              )}

              {item.scope && (
                <View style={styles.scopeBox}>
                  <Text style={styles.scopeLabel}>In Scope</Text>
                  <Text style={styles.scopeText} numberOfLines={2}>{item.scope}</Text>
                </View>
              )}

              {/* Reward Range */}
              {item.min_reward && item.max_reward && (
                <LinearGradient colors={["rgba(16,185,129,0.12)", "rgba(5,150,105,0.06)"]} style={styles.rewardCard}>
                  <MaterialCommunityIcons name="cash" size={16} color="#10B981" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rewardLabel}>Reward Range</Text>
                    <Text style={styles.rewardAmount}>
                      ₹{item.min_reward?.toLocaleString("en-IN")} – ₹{item.max_reward?.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </LinearGradient>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Feather name="file-text" size={14} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.statText}>{item.total_reports || 0} reports</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                  <Text style={[styles.statText, { color: "#10B981" }]}>{item.verified_reports || 0} verified</Text>
                </View>
                <View style={styles.statItem}>
                  <Feather name="trending-up" size={14} color="#3B82F6" />
                  <Text style={[styles.statText, { color: "#3B82F6" }]}>
                    ₹{(item.total_paid || 0).toLocaleString("en-IN")} paid
                  </Text>
                </View>
              </View>

              {item.start_date && item.end_date && (
                <View style={styles.dateRow}>
                  <Feather name="calendar" size={12} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.dateText}>
                    {new Date(item.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    {" → "}
                    {new Date(item.end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 14 }}>
              <MaterialCommunityIcons name="bug-outline" size={64} color="rgba(255,255,255,0.06)" />
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontFamily: "Inter_400Regular" }}>No bounty programs</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  headerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "#0F1A2E", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 12, overflow: "hidden" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  companyName: { color: "#06B6D4", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  activeBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  activeText: { color: "#10B981", fontSize: 10, fontFamily: "Inter_700Bold" },
  cardTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  cardDesc: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  scopeBox: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 10, gap: 4 },
  scopeLabel: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  scopeText: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  rewardCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
  rewardLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_500Medium" },
  rewardAmount: { color: "#10B981", fontSize: 16, fontFamily: "Inter_700Bold" },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_500Medium" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "Inter_400Regular" },
});
