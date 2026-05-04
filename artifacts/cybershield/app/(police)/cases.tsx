import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, TouchableOpacity, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const PRIORITY_GRADS: Record<string, [string, string]> = {
  critical: ["#DC2626", "#EF4444"],
  high: ["#EA580C", "#F97316"],
  medium: ["#D97706", "#F59E0B"],
  low: ["#059669", "#10B981"],
};

export default function CasesScreen() {
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
    queryKey: ["police-cases"],
    queryFn: () => apiFetch("/police/cases"),
  });

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0A1F3A", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Active Cases</Text>
            <Text style={styles.headerSub}>{data?.total || 0} cases · Escalated reports</Text>
          </View>
          <LinearGradient colors={["#DC2626", "#EF4444"]} style={styles.casesIcon}>
            <MaterialCommunityIcons name="briefcase-outline" size={20} color="#FFF" />
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
          data={data?.cases || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => {
            const [pc1, pc2] = PRIORITY_GRADS[item.priority] || PRIORITY_GRADS.medium;
            const isOpen = item.status === "open";
            return (
              <View style={styles.card}>
                <LinearGradient colors={[pc1 + "08", "transparent"]} style={StyleSheet.absoluteFill} />
                <View style={styles.cardTop}>
                  <LinearGradient colors={[pc1, pc2]} style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>{item.priority?.toUpperCase()}</Text>
                  </LinearGradient>
                  <View style={[styles.statusBadge, { backgroundColor: isOpen ? "rgba(59,130,246,0.2)" : "rgba(16,185,129,0.2)" }]}>
                    <View style={[styles.statusDot, { backgroundColor: isOpen ? "#3B82F6" : "#10B981" }]} />
                    <Text style={[styles.statusText, { color: isOpen ? "#3B82F6" : "#10B981" }]}>
                      {item.status?.toUpperCase()}
                    </Text>
                  </View>
                  {item.fir_number && (
                    <View style={styles.firBadge}>
                      <Text style={styles.firText}>FIR: {item.fir_number}</Text>
                    </View>
                  )}
                </View>

                {item.case_number && (
                  <View style={styles.caseNumRow}>
                    <MaterialCommunityIcons name="file-document" size={14} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.caseNum}>Case #{item.case_number}</Text>
                  </View>
                )}

                {item.submission && (
                  <>
                    <Text style={styles.subTitle} numberOfLines={2}>{item.submission.title}</Text>
                    <Text style={styles.subDesc} numberOfLines={2}>{item.submission.description}</Text>
                    <View style={styles.subMeta}>
                      {item.submission.severity && (
                        <View style={[styles.sevBadge, { backgroundColor: (PRIORITY_GRADS[item.submission.severity]?.[0] || "#666") + "20" }]}>
                          <Text style={[styles.sevText, { color: PRIORITY_GRADS[item.submission.severity]?.[0] || "#666" }]}>
                            {item.submission.severity.toUpperCase()}
                          </Text>
                        </View>
                      )}
                      {item.submission.category && (
                        <View style={styles.catBadge}>
                          <Text style={styles.catText}>{item.submission.category}</Text>
                        </View>
                      )}
                    </View>
                  </>
                )}

                {item.notes && (
                  <View style={styles.notesBox}>
                    <Feather name="message-square" size={12} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
                  </View>
                )}

                <Text style={styles.dateText}>
                  Created {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="briefcase-outline" size={64} color="rgba(255,255,255,0.06)" />
              <Text style={styles.emptyText}>No active cases</Text>
              <Text style={styles.emptySubText}>Escalated submissions will appear here as cases</Text>
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
  casesIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "#0F1A2E", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 10, overflow: "hidden" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { color: "#FFF", fontSize: 10, fontFamily: "Inter_700Bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  firBadge: { backgroundColor: "rgba(139,92,246,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  firText: { color: "#8B5CF6", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  caseNumRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  caseNum: { color: "#3B82F6", fontSize: 14, fontFamily: "Inter_700Bold" },
  subTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  subDesc: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  subMeta: { flexDirection: "row", gap: 8 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  catBadge: { backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_400Regular" },
  notesBox: { flexDirection: "row", gap: 8, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 10 },
  notesText: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  dateText: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: "rgba(255,255,255,0.35)", fontSize: 16, fontFamily: "Inter_400Regular" },
  emptySubText: { color: "rgba(255,255,255,0.2)", fontSize: 13, textAlign: "center", fontFamily: "Inter_400Regular" },
});
