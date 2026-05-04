import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const colors = useColors();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/auth/login");
      } else if (user.role === "student" || user.role === "admin") {
        router.replace("/(student)");
      } else if (user.role === "police") {
        router.replace("/(police)");
      } else if (user.role === "company") {
        router.replace("/(company)");
      }
    }
  }, [user, isLoading]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
