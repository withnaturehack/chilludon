import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16",
};

export default function PoliceAlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data, isLoading } = useQuery({ queryKey: ["alerts-police"], queryFn: () => apiFetch("/alerts?limit=50") });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>National Threat Alerts</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Active cyber threats requiring attention
        </Text>
      </View>
      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={data?.alerts || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sc = SEV_COLORS[item.severity] || "#666";
            const states = (() => { try { return JSON.parse(item.affected_states || "[]"); } catch { return []; } })();
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: sc }]}>
                <View style={styles.row}>
                  <View style={[styles.sevBadge, { backgroundColor: sc + "20" }]}>
                    <Text style={[styles.sevText, { color: sc, fontFamily: "Inter_700Bold" }]}>{item.severity?.toUpperCase()}</Text>
                  </View>
                  {item.is_verified ? <Feather name="check-circle" size={14} color="#10B981" /> : <Feather name="alert-circle" size={14} color="#EAB308" />}
                </View>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{item.title}</Text>
                {item.description && (
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={3}>{item.description}</Text>
                )}
                {states.length > 0 && (
                  <Text style={[styles.states, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Affected: {states.join(", ")}
                  </Text>
                )}
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
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, paddingTop: 16 },
  title: { fontSize: 22 },
  subtitle: { fontSize: 13, marginTop: 2 },
  card: { borderRadius: 16, padding: 14, borderWidth: 1, borderLeftWidth: 4, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 10 },
  cardTitle: { fontSize: 15 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  states: { fontSize: 12 },
});
