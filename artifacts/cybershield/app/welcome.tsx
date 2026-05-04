import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const { width: W } = Dimensions.get("window");
const HW = Platform.OS !== "web";
const AUTO_MS = 5000;

const SLIDES = [
  {
    icon: "shield-lock" as const,
    emoji: "🇮🇳",
    badge: "CERT-In Certified · MeitY Approved",
    title: "Protecting India's\nDigital Future",
    subtitle: "India's first unified national cybersecurity platform for students, researchers, police & citizens.",
    accent: "#3B82F6",
    grad: ["#1D4ED8", "#3B82F6"] as [string, string],
    features: [
      { icon: "target" as const, text: "Bug Bounty" },
      { icon: "shield-star" as const, text: "CERT-In Sync" },
      { icon: "database" as const, text: "National DB" },
    ],
  },
  {
    icon: "cash-multiple" as const,
    emoji: "💰",
    badge: "Earn up to ₹5 Lakh per Bug",
    title: "Find Bugs,\nEarn Real ₹₹₹",
    subtitle: "Submit vulnerability reports to 500+ top Indian companies. Get rewarded with cash bounties directly to your bank account.",
    accent: "#10B981",
    grad: ["#059669", "#10B981"] as [string, string],
    features: [
      { icon: "currency-inr" as const, text: "₹5L Max" },
      { icon: "office-building" as const, text: "500+ Companies" },
      { icon: "lightning-bolt" as const, text: "Instant Pay" },
    ],
  },
  {
    icon: "robot" as const,
    emoji: "🤖",
    badge: "Powered by NVIDIA AI",
    title: "Meet RakshBot,\nYour AI Mentor",
    subtitle: "24/7 guidance from RakshBot — an NVIDIA-powered AI security expert who understands Indian context and speaks Hinglish.",
    accent: "#8B5CF6",
    grad: ["#7C3AED", "#8B5CF6"] as [string, string],
    features: [
      { icon: "brain" as const, text: "NVIDIA LLM" },
      { icon: "translate" as const, text: "Hinglish" },
      { icon: "clock-outline" as const, text: "24/7 Live" },
    ],
  },
  {
    icon: "account-group" as const,
    emoji: "🏆",
    badge: "10,000+ Cyber Warriors",
    title: "Join India's\nCyber Army 🇮🇳",
    subtitle: "Be part of India's largest community of ethical hackers defending India's digital infrastructure. Made for Bharat, by Bharat.",
    accent: "#F59E0B",
    grad: ["#D97706", "#F59E0B"] as [string, string],
    features: [
      { icon: "trophy" as const, text: "Leaderboard" },
      { icon: "map-marker" as const, text: "State Rankings" },
      { icon: "certificate" as const, text: "Govt Certs" },
    ],
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentSlideRef = useRef(0);
  const autoRef = useRef<ReturnType<typeof setTimeout>>();

  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const iconRotate = useRef(new Animated.Value(-4)).current;
  const orbX1 = useRef(new Animated.Value(0)).current;
  const orbY1 = useRef(new Animated.Value(0)).current;
  const orbX2 = useRef(new Animated.Value(0)).current;
  const orbY2 = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateSlideIn(0);
    startOrbs();
    scheduleAutoAdvance();
    return () => clearAutoAdvance();
  }, []);

  function animateSlideIn(idx: number) {
    contentFade.setValue(0);
    contentSlide.setValue(28);
    iconScale.setValue(0.65);
    iconRotate.setValue(-6);
    progressAnim.stopAnimation();
    progressAnim.setValue(idx / SLIDES.length);

    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 480, useNativeDriver: HW }),
      Animated.timing(contentSlide, { toValue: 0, duration: 480, useNativeDriver: HW }),
      Animated.spring(iconScale, { toValue: 1, tension: 90, friction: 9, useNativeDriver: HW }),
      Animated.spring(iconRotate, { toValue: 0, tension: 90, friction: 9, useNativeDriver: HW }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: (idx + 1) / SLIDES.length,
      duration: AUTO_MS,
      useNativeDriver: false,
    }).start();
  }

  function startOrbs() {
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(orbX1, { toValue: 35, duration: 3800, useNativeDriver: HW }),
        Animated.timing(orbY1, { toValue: -28, duration: 3800, useNativeDriver: HW }),
        Animated.timing(orbX2, { toValue: -22, duration: 4200, useNativeDriver: HW }),
        Animated.timing(orbY2, { toValue: 32, duration: 4200, useNativeDriver: HW }),
      ]),
      Animated.parallel([
        Animated.timing(orbX1, { toValue: -18, duration: 3800, useNativeDriver: HW }),
        Animated.timing(orbY1, { toValue: 22, duration: 3800, useNativeDriver: HW }),
        Animated.timing(orbX2, { toValue: 28, duration: 4200, useNativeDriver: HW }),
        Animated.timing(orbY2, { toValue: -18, duration: 4200, useNativeDriver: HW }),
      ]),
      Animated.parallel([
        Animated.timing(orbX1, { toValue: 0, duration: 3000, useNativeDriver: HW }),
        Animated.timing(orbY1, { toValue: 0, duration: 3000, useNativeDriver: HW }),
        Animated.timing(orbX2, { toValue: 0, duration: 3000, useNativeDriver: HW }),
        Animated.timing(orbY2, { toValue: 0, duration: 3000, useNativeDriver: HW }),
      ]),
    ])).start();
  }

  function clearAutoAdvance() {
    if (autoRef.current) clearTimeout(autoRef.current);
  }

  function scheduleAutoAdvance() {
    clearAutoAdvance();
    autoRef.current = setTimeout(() => {
      const next = (currentSlideRef.current + 1) % SLIDES.length;
      goToSlide(next);
    }, AUTO_MS);
  }

  function goToSlide(idx: number) {
    currentSlideRef.current = idx;
    setCurrentSlide(idx);
    scrollRef.current?.scrollTo({ x: idx * W, animated: true });
    animateSlideIn(idx);
    scheduleAutoAdvance();
    if (Platform.OS !== "web") Haptics.selectionAsync();
  }

  function handleScroll(e: any) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    if (idx !== currentSlideRef.current && idx >= 0 && idx < SLIDES.length) {
      goToSlide(idx);
    }
  }

  function handleNext() {
    if (currentSlideRef.current < SLIDES.length - 1) {
      goToSlide(currentSlideRef.current + 1);
    } else {
      handleGetStarted();
    }
  }

  async function handleGetStarted() {
    clearAutoAdvance();
    await AsyncStorage.setItem("welcome_seen", "1");
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/auth/login");
  }

  const slide = SLIDES[currentSlide];
  const progressW = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const spin = iconRotate.interpolate({ inputRange: [-6, 0], outputRange: ["-6deg", "0deg"] });

  return (
    <View style={styles.root}>
      {/* Animated background orbs */}
      <Animated.View style={[
        styles.orb1,
        { backgroundColor: slide.accent + "18", transform: [{ translateX: orbX1 }, { translateY: orbY1 }] },
      ]} />
      <Animated.View style={[
        styles.orb2,
        { backgroundColor: slide.accent + "12", transform: [{ translateX: orbX2 }, { translateY: orbY2 }] },
      ]} />
      <View style={[styles.orb3, { backgroundColor: slide.accent + "08" }]} />

      {/* Top bar: progress + skip */}
      <View style={[styles.topBar, { paddingTop: insets.top + 14 }]}>
        <View style={styles.progressRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={styles.progressSegBg}>
              {i < currentSlide ? (
                <View style={[styles.progressFill, { backgroundColor: slide.accent, width: "100%" }]} />
              ) : i === currentSlide ? (
                <Animated.View style={[styles.progressFill, { backgroundColor: slide.accent, width: progressW }]} />
              ) : null}
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={handleGetStarted} style={styles.skipBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexDirection: "row" }}
      >
        {SLIDES.map((s, idx) => (
          <View key={idx} style={[styles.slide, { width: W }]}>
            <Animated.View style={[
              styles.slideContent,
              idx === currentSlide ? {
                opacity: contentFade,
                transform: [{ translateY: contentSlide }],
              } : { opacity: 1 },
            ]}>
              {/* Icon with animated glow rings */}
              <View style={styles.iconArea}>
                <View style={[styles.ring2, { borderColor: s.accent + "15" }]} />
                <View style={[styles.ring1, { borderColor: s.accent + "30" }]} />
                <Animated.View style={[
                  styles.iconAnimWrap,
                  idx === currentSlide ? { transform: [{ scale: iconScale }, { rotate: spin }] } : {},
                ]}>
                  <LinearGradient colors={s.grad} style={styles.iconOuter}>
                    <LinearGradient
                      colors={[s.grad[0] + "99", s.grad[1] + "55"]}
                      style={styles.iconInner}
                    >
                      <MaterialCommunityIcons name={s.icon} size={58} color="#FFF" />
                    </LinearGradient>
                  </LinearGradient>
                </Animated.View>
              </View>

              {/* Badge */}
              <View style={[styles.badge, { backgroundColor: s.accent + "22", borderColor: s.accent + "44" }]}>
                <Text style={styles.badgeEmoji}>{s.emoji}</Text>
                <Text style={[styles.badgeText, { color: s.accent }]}>{s.badge}</Text>
              </View>

              {/* Title + subtitle */}
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.subtitle}>{s.subtitle}</Text>

              {/* Feature pills — MCIcon only */}
              <View style={styles.pillsRow}>
                {s.features.map((f) => (
                  <View key={f.text} style={[styles.pill, { borderColor: s.accent + "38", backgroundColor: s.accent + "12" }]}>
                    <MaterialCommunityIcons name={f.icon} size={13} color={s.accent} />
                    <Text style={[styles.pillText, { color: s.accent }]}>{f.text}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goToSlide(i)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={[
                styles.dot,
                {
                  backgroundColor: i === currentSlide ? slide.accent : "rgba(255,255,255,0.2)",
                  width: i === currentSlide ? 28 : 8,
                },
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.84} style={styles.ctaWrap}>
          <LinearGradient
            colors={slide.grad}
            style={styles.ctaBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {currentSlide < SLIDES.length - 1 ? (
              <>
                <Text style={styles.ctaText}>Next</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="shield-check" size={22} color="#FFF" />
                <Text style={styles.ctaText}>Join the Cyber Army</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Made in Bharat */}
        <View style={styles.bharatRow}>
          <View style={[styles.bharatDot, { backgroundColor: "#FF9933" }]} />
          <View style={[styles.bharatDot, { backgroundColor: "#FFFFFF" }]} />
          <View style={[styles.bharatDot, { backgroundColor: "#138808" }]} />
          <Text style={styles.bharatText}>Made with ❤️ in Bharat · Kartik Chilkoti</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#060D1A" },
  orb1: { position: "absolute", width: 300, height: 300, borderRadius: 150, top: -80, left: -80 },
  orb2: { position: "absolute", width: 220, height: 220, borderRadius: 110, bottom: 80, right: -60 },
  orb3: { position: "absolute", width: 120, height: 120, borderRadius: 60, top: "45%", right: 20 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12, paddingBottom: 6 },
  progressRow: { flex: 1, flexDirection: "row", gap: 5, height: 3 },
  progressSegBg: { flex: 1, height: 3, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, borderRadius: 2 },
  skipBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  skipText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_500Medium" },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  slideContent: { alignItems: "center", gap: 18, width: "100%" },
  iconArea: { alignItems: "center", justifyContent: "center", marginBottom: 4 },
  iconAnimWrap: {},
  iconOuter: { width: 138, height: 138, borderRadius: 40, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 20 },
  iconInner: { width: 108, height: 108, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  ring1: { position: "absolute", width: 172, height: 172, borderRadius: 86, borderWidth: 1 },
  ring2: { position: "absolute", width: 214, height: 214, borderRadius: 107, borderWidth: 1 },
  badge: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  badgeEmoji: { fontSize: 14 },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  title: { color: "#F8FAFC", fontSize: 32, fontFamily: "Inter_700Bold", textAlign: "center", lineHeight: 42 },
  subtitle: { color: "rgba(255,255,255,0.52)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  bottom: { paddingHorizontal: 24, gap: 16, alignItems: "center" },
  dotsRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  dot: { height: 8, borderRadius: 4 },
  ctaWrap: { width: "100%" },
  ctaBtn: { height: 58, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12 },
  ctaText: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  bharatRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  bharatDot: { width: 7, height: 7, borderRadius: 4 },
  bharatText: { color: "rgba(255,255,255,0.22)", fontSize: 11, fontFamily: "Inter_400Regular" },
});
