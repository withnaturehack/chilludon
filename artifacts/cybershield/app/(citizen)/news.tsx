import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Platform, Animated,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApi } from "@/hooks/useApi";

const CATEGORIES = [
  { id: "all", label: "All", color: "#3B82F6" },
  { id: "scam", label: "Scam Alert", color: "#EF4444" },
  { id: "arrest", label: "Arrest", color: "#10B981" },
  { id: "tips", label: "Safety Tips", color: "#06B6D4" },
  { id: "govt", label: "Govt Update", color: "#F59E0B" },
];

const CAT_COLORS: Record<string, string> = {
  scam: "#EF4444", arrest: "#10B981", tips: "#06B6D4", govt: "#F59E0B", general: "#8B5CF6",
};

export default function CitizenNews() {
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const [category, setCategory] = useState("all");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["citizen-news"],
    queryFn: () => apiFetch("/citizen/news"),
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const news = data?.news || [];
  const filtered = category === "all" ? news : news.filter((n: any) => n.category === category);

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0F0A1A", "#180D25", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerBadge}>
          <Feather name="radio" size={12} color="#8B5CF6" />
          <Text style={styles.headerBadgeText}>Cyber News India</Text>
        </View>
        <Text style={styles.headerTitle}>Safety News</Text>
        <Text style={styles.headerSub}>Latest cyber crime news & safety updates</Text>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterBtn, category === cat.id && { backgroundColor: cat.color + "25", borderColor: cat.color + "60" }]}
            onPress={() => setCategory(cat.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, category === cat.id && { color: cat.color }]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#8B5CF6" />}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 14, paddingTop: 4 }}>
          {filtered.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Feather name="radio" size={40} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>No news in this category</Text>
            </View>
          )}
          {filtered.map((item: any) => {
            const cc = CAT_COLORS[item.category] || "#8B5CF6";
            return (
              <View key={item.id} style={styles.newsCard}>
                <LinearGradient colors={[cc + "06", "transparent"]} style={StyleSheet.absoluteFill} />
                <View style={styles.newsTop}>
                  <View style={[styles.catBadge, { backgroundColor: cc + "20" }]}>
                    <Text style={[styles.catText, { color: cc }]}>{item.category_label || item.category}</Text>
                  </View>
                  <Text style={styles.newsDate}>{new Date(item.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</Text>
                </View>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsSummary} numberOfLines={3}>{item.summary}</Text>
                <View style={styles.newsFooter}>
                  <View style={styles.sourceRow}>
                    <Feather name="globe" size={11} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.sourceText}>{item.source}</Text>
                  </View>
                  {item.is_important === 1 && (
                    <View style={styles.importantBadge}>
                      <MaterialCommunityIcons name="alert-circle" size={12} color="#EF4444" />
                      <Text style={styles.importantText}>Important</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(139,92,246,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start", marginBottom: 8 },
  headerBadgeText: { color: "#8B5CF6", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  headerTitle: { color: "#F8FAFC", fontSize: 26, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  filterBar: { maxHeight: 56, flexGrow: 0 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" },
  filterText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_500Medium" },
  newsCard: { borderRadius: 18, padding: 16, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 10, overflow: "hidden" },
  newsTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  catBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  catText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  newsDate: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular" },
  newsTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 22 },
  newsSummary: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  newsFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sourceText: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular" },
  importantBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  importantText: { color: "#EF4444", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: "rgba(255,255,255,0.3)", fontSize: 15, fontFamily: "Inter_400Regular" },
});
