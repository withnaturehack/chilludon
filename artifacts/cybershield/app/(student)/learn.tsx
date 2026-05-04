import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#10B981", intermediate: "#3B82F6", advanced: "#8B5CF6", expert: "#EF4444",
};

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data, isLoading } = useQuery({ queryKey: ["courses"], queryFn: () => apiFetch("/courses") });
  const { data: myData } = useQuery({ queryKey: ["my-courses"], queryFn: () => apiFetch("/courses/my-courses") });

  const enrollMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/courses/${id}/enroll`, { method: "POST", body: "{}" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-courses"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Enrolled!", "You've successfully enrolled in this course.");
    },
  });

  const enrolledIds = new Set((myData?.courses || []).map((c: any) => c.enrollment?.course_id));
  const courses = (data?.courses || []).filter((c: any) => filter === "all" || c.level === filter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Learn</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          CERT-In certified cybersecurity courses
        </Text>
        <View style={styles.filters}>
          {["all", "beginner", "intermediate", "advanced", "expert"].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, { backgroundColor: filter === f ? colors.primary : colors.card, borderColor: filter === f ? colors.primary : colors.border }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, { color: filter === f ? "#FFF" : colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={courses}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const enrolled = enrolledIds.has(item.id);
            const lc = LEVEL_COLORS[item.level] || colors.primary;
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <View style={styles.cardBadges}>
                    <View style={[styles.lvlBadge, { backgroundColor: lc + "20" }]}>
                      <Text style={[styles.lvlText, { color: lc, fontFamily: "Inter_600SemiBold" }]}>{item.level?.toUpperCase()}</Text>
                    </View>
                    {item.is_free ? (
                      <View style={[styles.freeBadge, { backgroundColor: "#10B981" + "20" }]}>
                        <Text style={[styles.freeText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>FREE</Text>
                      </View>
                    ) : (
                      <View style={[styles.freeBadge, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.freeText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>₹{item.price}</Text>
                      </View>
                    )}
                    {item.is_certified ? (
                      <View style={[styles.certBadge, { backgroundColor: "#3B82F6" + "20" }]}>
                        <MaterialCommunityIcons name="certificate" size={10} color="#3B82F6" />
                        <Text style={[styles.certText, { color: "#3B82F6", fontFamily: "Inter_600SemiBold" }]}>CERTIFIED</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{item.title}</Text>
                {item.description && (
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>{item.description}</Text>
                )}
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Feather name="user" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.instructor_name}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="clock" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.duration_hours}h</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.rating}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="users" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.enrolled_count?.toLocaleString()}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.enrollBtn, { backgroundColor: enrolled ? "#10B981" + "20" : colors.primary }]}
                  onPress={() => { if (!enrolled) enrollMutation.mutate(item.id); }}
                  activeOpacity={0.8}
                >
                  {enrolled ? (
                    <>
                      <Feather name="check-circle" size={16} color="#10B981" />
                      <Text style={[styles.enrollBtnText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>Enrolled</Text>
                    </>
                  ) : (
                    <Text style={[styles.enrollBtnText, { color: "#FFF", fontFamily: "Inter_600SemiBold" }]}>
                      {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
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
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 22 },
  subtitle: { fontSize: 13, marginTop: 2, marginBottom: 12 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  cardTop: {},
  cardBadges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  lvlBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  lvlText: { fontSize: 10 },
  freeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  freeText: { fontSize: 10 },
  certBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  certText: { fontSize: 10 },
  cardTitle: { fontSize: 16 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  enrollBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 44, borderRadius: 10 },
  enrollBtnText: { fontSize: 15 },
});
