import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

export default function BountyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data, isLoading } = useQuery({ queryKey: ["bounty-programs"], queryFn: () => apiFetch("/companies/bounty-programs") });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Bug Bounty Programs</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Active programs receiving vulnerability reports
        </Text>
      </View>
      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={data?.programs || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.company, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>{item.company_name}</Text>
                <View style={[styles.activeBadge, { backgroundColor: "#10B981" + "20" }]}>
                  <Text style={[styles.activeText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>ACTIVE</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{item.title}</Text>
              {item.description && (
                <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              {item.scope && (
                <View style={[styles.scopeBox, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.scopeLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Scope:</Text>
                  <Text style={[styles.scopeText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>{item.scope}</Text>
                </View>
              )}
              <View style={styles.statsRow}>
                {item.min_reward && item.max_reward && (
                  <View style={styles.stat}>
                    <MaterialCommunityIcons name="cash" size={16} color="#10B981" />
                    <Text style={[styles.statText, { color: "#10B981", fontFamily: "Inter_700Bold" }]}>
                      ₹{item.min_reward?.toLocaleString()} – ₹{item.max_reward?.toLocaleString()}
                    </Text>
                  </View>
                )}
                <View style={styles.stat}>
                  <Feather name="file-text" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.total_reports} reports</Text>
                </View>
                <View style={styles.stat}>
                  <Feather name="trending-up" size={14} color={colors.primary} />
                  <Text style={[styles.statLabel, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>₹{(item.total_paid || 0).toLocaleString()} paid</Text>
                </View>
              </View>
            </View>
          )}
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
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  company: { fontSize: 13 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  activeText: { fontSize: 10 },
  cardTitle: { fontSize: 16 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  scopeBox: { padding: 10, borderRadius: 8 },
  scopeLabel: { fontSize: 11, marginBottom: 2 },
  scopeText: { fontSize: 12 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 14 },
  statLabel: { fontSize: 12 },
});
