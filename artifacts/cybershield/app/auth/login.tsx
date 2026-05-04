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

const DEMO_CREDENTIALS = [
  { label: "Student", email: "arjun@student.in", password: "Student@123", role: "student", color: "#3B82F6" },
  { label: "Police", email: "police@cybershield.in", password: "Police@123", role: "police", color: "#10B981" },
  { label: "Company", email: "company@cybershield.in", password: "Company@123", role: "company", color: "#F59E0B" },
];

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Login Failed", err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(cred: typeof DEMO_CREDENTIALS[0]) {
    setEmail(cred.email);
    setPassword(cred.password);
    Haptics.selectionAsync();
  }

  return (
    <LinearGradient colors={["#060D1A", "#0B1120", "#0F1829"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Logo */}
            <View style={styles.header}>
              <LinearGradient colors={["#1D4ED8", "#3B82F6", "#06B6D4"]} style={styles.logoGrad}>
                <MaterialCommunityIcons name="shield-lock" size={36} color="#FFF" />
              </LinearGradient>
              <Text style={styles.title}>CyberShield India</Text>
              <Text style={styles.subtitle}>National Cybersecurity Platform</Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <LinearGradient colors={["rgba(59,130,246,0.1)", "rgba(6,182,212,0.05)"]} style={StyleSheet.absoluteFill} />
              <Text style={styles.formTitle}>Sign In</Text>

              {/* Email */}
              <View style={[styles.inputWrap, focusedField === "email" && styles.inputFocused]}>
                <Feather name="mail" size={17} color={focusedField === "email" ? colors.primary : colors.mutedForeground} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Password */}
              <View style={[styles.inputWrap, focusedField === "password" && styles.inputFocused]}>
                <Feather name="lock" size={17} color={focusedField === "password" ? colors.primary : colors.mutedForeground} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={17} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
                style={{ marginTop: 8 }}
              >
                <LinearGradient
                  colors={loading ? ["#334155", "#334155"] : ["#1D4ED8", "#3B82F6"]}
                  style={styles.loginBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <Text style={styles.loginBtnText}>Signing in...</Text>
                  ) : (
                    <>
                      <Feather name="log-in" size={18} color="#FFF" />
                      <Text style={styles.loginBtnText}>Sign In</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/auth/register")} style={styles.registerLink}>
                <Text style={styles.registerText}>
                  New to CyberShield?{" "}
                  <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Create Account</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Access */}
            <View style={styles.demoSection}>
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Quick Demo Access</Text>
                <View style={styles.divider} />
              </View>
              <View style={styles.demoRow}>
                {DEMO_CREDENTIALS.map((cred) => (
                  <TouchableOpacity
                    key={cred.role}
                    style={[styles.demoBtn, { borderColor: cred.color + "40" }]}
                    onPress={() => fillDemo(cred)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.demoDot, { backgroundColor: cred.color }]} />
                    <Text style={[styles.demoBtnLabel, { color: cred.color, fontFamily: "Inter_600SemiBold" }]}>
                      {cred.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.features}>
              {["Bug Bounty Rewards", "AI Mentor RakshBot", "CERT-In Certified"].map(f => (
                <View key={f} style={styles.featureItem}>
                  <MaterialCommunityIcons name="check-circle" size={13} color="#10B981" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.footer}>CyberShield India · Owned by Kartik Chilkoti</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, alignItems: "center" },
  inner: { width: "100%", alignItems: "center", gap: 20 },
  header: { alignItems: "center", gap: 12, marginBottom: 4 },
  logoGrad: { width: 80, height: 80, borderRadius: 22, alignItems: "center", justifyContent: "center", shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12 },
  title: { color: "#F8FAFC", fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "Inter_400Regular" },
  formCard: { width: "100%", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", gap: 14, backgroundColor: "#0F1A2E" },
  formTitle: { color: "#F8FAFC", fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#1E293B", borderRadius: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 16, height: 54 },
  inputFocused: { borderColor: "#3B82F6", borderWidth: 1.5, shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 8 },
  input: { flex: 1, color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_400Regular", height: "100%" },
  loginBtn: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  loginBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  registerLink: { alignItems: "center" },
  registerText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular" },
  demoSection: { width: "100%", gap: 14 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  divider: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  dividerText: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Inter_400Regular" },
  demoRow: { flexDirection: "row", gap: 10 },
  demoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.03)" },
  demoDot: { width: 6, height: 6, borderRadius: 3 },
  demoBtnLabel: { fontSize: 13 },
  features: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  featureText: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular" },
  footer: { color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
});
