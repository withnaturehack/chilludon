import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const DEMO_CREDENTIALS = [
  { label: "Student", email: "arjun@student.in", password: "Student@123", role: "student" },
  { label: "Police", email: "police@cybershield.in", password: "Police@123", role: "police" },
  { label: "Company", email: "company@cybershield.in", password: "Company@123", role: "company" },
];

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="shield-lock" size={40} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            CyberShield India
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            National Cybersecurity Platform
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Sign In
          </Text>

          <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="mail" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="Email address"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={[styles.loginBtnText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                Signing in...
              </Text>
            ) : (
              <Text style={[styles.loginBtnText, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/auth/register")}
            style={styles.registerLink}
          >
            <Text style={[styles.registerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              New to CyberShield?{" "}
              <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo accounts */}
        <View style={styles.demoSection}>
          <Text style={[styles.demoTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Quick Demo Access
          </Text>
          <View style={styles.demoRow}>
            {DEMO_CREDENTIALS.map((cred) => (
              <TouchableOpacity
                key={cred.role}
                style={[styles.demoBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => fillDemo(cred)}
                activeOpacity={0.7}
              >
                <Text style={[styles.demoBtnLabel, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  {cred.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Owned by Kartik Chilkoti · CyberShield India 2024
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
  },
  form: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  loginBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  loginBtnText: {
    fontSize: 16,
  },
  registerLink: {
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
  },
  demoSection: {
    width: "100%",
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  demoRow: {
    flexDirection: "row",
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  demoBtnLabel: {
    fontSize: 13,
  },
  footer: {
    fontSize: 11,
    textAlign: "center",
  },
});
