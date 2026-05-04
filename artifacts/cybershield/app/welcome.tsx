import React, { useRef, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    id: 0,
    icon: "shield-lock" as const,
    iconLib: "mci",
    badge: "CERT-In Certified",
    badgeColor: "#3B82F6",
    title: "Protecting India's\nDigital Future",
    subtitle: "India's first unified national cybersecurity platform for students, researchers, police & enterprises.",
    grad1: ["#1D4ED8", "#3B82F6", "#06B6D4"] as [string, string, string],
    grad2: ["#060D1A", "#0B1120", "#071428"] as [string, string, string],
    accent: "#3B82F6",
    features: ["Bug Bounty Programs", "CERT-In Integration", "National Database"],
    featureIcons: ["target", "shield", "database"],
  },
  {
    id: 1,
    icon: "cash-multiple" as const,
    iconLib: "mci",
    badge: "Earn Real Money",
    badgeColor: "#10B981",
    title: "Find Bugs,\nEarn Rewards",
    subtitle: "Submit vulnerability reports to top Indian companies and get rewarded with cash bounties up to ₹5 Lakh.",
    grad1: ["#059669", "#10B981", "#34D399"] as [string, string, string],
    grad2: ["#060D1A", "#0B1120", "#071E14"] as [string, string, string],
    accent: "#10B981",
    features: ["₹5 Lakh Max Bounty", "500+ Companies", "Instant Payments"],
    featureIcons: ["dollar-sign", "briefcase", "zap"],
  },
  {
    id: 2,
    icon: "robot" as const,
    iconLib: "mci",
    badge: "Powered by NVIDIA AI",
    badgeColor: "#8B5CF6",
    title: "Meet RakshBot,\nYour AI Mentor",
    subtitle: "Get 24/7 guidance from RakshBot — an NVIDIA-powered AI security expert who speaks your language.",
    grad1: ["#7C3AED", "#8B5CF6", "#A78BFA"] as [string, string, string],
    grad2: ["#060D1A", "#0B1120", "#0F0720"] as [string, string, string],
    accent: "#8B5CF6",
    features: ["NVIDIA LLM Powered", "Hinglish Support", "24/7 Available"],
    featureIcons: ["cpu", "message-circle", "clock"],
  },
  {
    id: 3,
    icon: "account-group" as const,
    iconLib: "mci",
    badge: "10,000+ Warriors",
    badgeColor: "#F59E0B",
    title: "Join India's\nCyber Army",
    subtitle: "Be part of a growing community of ethical hackers defending India's digital infrastructure every day.",
    grad1: ["#D97706", "#F59E0B", "#FCD34D"] as [string, string, string],
    grad2: ["#060D1A", "#0B1120", "#1A1208"] as [string, string, string],
    accent: "#F59E0B",
    features: ["National Leaderboard", "State-wise Rankings", "Govt Certifications"],
    featureIcons: ["award", "map-pin", "check-circle"],
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(SLIDES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    animateSlide(0);
  }, []);

  function animateSlide(idx: number) {
    slideAnims[idx].setValue(30);
    Animated.spring(slideAnims[idx], { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }).start();
  }

  function goToSlide(idx: number) {
    scrollRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: true });
    setCurrentSlide(idx);
    animateSlide(idx);
    Haptics.selectionAsync();
  }

  function handleNext() {
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  }

  async function handleGetStarted() {
    await AsyncStorage.setItem("welcome_seen", "1");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/auth/login");
  }

  function onScroll(e: any) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (idx !== currentSlide && idx >= 0 && idx < SLIDES.length) {
      setCurrentSlide(idx);
      animateSlide(idx);
    }
  }

  const slide = SLIDES[currentSlide];

  return (
    <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
      <LinearGradient colors={slide.grad2} style={{ flex: 1 }}>
        {/* Skip button */}
        <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
          <View />
          <TouchableOpacity onPress={handleGetStarted} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexDirection: "row" }}
        >
          {SLIDES.map((s, idx) => (
            <View key={s.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <Animated.View style={[styles.slideContent, {
                transform: [{ translateY: slideAnims[idx] }],
                opacity: slideAnims[idx].interpolate({ inputRange: [0, 30], outputRange: [1, 0] }),
              }]}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <LinearGradient colors={s.grad1} style={styles.iconOuter}>
                    <LinearGradient colors={[s.grad1[0] + "80", s.grad1[2] + "40"]} style={styles.iconInner}>
                      <MaterialCommunityIcons name={s.icon} size={56} color="#FFF" />
                    </LinearGradient>
                  </LinearGradient>
                  {/* Glow rings */}
                  <View style={[styles.ring1, { borderColor: s.accent + "30" }]} />
                  <View style={[styles.ring2, { borderColor: s.accent + "15" }]} />
                </View>

                {/* Badge */}
                <View style={[styles.badge, { backgroundColor: s.accent + "20", borderColor: s.accent + "40" }]}>
                  <View style={[styles.badgeDot, { backgroundColor: s.accent }]} />
                  <Text style={[styles.badgeText, { color: s.accent }]}>{s.badge}</Text>
                </View>

                {/* Text */}
                <Text style={styles.slideTitle}>{s.title}</Text>
                <Text style={styles.slideSubtitle}>{s.subtitle}</Text>

                {/* Feature pills */}
                <View style={styles.featuresRow}>
                  {s.features.map((f, fi) => (
                    <View key={f} style={[styles.featurePill, { borderColor: s.accent + "30" }]}>
                      <Feather name={s.featureIcons[fi] as any} size={11} color={s.accent} />
                      <Text style={[styles.featureText, { color: s.accent }]}>{f}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom controls */}
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
          {/* Dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goToSlide(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Animated.View style={[
                  styles.dot,
                  i === currentSlide && { width: 28, backgroundColor: slide.accent },
                  i !== currentSlide && { backgroundColor: "rgba(255,255,255,0.2)" },
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Next / Get Started button */}
          <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
            <LinearGradient
              colors={slide.grad1}
              style={styles.nextBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {currentSlide < SLIDES.length - 1 ? (
                <>
                  <Text style={styles.nextBtnText}>Next</Text>
                  <Feather name="arrow-right" size={18} color="#FFF" />
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#FFF" />
                  <Text style={styles.nextBtnText}>Get Started</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.ownerText}>CyberShield India · Owned by Kartik Chilkoti</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 8 },
  skipBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  skipText: { color: "rgba(255,255,255,0.55)", fontSize: 13, fontFamily: "Inter_500Medium" },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  slideContent: { alignItems: "center", gap: 18, width: "100%" },
  iconContainer: { alignItems: "center", justifyContent: "center", marginBottom: 8 },
  iconOuter: { width: 140, height: 140, borderRadius: 40, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 20 },
  iconInner: { width: 110, height: 110, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  ring1: { position: "absolute", width: 170, height: 170, borderRadius: 85, borderWidth: 1 },
  ring2: { position: "absolute", width: 210, height: 210, borderRadius: 105, borderWidth: 1 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  slideTitle: { color: "#F8FAFC", fontSize: 32, fontFamily: "Inter_700Bold", textAlign: "center", lineHeight: 40 },
  slideSubtitle: { color: "rgba(255,255,255,0.55)", fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 23 },
  featuresRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  featurePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  featureText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  bottom: { paddingHorizontal: 28, gap: 20, alignItems: "center" },
  dotsRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  dot: { height: 8, borderRadius: 4, width: 8 },
  nextBtn: { height: 58, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 40, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12, minWidth: 200 },
  nextBtnText: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  ownerText: { color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "Inter_400Regular" },
});
