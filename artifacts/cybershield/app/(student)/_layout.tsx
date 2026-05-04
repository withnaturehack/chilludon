import React from "react";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

export default function StudentLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
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
            colors={["rgba(6,13,26,0.95)", "#060D1A"]}
            style={[{ flex: 1, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" }]}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_500Medium",
          marginBottom: 6,
        },
        tabBarIconStyle: { marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: colors.primary + "25", borderRadius: 8, padding: 4 }}>
                  <Feather name="home" size={20} color={color} />
                </View>
              : <Feather name="home" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: "Submit",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: colors.primary + "25", borderRadius: 8, padding: 4 }}>
                  <Feather name="upload" size={20} color={color} />
                </View>
              : <Feather name="upload" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ctf"
        options={{
          title: "CTF",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: colors.primary + "25", borderRadius: 8, padding: 4 }}>
                  <MaterialCommunityIcons name="flag" size={20} color={color} />
                </View>
              : <MaterialCommunityIcons name="flag-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rakshbot"
        options={{
          title: "RakshBot",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: colors.primary + "25", borderRadius: 8, padding: 4 }}>
                  <MaterialCommunityIcons name="robot" size={20} color={color} />
                </View>
              : <MaterialCommunityIcons name="robot-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <View style={{ backgroundColor: colors.primary + "25", borderRadius: 8, padding: 4 }}>
                  <Feather name="grid" size={20} color={color} />
                </View>
              : <Feather name="grid" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
