import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const { user } = useAuth();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => apiFetch("/leaderboard?limit=50"),
  });

  const lb = data?.leaderboard || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="trophy" size={32} color="#FCD34D" />
          <View>
            <Text style={[styles.title, { fontFamily: "Inter_700Bold" }]}>National Leaderboard</Text>
            <Text style={[styles.subtitle, { fontFamily: "Inter_400Regular" }]}>
              {data?.total_users || 0} registered hackers
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={lb}
          keyExtractor={item => item.user_id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20, padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            lb.length >= 3 ? (
              <View style={styles.podium}>
                {/* 2nd */}
                <PodiumItem entry={lb[1]} rank={2} colors={colors} isMe={lb[1]?.user_id === user?.id} />
                {/* 1st */}
                <PodiumItem entry={lb[0]} rank={1} colors={colors} isMe={lb[0]?.user_id === user?.id} />
                {/* 3rd */}
                <PodiumItem entry={lb[2]} rank={3} colors={colors} isMe={lb[2]?.user_id === user?.id} />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            if (index < 3) return null;
            const isMe = item.user_id === user?.id;
            return (
              <View style={[styles.row, { backgroundColor: isMe ? colors.primary + "10" : colors.card, borderColor: isMe ? colors.primary : colors.border }]}>
                <Text style={[styles.rankNum, { color: colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>#{item.rank}</Text>
                <View style={[styles.rowAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.rowAvatarText, { fontFamily: "Inter_700Bold" }]}>{item.name[0]}</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
                    {item.name} {isMe && "(You)"}
                  </Text>
                  <Text style={[styles.rowCollege, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                    {item.college_name || "Independent"} · {item.state}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={[styles.rowPoints, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {item.total_points?.toLocaleString()}
                  </Text>
                  <Text style={[styles.rowPointsLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>pts</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function PodiumItem({ entry, rank, colors, isMe }: any) {
  const rankColor = RANK_COLORS[rank - 1];
  const size = rank === 1 ? 56 : 44;
  return (
    <View style={[styles.podiumItem, rank === 1 && styles.podiumFirst]}>
      <View style={[styles.podiumAvatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: rankColor + "30", borderColor: rankColor, borderWidth: 2 }]}>
        <Text style={[styles.podiumAvatarText, { color: rankColor, fontSize: rank === 1 ? 22 : 18, fontFamily: "Inter_700Bold" }]}>
          {entry?.name?.[0]}
        </Text>
      </View>
      <MaterialCommunityIcons name="trophy" size={rank === 1 ? 20 : 16} color={rankColor} />
      <Text style={[styles.podiumName, { color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: rank === 1 ? 14 : 12 }]} numberOfLines={1}>
        {entry?.name?.split(" ")[0]}
      </Text>
      <Text style={[styles.podiumPoints, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
        {entry?.total_points?.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 14 },
  title: { color: "#FFF", fontSize: 20 },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  podium: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", marginBottom: 16, gap: 12 },
  podiumItem: { alignItems: "center", gap: 6, flex: 1 },
  podiumFirst: { marginBottom: 20 },
  podiumAvatar: { alignItems: "center", justifyContent: "center" },
  podiumAvatarText: {},
  podiumName: { textAlign: "center" },
  podiumPoints: { fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  rankNum: { fontSize: 13, width: 32, textAlign: "center" },
  rowAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  rowAvatarText: { color: "#FFF", fontSize: 16 },
  rowContent: { flex: 1 },
  rowName: { fontSize: 14 },
  rowCollege: { fontSize: 11 },
  rowRight: { alignItems: "flex-end" },
  rowPoints: { fontSize: 16 },
  rowPointsLabel: { fontSize: 10 },
});
