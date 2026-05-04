import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Alert, Animated } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const LEVEL_GRADS: Record<string, [string, string]> = {
  beginner: ["#059669", "#10B981"],
  intermediate: ["#1D4ED8", "#3B82F6"],
  advanced: ["#7C3AED", "#8B5CF6"],
  expert: ["#DC2626", "#EF4444"],
};

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const { data, isLoading } = useQuery({ queryKey: ["courses"], queryFn: () => apiFetch("/courses") });
  const { data: myData } = useQuery({ queryKey: ["my-courses"], queryFn: () => apiFetch("/courses/my-courses") });

  const enrollMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/courses/${id}/enroll`, { method: "POST", body: "{}" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-courses"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("🎓 Enrolled!", "You've been enrolled. Start learning and earn your certificate!");
    },
  });

  const enrolledIds = new Set((myData?.courses || []).map((c: any) => c.enrollment?.course_id));
  const courses = (data?.courses || []).filter((c: any) => filter === "all" || c.level === filter);

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0F2040", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient colors={["#7C3AED", "#8B5CF6"]} style={styles.learnBg}>
            <MaterialCommunityIcons name="school" size={24} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Cyber Academy</Text>
            <Text style={styles.headerSub}>CERT-In certified cybersecurity courses</Text>
          </View>
        </View>
        <FlatList
          horizontal
          data={["all", "beginner", "intermediate", "advanced", "expert"]}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item: f }) => {
            const [g1, g2] = LEVEL_GRADS[f] || ["#1D4ED8", "#3B82F6"];
            const active = filter === f;
            return (
              <TouchableOpacity onPress={() => setFilter(f)} activeOpacity={0.75}>
                {active ? (
                  <LinearGradient colors={f === "all" ? ["#1D4ED8", "#3B82F6"] : [g1, g2]} style={styles.filterActive}>
                    <Text style={styles.filterActiveText}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          style={{ opacity: fadeAnim }}
          data={courses}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const enrolled = enrolledIds.has(item.id);
            const [lc1, lc2] = LEVEL_GRADS[item.level] || LEVEL_GRADS.beginner;
            return (
              <View style={styles.card}>
                <LinearGradient colors={[lc1 + "10", "transparent"]} style={StyleSheet.absoluteFill} />
                <View style={styles.cardTop}>
                  <View style={styles.badges}>
                    <LinearGradient colors={[lc1, lc2]} style={styles.lvlBadge}>
                      <Text style={styles.lvlText}>{item.level?.toUpperCase()}</Text>
                    </LinearGradient>
                    {item.is_free ? (
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeText}>FREE</Text>
                      </View>
                    ) : (
                      <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>₹{item.price}</Text>
                      </View>
                    )}
                    {item.is_certified && (
                      <View style={styles.certBadge}>
                        <MaterialCommunityIcons name="certificate" size={11} color="#3B82F6" />
                        <Text style={styles.certText}>CERTIFIED</Text>
                      </View>
                    )}
                  </View>
                  {enrolled && (
                    <View style={styles.enrolledBadge}>
                      <Feather name="check-circle" size={14} color="#10B981" />
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                )}
                <View style={styles.cardMeta}>
                  {item.instructor_name && (
                    <View style={styles.metaItem}>
                      <Feather name="user" size={12} color="rgba(255,255,255,0.35)" />
                      <Text style={styles.metaText}>{item.instructor_name}</Text>
                    </View>
                  )}
                  {item.duration_hours && (
                    <View style={styles.metaItem}>
                      <Feather name="clock" size={12} color="rgba(255,255,255,0.35)" />
                      <Text style={styles.metaText}>{item.duration_hours}h</Text>
                    </View>
                  )}
                  {item.rating && (
                    <View style={styles.metaItem}>
                      <Feather name="star" size={12} color="#F59E0B" />
                      <Text style={[styles.metaText, { color: "#F59E0B" }]}>{item.rating}</Text>
                    </View>
                  )}
                  {item.enrolled_count !== undefined && (
                    <View style={styles.metaItem}>
                      <Feather name="users" size={12} color="rgba(255,255,255,0.35)" />
                      <Text style={styles.metaText}>{item.enrolled_count?.toLocaleString()} enrolled</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => { if (!enrolled) enrollMutation.mutate(item.id); }}
                  activeOpacity={0.85}
                >
                  {enrolled ? (
                    <View style={styles.enrolledBtn}>
                      <Feather name="check-circle" size={16} color="#10B981" />
                      <Text style={styles.enrolledBtnText}>Enrolled · Continue Learning</Text>
                    </View>
                  ) : (
                    <LinearGradient colors={[lc1, lc2]} style={styles.enrollBtn}>
                      <Text style={styles.enrollBtnText}>
                        {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                      </Text>
                      <Feather name="arrow-right" size={16} color="#FFF" />
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  learnBg: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  filterActive: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  filterActiveText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  filterChipText: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_500Medium" },
  card: { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 12, backgroundColor: "#0F1A2E", overflow: "hidden" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badges: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  lvlBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  lvlText: { color: "#FFF", fontSize: 10, fontFamily: "Inter_700Bold" },
  freeBadge: { backgroundColor: "rgba(16,185,129,0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  freeText: { color: "#10B981", fontSize: 10, fontFamily: "Inter_700Bold" },
  priceBadge: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priceText: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  certBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(59,130,246,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  certText: { color: "#3B82F6", fontSize: 10, fontFamily: "Inter_700Bold" },
  enrolledBadge: { backgroundColor: "rgba(16,185,129,0.15)", width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  cardTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  cardDesc: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular" },
  enrollBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 12 },
  enrollBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  enrolledBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 12, backgroundColor: "rgba(16,185,129,0.12)", borderWidth: 1, borderColor: "rgba(16,185,129,0.25)" },
  enrolledBtnText: { color: "#10B981", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
