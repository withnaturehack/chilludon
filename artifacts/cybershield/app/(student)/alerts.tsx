import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16",
};

export default function AlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data, isLoading } = useQuery({ queryKey: ["alerts"], queryFn: () => apiFetch("/alerts?limit=50") });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Cyber Threat Alerts</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Real-time national threat intelligence
        </Text>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={data?.alerts || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sc = SEV_COLORS[item.severity] || colors.mutedForeground;
            const states = (() => { try { return JSON.parse(item.affected_states || "[]"); } catch { return []; } })();
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: sc }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.sevBadge, { backgroundColor: sc + "20" }]}>
                    <Text style={[styles.sevText, { color: sc, fontFamily: "Inter_700Bold" }]}>{item.severity?.toUpperCase()}</Text>
                  </View>
                  {item.category && (
                    <View style={[styles.catBadge, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.catText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{item.category}</Text>
                    </View>
                  )}
                  {item.is_verified ? (
                    <View style={[styles.verBadge, { backgroundColor: "#10B981" + "20" }]}>
                      <Feather name="check-circle" size={10} color="#10B981" />
                      <Text style={[styles.verText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>CERT-In Verified</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{item.title}</Text>
                {item.description && (
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={3}>
                    {item.description}
                  </Text>
                )}
                {states.length > 0 && (
                  <View style={styles.statesRow}>
                    <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.states, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                      {states.join(", ")}
                    </Text>
                  </View>
                )}
                <View style={styles.footer}>
                  {item.source && (
                    <Text style={[styles.source, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Source: {item.source}</Text>
                  )}
                  <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22 },
  subtitle: { fontSize: 13, marginTop: 2 },
  card: { borderRadius: 16, padding: 14, borderWidth: 1, borderLeftWidth: 4, gap: 10 },
  cardHeader: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 10 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 10 },
  verBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  verText: { fontSize: 10 },
  cardTitle: { fontSize: 15 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  statesRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  states: { flex: 1, fontSize: 12 },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  source: { fontSize: 12 },
  date: { fontSize: 11 },
});
