import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(async () => {
        if (user) {
          if (user.role === "student" || user.role === "admin") router.replace("/(student)");
          else if (user.role === "police") router.replace("/(police)");
          else if (user.role === "company") router.replace("/(company)");
        } else {
          const seen = await AsyncStorage.getItem("welcome_seen");
          if (seen) {
            router.replace("/auth/login");
          } else {
            router.replace("/welcome");
          }
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  return (
    <LinearGradient colors={["#060D1A", "#0B1120", "#0F2040"]} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient colors={["#1D4ED8", "#3B82F6", "#06B6D4"]} style={styles.iconBg}>
            <MaterialCommunityIcons name="shield-lock" size={48} color="#FFF" />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.title}>CyberShield India</Text>
        <Text style={styles.subtitle}>National Cybersecurity Platform</Text>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <Animated.View key={i} style={[styles.dot, i === 1 && { backgroundColor: "#3B82F6", width: 24 }]} />
          ))}
        </View>
        <Text style={styles.owner}>Owned by Kartik Chilkoti</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { alignItems: "center", gap: 16 },
  iconWrap: { marginBottom: 8 },
  iconBg: { width: 96, height: 96, borderRadius: 24, alignItems: "center", justifyContent: "center", shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 16 },
  title: { color: "#F8FAFC", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular" },
  dotsRow: { flexDirection: "row", gap: 6, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.2)" },
  owner: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 8 },
});
