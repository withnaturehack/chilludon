import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const TYPES = [
  { value: "vulnerability", label: "Vulnerability", icon: "bug" },
  { value: "fraud_report", label: "Fraud Report", icon: "alert-triangle" },
  { value: "research", label: "Research", icon: "cpu" },
  { value: "ctf_solution", label: "CTF Solution", icon: "flag" },
];

const SEVERITIES = [
  { value: "critical", label: "Critical", color: "#EF4444", pts: "500-5000" },
  { value: "high", label: "High", color: "#F97316", pts: "200-500" },
  { value: "medium", label: "Medium", color: "#EAB308", pts: "50-200" },
  { value: "low", label: "Low", color: "#84CC16", pts: "10-50" },
  { value: "info", label: "Info", color: "#60A5FA", pts: "5-10" },
];

const CATEGORIES = ["web", "network", "mobile", "social_engineering", "financial", "hardware", "malware", "osint", "other"];

export default function SubmitScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const qc = useQueryClient();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("vulnerability");
  const [severity, setSeverity] = useState("medium");
  const [category, setCategory] = useState("web");
  const [targetUrl, setTargetUrl] = useState("");
  const [steps, setSteps] = useState("");
  const [impact, setImpact] = useState("");
  const [fix, setFix] = useState("");
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing Info", "Title and description are required");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/submissions", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(), description: description.trim(),
          type, severity, category,
          target_url: targetUrl.trim(),
          steps_to_reproduce: steps.trim(),
          impact_description: impact.trim(),
          fix_suggestion: fix.trim(),
        }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["my-submissions"] });
      Alert.alert("🎉 Submitted!", "Your report has been submitted. RakshBot AI will analyze it shortly.", [
        { text: "Submit Another", onPress: () => { setTitle(""); setDescription(""); setSteps(""); setImpact(""); setFix(""); setTargetUrl(""); setStep(1); } },
        { text: "View Reports", onPress: () => {} },
      ]);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const selectedSev = SEVERITIES.find(s => s.value === severity);

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <LinearGradient colors={["#0F2040", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Submit Report</Text>
              <Text style={styles.headerSub}>Report vulnerabilities · Earn rewards</Text>
            </View>
            <View style={styles.stepIndicator}>
              {[1, 2, 3].map(s => (
                <View key={s} style={[styles.stepDot, s === step && styles.stepDotActive, s < step && styles.stepDotDone]} />
              ))}
            </View>
          </View>
          <View style={styles.stepsRow}>
            {["Type & Severity", "Details", "Proof"].map((label, i) => (
              <TouchableOpacity key={label} onPress={() => setStep(i + 1)} style={[styles.stepTab, step === i + 1 && styles.stepTabActive]}>
                <Text style={[styles.stepTabText, step === i + 1 && styles.stepTabTextActive]}>
                  {i + 1}. {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {step === 1 && (
              <>
                {/* Type Selection */}
                <Label text="Report Type" />
                <View style={styles.typeGrid}>
                  {TYPES.map(t => (
                    <TouchableOpacity
                      key={t.value}
                      style={[styles.typeCard, type === t.value && styles.typeCardActive]}
                      onPress={() => { setType(t.value); Haptics.selectionAsync(); }}
                      activeOpacity={0.75}
                    >
                      {type === t.value && <LinearGradient colors={["#1D4ED820", "#3B82F610"]} style={StyleSheet.absoluteFill} />}
                      <Feather name={t.icon as any} size={20} color={type === t.value ? "#3B82F6" : "rgba(255,255,255,0.4)"} />
                      <Text style={[styles.typeLabel, type === t.value && { color: "#3B82F6" }]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Severity */}
                <Label text="Severity Level" />
                <View style={styles.sevGrid}>
                  {SEVERITIES.map(s => (
                    <TouchableOpacity
                      key={s.value}
                      style={[styles.sevCard, { borderColor: s.color + "50" }, severity === s.value && { backgroundColor: s.color + "20", borderColor: s.color }]}
                      onPress={() => { setSeverity(s.value); Haptics.selectionAsync(); }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.sevLabel, { color: severity === s.value ? s.color : "rgba(255,255,255,0.5)" }]}>{s.label}</Text>
                      <Text style={[styles.sevPts, { color: severity === s.value ? s.color : "rgba(255,255,255,0.3)" }]}>{s.pts} pts</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Category */}
                <Label text="Category" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catChip, category === c && styles.catChipActive]}
                      onPress={() => { setCategory(c); Haptics.selectionAsync(); }}
                    >
                      <Text style={[styles.catText, category === c && { color: "#06B6D4" }]}>{c.replace("_", " ")}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity onPress={() => setStep(2)} activeOpacity={0.85}>
                  <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.nextBtn}>
                    <Text style={styles.nextBtnText}>Continue</Text>
                    <Feather name="arrow-right" size={18} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Label text="Title *" />
                <TextInput
                  style={styles.inputField}
                  placeholder="Brief description of the vulnerability"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={200}
                />

                <Label text="Description *" />
                <TextInput
                  style={[styles.inputField, styles.textarea]}
                  placeholder="Detailed description of what you found..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                <Label text="Target URL / System" />
                <TextInput
                  style={styles.inputField}
                  placeholder="https://example.gov.in/login"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={targetUrl}
                  onChangeText={setTargetUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />

                <View style={styles.stepBtns}>
                  <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                    <Feather name="arrow-left" size={16} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.backBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { if (!title || !description) { Alert.alert("Missing", "Title and description required"); return; } setStep(3); }} activeOpacity={0.85} style={{ flex: 1 }}>
                    <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.nextBtn}>
                      <Text style={styles.nextBtnText}>Continue</Text>
                      <Feather name="arrow-right" size={18} color="#FFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <Label text="Steps to Reproduce" />
                <TextInput
                  style={[styles.inputField, styles.textarea]}
                  placeholder={"1. Go to login page\n2. Enter payload\n3. Observe result..."}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={steps}
                  onChangeText={setSteps}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <Label text="Impact Description" />
                <TextInput
                  style={[styles.inputField, styles.textarea]}
                  placeholder="Describe the potential impact..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={impact}
                  onChangeText={setImpact}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Label text="Suggested Fix" />
                <TextInput
                  style={[styles.inputField, styles.textarea]}
                  placeholder="How should this be fixed?"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={fix}
                  onChangeText={setFix}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                {/* Summary card */}
                <LinearGradient colors={["#0F2040", "#1A3A6B"]} style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <MaterialCommunityIcons name="bug" size={16} color="#06B6D4" />
                    <Text style={styles.summaryText}>Type: <Text style={{ color: "#F8FAFC" }}>{type.replace("_", " ")}</Text></Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <MaterialCommunityIcons name="alert-circle" size={16} color={selectedSev?.color} />
                    <Text style={styles.summaryText}>Severity: <Text style={{ color: selectedSev?.color }}>{severity} ({selectedSev?.pts} pts)</Text></Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <MaterialCommunityIcons name="robot" size={16} color="#3B82F6" />
                    <Text style={styles.summaryText}>RakshBot AI will analyze this submission automatically</Text>
                  </View>
                </LinearGradient>

                <View style={styles.stepBtns}>
                  <TouchableOpacity onPress={() => setStep(2)} style={styles.backBtn}>
                    <Feather name="arrow-left" size={16} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.backBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85} style={{ flex: 1 }}>
                    <LinearGradient colors={loading ? ["#334155", "#334155"] : ["#059669", "#10B981"]} style={styles.nextBtn}>
                      <Feather name="send" size={18} color="#FFF" />
                      <Text style={styles.nextBtnText}>{loading ? "Submitting..." : "Submit Report"}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  stepIndicator: { flexDirection: "row", gap: 6, alignItems: "center", paddingTop: 4 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.15)" },
  stepDotActive: { backgroundColor: "#3B82F6", width: 20 },
  stepDotDone: { backgroundColor: "#10B981" },
  stepsRow: { flexDirection: "row", gap: 8 },
  stepTab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10, backgroundColor: "rgba(255,255,255,0.04)" },
  stepTabActive: { backgroundColor: "rgba(59,130,246,0.2)" },
  stepTabText: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_500Medium" },
  stepTabTextActive: { color: "#3B82F6" },
  content: { padding: 16 },
  label: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10, marginTop: 8 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  typeCard: { width: "47%", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#0F1A2E", alignItems: "center", gap: 8, overflow: "hidden" },
  typeCardActive: { borderColor: "#3B82F6" },
  typeLabel: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter_500Medium" },
  sevGrid: { flexDirection: "row", gap: 8, marginBottom: 4 },
  sevCard: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: "center", gap: 3, backgroundColor: "rgba(255,255,255,0.03)" },
  sevLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  sevPts: { fontSize: 9, fontFamily: "Inter_400Regular" },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginRight: 8, backgroundColor: "#0F1A2E" },
  catChipActive: { backgroundColor: "#06B6D420", borderColor: "#06B6D4" },
  catText: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter_500Medium" },
  inputField: { backgroundColor: "#1E293B", borderRadius: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 16, paddingVertical: 14, color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 16 },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  nextBtn: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  nextBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  stepBtns: { flexDirection: "row", gap: 12, alignItems: "stretch" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#0F1A2E" },
  backBtnText: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "Inter_500Medium" },
  summaryCard: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "rgba(59,130,246,0.2)", gap: 10 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryText: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
});
