import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16",
};

export default function CasesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["police-cases"], queryFn: () => apiFetch("/police/cases"),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Active Cases</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {data?.total || 0} cases
        </Text>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={data?.cases || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => {
            const pc = PRIORITY_COLORS[item.priority] || "#666";
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: pc }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.priorityBadge, { backgroundColor: pc + "20" }]}>
                    <Text style={[styles.priorityText, { color: pc, fontFamily: "Inter_700Bold" }]}>
                      {item.priority?.toUpperCase()} PRIORITY
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === "open" ? "#3B82F6" + "20" : "#10B981" + "20" }]}>
                    <Text style={[styles.statusText, { color: item.status === "open" ? "#3B82F6" : "#10B981", fontFamily: "Inter_600SemiBold" }]}>
                      {item.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {item.case_number && (
                  <Text style={[styles.caseNumber, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    Case #{item.case_number}
                  </Text>
                )}

                {item.submission && (
                  <>
                    <Text style={[styles.subTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {item.submission.title}
                    </Text>
                    <Text style={[styles.subDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                      {item.submission.description}
                    </Text>
                    {item.submission.severity && (
                      <View style={[styles.sevBadge, { backgroundColor: (PRIORITY_COLORS[item.submission.severity] || "#666") + "15" }]}>
                        <Text style={[styles.sevText, { color: PRIORITY_COLORS[item.submission.severity] || "#666", fontFamily: "Inter_500Medium" }]}>
                          {item.submission.severity?.toUpperCase()} severity
                        </Text>
                      </View>
                    )}
                  </>
                )}

                <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Created: {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="briefcase-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>No cases yet</Text>
            </View>
          }
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
  cardHeader: { flexDirection: "row", gap: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10 },
  caseNumber: { fontSize: 15 },
  subTitle: { fontSize: 14 },
  subDesc: { fontSize: 13, lineHeight: 18 },
  sevBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 11 },
  date: { fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
});
