import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Animated,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

const ROLES = [
  { value: "student", label: "Student", icon: "school", desc: "Hunt bugs & earn rewards", color: "#3B82F6" },
  { value: "police", label: "Police / Govt", icon: "shield-check", desc: "Review & manage cases", color: "#10B981" },
  { value: "company", label: "Company", icon: "domain", desc: "Run bounty programs", color: "#F59E0B" },
];

function navigateByRole(role: string) {
  if (role === "student" || role === "admin") {
    router.replace("/(student)");
  } else if (role === "police") {
    router.replace("/(police)");
  } else if (role === "company") {
    router.replace("/(company)");
  } else {
    router.replace("/(student)");
  }
}

function InputField({ label, value, onChangeText, icon, placeholder, secureTextEntry, keyboardType, autoCapitalize, colors }: any) {
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_500Medium" }}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <Feather name={icon} size={16} color={focused ? colors.primary : colors.mutedForeground} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || "words"}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name={showPass ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [state, setState] = useState("");
  const [stationName, setStationName] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const newUser = await register({
        name, email: email.trim().toLowerCase(), password, role,
        college_name: collegeName, state,
        station_name: stationName, badge_number: badgeNumber,
        company_name: companyName,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigateByRole(newUser.role);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Registration Failed", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#060D1A", "#0B1120", "#0F1829"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, { width: "100%" }]}>
            {/* Back */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <View style={styles.backBtnInner}>
                <Feather name="arrow-left" size={20} color="#F8FAFC" />
              </View>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={["#1D4ED8", "#3B82F6", "#06B6D4"]} style={styles.logoGrad}>
                <MaterialCommunityIcons name="shield-lock" size={28} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={styles.title}>Join CyberShield</Text>
                <Text style={styles.subtitle}>India's national cybersecurity platform</Text>
              </View>
            </View>

            {/* Role Selection */}
            <Text style={styles.sectionLabel}>I am joining as</Text>
            <View style={styles.roleRow}>
              {ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleCard, active && { borderColor: r.color, borderWidth: 2 }]}
                    onPress={() => { setRole(r.value); Haptics.selectionAsync(); }}
                    activeOpacity={0.7}
                  >
                    {active && <LinearGradient colors={[r.color + "25", r.color + "08"]} style={StyleSheet.absoluteFill} />}
                    <MaterialCommunityIcons name={r.icon as any} size={22} color={active ? r.color : colors.mutedForeground} />
                    <Text style={[styles.roleLabel, { color: active ? r.color : "#F8FAFC", fontFamily: "Inter_600SemiBold" }]}>
                      {r.label}
                    </Text>
                    <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{r.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <LinearGradient colors={["rgba(59,130,246,0.08)", "rgba(6,182,212,0.03)"]} style={StyleSheet.absoluteFill} />
              <InputField label="Full Name *" value={name} onChangeText={setName} icon="user" placeholder="Arjun Sharma" colors={colors} />
              <InputField label="Email *" value={email} onChangeText={setEmail} icon="mail" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" colors={colors} />
              <InputField label="Password *" value={password} onChangeText={setPassword} icon="lock" placeholder="Min. 6 characters" secureTextEntry colors={colors} />

              {role === "student" && (
                <>
                  <InputField label="College Name" value={collegeName} onChangeText={setCollegeName} icon="book" placeholder="IIT Delhi" colors={colors} />
                  <InputField label="State" value={state} onChangeText={setState} icon="map-pin" placeholder="Delhi" colors={colors} />
                </>
              )}

              {role === "police" && (
                <>
                  <InputField label="Police Station" value={stationName} onChangeText={setStationName} icon="shield" placeholder="Delhi Cyber Crime Cell" colors={colors} />
                  <InputField label="Badge Number" value={badgeNumber} onChangeText={setBadgeNumber} icon="tag" placeholder="IPS-4521" autoCapitalize="none" colors={colors} />
                  <InputField label="State" value={state} onChangeText={setState} icon="map-pin" placeholder="Delhi" colors={colors} />
                </>
              )}

              {role === "company" && (
                <InputField label="Company Name" value={companyName} onChangeText={setCompanyName} icon="briefcase" placeholder="TechCorp India Pvt. Ltd." colors={colors} />
              )}

              <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
                <LinearGradient
                  colors={loading ? ["#334155", "#334155"] : ["#1D4ED8", "#3B82F6"]}
                  style={styles.registerBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <Text style={styles.registerBtnText}>Creating Account...</Text>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="shield-plus" size={18} color="#FFF" />
                      <Text style={styles.registerBtnText}>Create Account</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.replace("/auth/login")} style={styles.loginLink}>
                <Text style={styles.loginText}>
                  Already have an account?{" "}
                  <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>CyberShield India · Owned by Kartik Chilkoti</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20 },
  backBtn: { marginBottom: 16 },
  backBtnInner: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 },
  logoGrad: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionLabel: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  roleCard: { flex: 1, padding: 12, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", gap: 6, backgroundColor: "#0F1A2E", overflow: "hidden" },
  roleLabel: { fontSize: 12, textAlign: "center" },
  roleDesc: { fontSize: 9, textAlign: "center", fontFamily: "Inter_400Regular" },
  formCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 20, gap: 14, backgroundColor: "#0F1A2E", overflow: "hidden" },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#1E293B", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, height: 50 },
  inputFocused: { borderColor: "#3B82F6", borderWidth: 1.5 },
  input: { flex: 1, color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_400Regular", height: "100%" },
  registerBtn: { height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  registerBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  loginLink: { alignItems: "center" },
  loginText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular" },
  footer: { color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 8 },
});
