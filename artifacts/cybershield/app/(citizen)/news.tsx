import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Platform, Animated, Image,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApi } from "@/hooks/useApi";

const CATEGORIES = [
  { id: "all", label: "All News", color: "#3B82F6" },
  { id: "scam", label: "🚨 Scam Alert", color: "#EF4444" },
  { id: "arrest", label: "⚖️ Arrest", color: "#10B981" },
  { id: "tips", label: "🛡️ Safety Tips", color: "#06B6D4" },
  { id: "govt", label: "🏛️ Govt Update", color: "#F59E0B" },
];

const CAT_COLORS: Record<string, string> = {
  scam: "#EF4444", arrest: "#10B981", tips: "#06B6D4", govt: "#F59E0B", general: "#8B5CF6",
};

const AUTHOR_PHOTOS = [
  "https://randomuser.me/api/portraits/men/71.jpg",
  "https://randomuser.me/api/portraits/women/55.jpg",
  "https://randomuser.me/api/portraits/men/42.jpg",
  "https://randomuser.me/api/portraits/women/28.jpg",
  "https://randomuser.me/api/portraits/men/85.jpg",
  "https://randomuser.me/api/portraits/women/66.jpg",
  "https://randomuser.me/api/portraits/men/53.jpg",
  "https://randomuser.me/api/portraits/women/49.jpg",
];

const AUTHOR_NAMES = [
  "Vikram Mehta", "Sonia Singh", "Rahul Das", "Priya Kumar",
  "Arjun Reddy", "Meera Pillai", "Rohan Joshi", "Kavitha Nair",
];

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
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0F0A1A", "#180D25", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons name="newspaper-variant" size={12} color="#8B5CF6" />
          <Text style={styles.headerBadgeText}>Cyber News India</Text>
        </View>
        <Text style={styles.headerTitle}>Safety News</Text>
        <Text style={styles.headerSub}>Latest cyber crime updates & safety stories</Text>
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
              <MaterialCommunityIcons name="newspaper-variant-outline" size={40} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>No news in this category</Text>
            </View>
          )}

          {featured && (
            <View style={styles.featuredCard}>
              <LinearGradient colors={["rgba(139,92,246,0.15)", "rgba(139,92,246,0.03)"]} style={StyleSheet.absoluteFill} />
              <View style={styles.featuredTop}>
                <View style={[styles.catBadge, { backgroundColor: (CAT_COLORS[featured.category] || "#8B5CF6") + "25" }]}>
                  <Text style={[styles.catText, { color: CAT_COLORS[featured.category] || "#8B5CF6" }]}>
                    {featured.category_label || featured.category}
                  </Text>
                </View>
                {featured.is_important === 1 && (
                  <View style={styles.featuredBadge}>
                    <MaterialCommunityIcons name="star" size={11} color="#F59E0B" />
                    <Text style={styles.featuredBadgeText}>Featured</Text>
                  </View>
                )}
              </View>
              <Text style={styles.featuredTitle}>{featured.title}</Text>
              <Text style={styles.featuredSummary} numberOfLines={4}>{featured.summary}</Text>
              <View style={styles.newsFooter}>
                <Image source={{ uri: AUTHOR_PHOTOS[0] }} style={styles.authorPhoto} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.authorName}>{AUTHOR_NAMES[0]}</Text>
                  <Text style={styles.newsDate}>
                    {new Date(featured.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                </View>
                <View style={styles.sourceTag}>
                  <Text style={styles.sourceTagText}>{featured.source}</Text>
                </View>
              </View>
            </View>
          )}

          {rest.map((item: any, idx: number) => {
            const cc = CAT_COLORS[item.category] || "#8B5CF6";
            const photoIdx = (idx + 1) % AUTHOR_PHOTOS.length;
            return (
              <View key={item.id} style={styles.newsCard}>
                <LinearGradient colors={[cc + "05", "transparent"]} style={StyleSheet.absoluteFill} />
                <View style={styles.newsTop}>
                  <View style={[styles.catBadge, { backgroundColor: cc + "20" }]}>
                    <Text style={[styles.catText, { color: cc }]}>{item.category_label || item.category}</Text>
                  </View>
                  <Text style={styles.newsDate2}>
                    {new Date(item.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </Text>
                </View>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsSummary} numberOfLines={3}>{item.summary}</Text>
                <View style={styles.newsFooter}>
                  <Image source={{ uri: AUTHOR_PHOTOS[photoIdx] }} style={styles.authorPhoto} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.authorName}>{AUTHOR_NAMES[photoIdx]}</Text>
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
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" },
  filterText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_500Medium" },
  featuredCard: { borderRadius: 22, padding: 18, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(139,92,246,0.2)", gap: 12, overflow: "hidden" },
  featuredTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  catBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  catText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  featuredBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(245,158,11,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  featuredBadgeText: { color: "#F59E0B", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  featuredTitle: { color: "#F8FAFC", fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 25 },
  featuredSummary: { color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 20, fontFamily: "Inter_400Regular" },
  newsCard: { borderRadius: 18, padding: 16, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 10, overflow: "hidden" },
  newsTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  newsDate2: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular" },
  newsTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_700Bold", lineHeight: 22 },
  newsSummary: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  newsFooter: { flexDirection: "row", alignItems: "center", gap: 10 },
  authorPhoto: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  authorName: { color: "#F8FAFC", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sourceText: { color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter_400Regular" },
  newsDate: { color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter_400Regular" },
  sourceTag: { backgroundColor: "rgba(255,255,255,0.07)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  sourceTagText: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter_500Medium" },
  importantBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  importantText: { color: "#EF4444", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: "rgba(255,255,255,0.3)", fontSize: 15, fontFamily: "Inter_400Regular" },
});
