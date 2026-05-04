import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, TouchableOpacity, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_GRADS: [string, string][] = [["#D97706", "#F59E0B"], ["#6B7280", "#9CA3AF"], ["#92400E", "#B45309"]];

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const { user } = useAuth();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => apiFetch("/leaderboard?limit=50"),
  });

  const lb = data?.leaderboard || [];

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient colors={["#0F2040", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient colors={["#D97706", "#F59E0B"]} style={styles.trophyBg}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={styles.title}>National Leaderboard</Text>
            <Text style={styles.subtitle}>{data?.total_users || 0} registered hackers across India</Text>
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
          data={lb}
          keyExtractor={item => item.user_id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            lb.length >= 3 ? (
              <View style={styles.podium}>
                {/* 2nd */}
                <PodiumItem entry={lb[1]} rank={2} isMe={lb[1]?.user_id === user?.id} />
                {/* 1st */}
                <PodiumItem entry={lb[0]} rank={1} isMe={lb[0]?.user_id === user?.id} />
                {/* 3rd */}
                <PodiumItem entry={lb[2]} rank={3} isMe={lb[2]?.user_id === user?.id} />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            if (index < 3) return null;
            const isMe = item.user_id === user?.id;
            return (
              <View style={[styles.row, isMe && { borderColor: "#3B82F6", borderWidth: 1.5 }]}>
                {isMe && <LinearGradient colors={["rgba(59,130,246,0.1)", "transparent"]} style={StyleSheet.absoluteFill} />}
                <Text style={styles.rankNum}>#{item.rank}</Text>
                <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.rowAvatar}>
                  <Text style={styles.rowAvatarText}>{item.name?.[0]?.toUpperCase()}</Text>
                </LinearGradient>
                <View style={styles.rowContent}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.name} {isMe ? <Text style={{ color: "#3B82F6" }}>(You)</Text> : null}
                  </Text>
                  <Text style={styles.rowCollege} numberOfLines={1}>
                    {item.college_name || "Independent"}{item.state ? ` · ${item.state}` : ""}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowPoints}>{item.total_points?.toLocaleString()}</Text>
                  <Text style={styles.rowPtsLabel}>pts</Text>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </LinearGradient>
  );
}

function PodiumItem({ entry, rank, isMe }: any) {
  const rankColor = RANK_COLORS[rank - 1];
  const [g1, g2] = RANK_GRADS[rank - 1] || ["#3B82F6", "#60A5FA"];
  const size = rank === 1 ? 66 : 52;
  return (
    <View style={[styles.podiumItem, rank === 1 && { marginBottom: 28 }]}>
      <LinearGradient colors={[g1, g2]} style={[styles.podiumAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.podiumAvatarText, { fontSize: rank === 1 ? 26 : 20 }]}>
          {entry?.name?.[0]?.toUpperCase()}
        </Text>
      </LinearGradient>
      {rank === 1 && <MaterialCommunityIcons name="crown" size={20} color="#FFD700" style={{ position: "absolute", top: -16 }} />}
      <Text style={[styles.podiumName, { fontSize: rank === 1 ? 14 : 12 }]} numberOfLines={1}>
        {entry?.name?.split(" ")[0]}{isMe ? " 👋" : ""}
      </Text>
      <LinearGradient colors={[g1, g2]} style={styles.podiumPtsBadge}>
        <Text style={styles.podiumPts}>{entry?.total_points?.toLocaleString()}</Text>
      </LinearGradient>
      <View style={[styles.podiumBase, { height: rank === 1 ? 60 : rank === 2 ? 40 : 28, backgroundColor: g1 + "30" }]}>
        <Text style={[styles.podiumRank, { color: rankColor }]}>#{rank}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 14 },
  trophyBg: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { color: "#FFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  podium: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", marginBottom: 8, paddingTop: 40, paddingHorizontal: 16, gap: 8 },
  podiumItem: { flex: 1, alignItems: "center", gap: 6 },
  podiumAvatar: { alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" },
  podiumAvatarText: { color: "#FFF", fontFamily: "Inter_700Bold" },
  podiumName: { color: "#F8FAFC", fontFamily: "Inter_600SemiBold", textAlign: "center" },
  podiumPtsBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  podiumPts: { color: "#FFF", fontSize: 11, fontFamily: "Inter_700Bold" },
  podiumBase: { width: "100%", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  podiumRank: { fontSize: 16, fontFamily: "Inter_700Bold" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, overflow: "hidden", backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  separator: { height: 8 },
  rankNum: { color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "Inter_700Bold", width: 32, textAlign: "center" },
  rowAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  rowAvatarText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  rowContent: { flex: 1 },
  rowName: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowCollege: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  rowRight: { alignItems: "flex-end" },
  rowPoints: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  rowPtsLabel: { color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter_400Regular" },
});
