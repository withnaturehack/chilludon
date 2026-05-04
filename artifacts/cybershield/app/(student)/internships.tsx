import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Alert, Animated } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

export default function InternshipsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const qc = useQueryClient();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const { data, isLoading } = useQuery({ queryKey: ["internships"], queryFn: () => apiFetch("/internships") });
  const { data: myApps } = useQuery({ queryKey: ["my-applications"], queryFn: () => apiFetch("/internships/my-applications") });

  const applyMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/internships/${id}/apply`, { method: "POST", body: JSON.stringify({ cover_letter: "I am excited to apply for this cybersecurity internship opportunity through CyberShield India." }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("🎉 Applied!", "Your application has been submitted. The company will review it soon.");
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  const appliedIds = new Set((myApps?.applications || []).map((a: any) => a.application?.internship_id));

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0F2040", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient colors={["#0891B2", "#06B6D4"]} style={styles.jobBg}>
            <Feather name="briefcase" size={22} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Internships</Text>
            <Text style={styles.headerSub}>Govt & private cybersecurity opportunities</Text>
          </View>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          style={{ opacity: fadeAnim }}
          data={data?.internships || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const applied = appliedIds.has(item.id);
            const isGovt = item.org_type === "government";
            const seatsFull = item.filled_seats >= item.total_seats;
            return (
              <View style={styles.card}>
                <LinearGradient colors={["rgba(6,182,212,0.05)", "transparent"]} style={StyleSheet.absoluteFill} />
                <View style={styles.cardTop}>
                  <View style={styles.cardBadges}>
                    {isGovt && (
                      <View style={styles.govtBadge}>
                        <MaterialCommunityIcons name="shield-star" size={11} color="#F59E0B" />
                        <Text style={styles.govtText}>GOVT</Text>
                      </View>
                    )}
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{item.location_type || "Remote"}</Text>
                    </View>
                    {seatsFull && (
                      <View style={styles.fullBadge}>
                        <Text style={styles.fullText}>FULL</Text>
                      </View>
                    )}
                  </View>
                  {item.stipend_amount && (
                    <View style={styles.stipendWrap}>
                      <Text style={styles.stipend}>₹{item.stipend_amount?.toLocaleString()}</Text>
                      <Text style={styles.stipendPer}>/mo</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.orgName}>{item.org_name}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                )}
                <View style={styles.metaRow}>
                  {item.duration_months && (
                    <View style={styles.metaItem}>
                      <Feather name="clock" size={12} color="rgba(255,255,255,0.35)" />
                      <Text style={styles.metaText}>{item.duration_months} months</Text>
                    </View>
                  )}
                  {(item.location_city || item.location_state) && (
                    <View style={styles.metaItem}>
                      <Feather name="map-pin" size={12} color="rgba(255,255,255,0.35)" />
                      <Text style={styles.metaText}>{[item.location_city, item.location_state].filter(Boolean).join(", ")}</Text>
                    </View>
                  )}
                  <View style={styles.metaItem}>
                    <Feather name="users" size={12} color="rgba(255,255,255,0.35)" />
                    <Text style={styles.metaText}>{item.filled_seats}/{item.total_seats} seats</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => { if (!applied && !seatsFull) applyMutation.mutate(item.id); }}
                  disabled={seatsFull && !applied}
                  activeOpacity={0.85}
                >
                  {applied ? (
                    <View style={styles.appliedBtn}>
                      <Feather name="check-circle" size={16} color="#10B981" />
                      <Text style={styles.appliedBtnText}>Application Submitted</Text>
                    </View>
                  ) : seatsFull ? (
                    <View style={styles.fullBtn}>
                      <Text style={styles.fullBtnText}>No Seats Available</Text>
                    </View>
                  ) : (
                    <LinearGradient colors={["#0891B2", "#06B6D4"]} style={styles.applyBtn}>
                      <Text style={styles.applyBtnText}>
                        {applyMutation.isPending ? "Applying..." : "Apply Now"}
                      </Text>
                      <Feather name="arrow-right" size={16} color="#FFF" />
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 14 }}>
              <Feather name="briefcase" size={64} color="rgba(255,255,255,0.06)" />
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontFamily: "Inter_400Regular" }}>No internships available</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 14 },
  jobBg: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  card: { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 10, backgroundColor: "#0F1A2E", overflow: "hidden" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardBadges: { flexDirection: "row", gap: 6 },
  govtBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(245,158,11,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  govtText: { color: "#F59E0B", fontSize: 10, fontFamily: "Inter_700Bold" },
  typeBadge: { backgroundColor: "rgba(6,182,212,0.12)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { color: "#06B6D4", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  fullBadge: { backgroundColor: "rgba(239,68,68,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  fullText: { color: "#EF4444", fontSize: 10, fontFamily: "Inter_700Bold" },
  stipendWrap: { flexDirection: "row", alignItems: "baseline", gap: 1 },
  stipend: { color: "#10B981", fontSize: 18, fontFamily: "Inter_700Bold" },
  stipendPer: { color: "rgba(16,185,129,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  orgName: { color: "#06B6D4", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  cardTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  cardDesc: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular" },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 12 },
  applyBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  appliedBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 12, backgroundColor: "rgba(16,185,129,0.12)", borderWidth: 1, borderColor: "rgba(16,185,129,0.25)" },
  appliedBtnText: { color: "#10B981", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  fullBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 46, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.04)" },
  fullBtnText: { color: "rgba(255,255,255,0.3)", fontSize: 14, fontFamily: "Inter_400Regular" },
});
