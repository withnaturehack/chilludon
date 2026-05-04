import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

export default function InternshipsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const qc = useQueryClient();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data, isLoading } = useQuery({ queryKey: ["internships"], queryFn: () => apiFetch("/internships") });
  const { data: myApps } = useQuery({ queryKey: ["my-applications"], queryFn: () => apiFetch("/internships/my-applications") });

  const applyMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/internships/${id}/apply`, { method: "POST", body: JSON.stringify({ cover_letter: "I am excited to apply for this internship..." }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Applied!", "Your application has been submitted successfully.");
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  const appliedIds = new Set((myApps?.applications || []).map((a: any) => a.application?.internship_id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Internships</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Govt & private cybersecurity opportunities
        </Text>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={data?.internships || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const applied = appliedIds.has(item.id);
            const isGovt = item.org_type === "government";
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    {isGovt && (
                      <View style={[styles.govtBadge, { backgroundColor: "#F59E0B" + "20" }]}>
                        <MaterialCommunityIcons name="shield-star" size={12} color="#F59E0B" />
                        <Text style={[styles.govtText, { color: "#F59E0B", fontFamily: "Inter_600SemiBold" }]}>GOVT</Text>
                      </View>
                    )}
                    <View style={[styles.typeBadge, { backgroundColor: colors.primary + "15" }]}>
                      <Text style={[styles.typeText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{item.location_type || "remote"}</Text>
                    </View>
                  </View>
                  {item.stipend_amount && (
                    <Text style={[styles.stipend, { color: "#10B981", fontFamily: "Inter_700Bold" }]}>
                      ₹{item.stipend_amount?.toLocaleString()}/mo
                    </Text>
                  )}
                </View>
                <Text style={[styles.orgName, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>{item.org_name}</Text>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{item.title}</Text>
                {item.description && (
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.cardMeta}>
                  {item.duration_months && (
                    <View style={styles.metaItem}>
                      <Feather name="clock" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.duration_months} months</Text>
                    </View>
                  )}
                  {(item.location_city || item.location_state) && (
                    <View style={styles.metaItem}>
                      <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {[item.location_city, item.location_state].filter(Boolean).join(", ")}
                      </Text>
                    </View>
                  )}
                  <View style={styles.metaItem}>
                    <Feather name="users" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {item.filled_seats}/{item.total_seats} filled
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.applyBtn, { backgroundColor: applied ? "#10B981" + "20" : colors.primary }]}
                  onPress={() => { if (!applied) applyMutation.mutate(item.id); }}
                  activeOpacity={0.8}
                >
                  {applied ? (
                    <>
                      <Feather name="check-circle" size={16} color="#10B981" />
                      <Text style={[styles.applyBtnText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>Applied</Text>
                    </>
                  ) : (
                    <Text style={[styles.applyBtnText, { color: "#FFF", fontFamily: "Inter_600SemiBold" }]}>
                      {applyMutation.isPending ? "Applying..." : "Apply Now"}
                    </Text>
                  )}
                </TouchableOpacity>
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
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardHeaderLeft: { flexDirection: "row", gap: 8 },
  govtBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  govtText: { fontSize: 10 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 11 },
  stipend: { fontSize: 16 },
  orgName: { fontSize: 13 },
  cardTitle: { fontSize: 16 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 44, borderRadius: 10 },
  applyBtnText: { fontSize: 15 },
});
