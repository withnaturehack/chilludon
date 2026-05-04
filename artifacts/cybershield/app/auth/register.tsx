import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const ROLES = [
  { value: "student", label: "Student", icon: "school", desc: "Find vulnerabilities & earn rewards" },
  { value: "police", label: "Police / Govt", icon: "shield-check", desc: "Review reports & manage cases" },
  { value: "company", label: "Company", icon: "domain", desc: "Run bug bounty programs" },
];

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
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
      await register({
        name, email: email.trim().toLowerCase(), password, role,
        college_name: collegeName, state,
        station_name: stationName, badge_number: badgeNumber,
        company_name: companyName,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Registration Failed", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={[styles.logoRow]}>
          <View style={[styles.logoSmall, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="shield-lock" size={24} color="#FFF" />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Join CyberShield
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          India's national cybersecurity platform
        </Text>

        {/* Role Selection */}
        <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          I am joining as
        </Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.roleCard,
                {
                  backgroundColor: role === r.value ? colors.primary : colors.card,
                  borderColor: role === r.value ? colors.primary : colors.border,
                },
              ]}
              onPress={() => { setRole(r.value); Haptics.selectionAsync(); }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={r.icon as any}
                size={24}
                color={role === r.value ? "#FFF" : colors.mutedForeground}
              />
              <Text style={[
                styles.roleLabel,
                {
                  color: role === r.value ? "#FFF" : colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                },
              ]}>
                {r.label}
              </Text>
              <Text style={[
                styles.roleDesc,
                {
                  color: role === r.value ? "rgba(255,255,255,0.8)" : colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}>
                {r.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InputField label="Full Name" value={name} onChangeText={setName} icon="user" placeholder="Arjun Sharma" colors={colors} />
          <InputField label="Email" value={email} onChangeText={setEmail} icon="mail" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" colors={colors} />
          <InputField label="Password" value={password} onChangeText={setPassword} icon="lock" placeholder="Min. 6 characters" secureTextEntry colors={colors} />

          {role === "student" && (
            <>
              <InputField label="College Name" value={collegeName} onChangeText={setCollegeName} icon="book" placeholder="IIT Delhi" colors={colors} />
              <InputField label="State" value={state} onChangeText={setState} icon="map-pin" placeholder="Delhi" colors={colors} />
            </>
          )}

          {role === "police" && (
            <>
              <InputField label="Police Station" value={stationName} onChangeText={setStationName} icon="shield" placeholder="Delhi Cyber Crime Cell" colors={colors} />
              <InputField label="Badge Number" value={badgeNumber} onChangeText={setBadgeNumber} icon="tag" placeholder="IPS-4521" colors={colors} />
              <InputField label="State" value={state} onChangeText={setState} icon="map-pin" placeholder="Delhi" colors={colors} />
            </>
          )}

          {role === "company" && (
            <InputField label="Company Name" value={companyName} onChangeText={setCompanyName} icon="briefcase" placeholder="TechCorp India Pvt. Ltd." colors={colors} />
          )}

          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={[styles.registerBtnText, { color: loading ? colors.mutedForeground : "#FFF", fontFamily: "Inter_600SemiBold" }]}>
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/auth/login")} style={styles.loginLink}>
            <Text style={[styles.loginText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Already have an account?{" "}
              <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Owned by Kartik Chilkoti · CyberShield India 2024
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ label, value, onChangeText, icon, placeholder, secureTextEntry, keyboardType, autoCapitalize, colors }: any) {
  const [showPass, setShowPass] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.inputLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
      <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || "words"}
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Feather name={showPass ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20 },
  backBtn: { marginBottom: 16 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 },
  logoSmall: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  sectionLabel: { fontSize: 15, marginBottom: 12 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  roleCard: {
    flex: 1, padding: 12, borderRadius: 14, alignItems: "center",
    borderWidth: 2, gap: 6,
  },
  roleLabel: { fontSize: 13, textAlign: "center" },
  roleDesc: { fontSize: 10, textAlign: "center" },
  form: {
    width: "100%", borderRadius: 20, padding: 20, borderWidth: 1,
    marginBottom: 20,
  },
  inputLabel: { fontSize: 12, marginBottom: 6 },
  inputGroup: {
    flexDirection: "row", alignItems: "center", borderRadius: 10,
    borderWidth: 1, paddingHorizontal: 12, height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, height: "100%" },
  registerBtn: {
    height: 50, borderRadius: 12, alignItems: "center",
    justifyContent: "center", marginTop: 8, marginBottom: 16,
  },
  registerBtnText: { fontSize: 16 },
  loginLink: { alignItems: "center" },
  loginText: { fontSize: 14 },
  footer: { fontSize: 11, textAlign: "center" },
});
