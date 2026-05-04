import React from "react";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";

export default function PoliceLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FCD34D",
        tabBarInactiveTintColor: "rgba(255,255,255,0.35)",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: isWeb ? 84 : 76,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={["rgba(6,13,26,0.97)", "#060D1A"]}
            style={[{ flex: 1, borderTopWidth: 1, borderTopColor: "rgba(252,211,77,0.08)" }]}
          />
        ),
        tabBarLabelStyle: { fontSize: 10, fontFamily: "Inter_500Medium", marginBottom: 6 },
        tabBarIconStyle: { marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(252,211,77,0.15)", borderRadius: 8, padding: 4 }}><Feather name="home" size={20} color={color} /></View>
              : <Feather name="home" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: "Review",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(252,211,77,0.15)", borderRadius: 8, padding: 4 }}><Feather name="file-text" size={20} color={color} /></View>
              : <Feather name="file-text" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: "Cases",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(252,211,77,0.15)", borderRadius: 8, padding: 4 }}><MaterialCommunityIcons name="briefcase-outline" size={20} color={color} /></View>
              : <MaterialCommunityIcons name="briefcase-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(252,211,77,0.15)", borderRadius: 8, padding: 4 }}><Feather name="alert-triangle" size={20} color={color} /></View>
              : <Feather name="alert-triangle" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
