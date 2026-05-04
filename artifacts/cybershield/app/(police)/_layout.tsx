import React from "react";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";

export default function PoliceLayout() {
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
            style={{ flex: 1, borderTopWidth: 1, borderTopColor: "rgba(252,211,77,0.1)" }}
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
              ? <View style={{ backgroundColor: "rgba(252,211,77,0.15)", borderRadius: 8, padding: 4 }}>
                  <MaterialCommunityIcons name="view-dashboard" size={20} color={color} />
                </View>
              : <MaterialCommunityIcons name="view-dashboard-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: "Review",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(252,211,77,0.15)", borderRadius: 8, padding: 4 }}>
                  <MaterialCommunityIcons name="file-document" size={20} color={color} />
                </View>
              : <MaterialCommunityIcons name="file-document-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: "Cases",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(252,211,77,0.15)", borderRadius: 8, padding: 4 }}>
                  <MaterialCommunityIcons name="briefcase" size={20} color={color} />
                </View>
              : <MaterialCommunityIcons name="briefcase-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: "Live Map",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(252,211,77,0.15)", borderRadius: 8, padding: 4 }}>
                  <MaterialCommunityIcons name="map-marker-radius" size={20} color={color} />
                </View>
              : <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="intelligence"
        options={{
          title: "Intel",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: "rgba(252,211,77,0.15)", borderRadius: 8, padding: 4 }}>
                  <MaterialCommunityIcons name="radar" size={20} color={color} />
                </View>
              : <MaterialCommunityIcons name="radar" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="alerts" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="fir" options={{ href: null }} />
    </Tabs>
  );
}
