import React from "react";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";

export default function CitizenLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#06B6D4",
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
            style={[{ flex: 1, borderTopWidth: 1, borderTopColor: "rgba(6,182,212,0.1)" }]}
          />
        ),
        tabBarLabelStyle: { fontSize: 10, fontFamily: "Inter_500Medium", marginBottom: 6 },
        tabBarIconStyle: { marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Safety",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(6,182,212,0.18)", borderRadius: 8, padding: 4 }}>
                  <MaterialCommunityIcons name="shield-home" size={20} color={color} />
                </View>
              : <MaterialCommunityIcons name="shield-home-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(6,182,212,0.18)", borderRadius: 8, padding: 4 }}>
                  <Feather name="alert-triangle" size={20} color={color} />
                </View>
              : <Feather name="alert-triangle" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(6,182,212,0.18)", borderRadius: 8, padding: 4 }}>
                  <MaterialCommunityIcons name="shield-alert" size={20} color={color} />
                </View>
              : <MaterialCommunityIcons name="shield-alert-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(6,182,212,0.18)", borderRadius: 8, padding: 4 }}>
                  <Feather name="radio" size={20} color={color} />
                </View>
              : <Feather name="radio" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
