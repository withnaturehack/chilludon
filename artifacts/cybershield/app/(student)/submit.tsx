import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const TYPES = ["vulnerability", "fraud_report", "research", "ctf_solution"];
const SEVERITIES = ["critical", "high", "medium", "low", "info"];
const CATEGORIES = ["web", "network", "mobile", "social_engineering", "financial", "hardware", "malware", "osint", "other"];

const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16", info: "#60A5FA",
};

export default function SubmitScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const qc = useQueryClient();

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

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Title and description are required");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/submissions", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
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
      Alert.alert(
        "Submitted!",
        "Your report has been submitted for review. RakshBot AI will analyze it shortly.",
        [{ text: "OK", onPress: () => { setTitle(""); setDescription(""); setSteps(""); setImpact(""); setFix(""); setTargetUrl(""); } }]
      );
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Submit Report
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Report vulnerabilities & earn rewards
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Type */}
        <Label text="Report Type" colors={colors} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, { backgroundColor: type === t ? colors.primary : colors.card, borderColor: type === t ? colors.primary : colors.border }]}
              onPress={() => { setType(t); Haptics.selectionAsync(); }}
            >
              <Text style={[styles.chipText, { color: type === t ? "#FFF" : colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {t.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Severity */}
        <Label text="Severity Level" colors={colors} />
        <View style={styles.row}>
          {SEVERITIES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sevChip, { backgroundColor: severity === s ? SEV_COLORS[s] : colors.card, borderColor: SEV_COLORS[s] }]}
              onPress={() => { setSeverity(s); Haptics.selectionAsync(); }}
            >
              <Text style={[styles.chipText, { color: severity === s ? "#FFF" : SEV_COLORS[s], fontFamily: "Inter_600SemiBold" }]}>
                {s.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <Label text="Category" colors={colors} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, { backgroundColor: category === c ? colors.accent : colors.card, borderColor: category === c ? colors.accent : colors.border }]}
              onPress={() => { setCategory(c); Haptics.selectionAsync(); }}
            >
              <Text style={[styles.chipText, { color: category === c ? "#FFF" : colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {c.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Title */}
        <Label text="Title *" colors={colors} />
        <TextInput
          style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Brief description of the vulnerability"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />

        {/* Description */}
        <Label text="Description *" colors={colors} />
        <TextInput
          style={[styles.textarea, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Detailed description of what you found..."
          placeholderTextColor={colors.mutedForeground}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* Target URL */}
        <Label text="Target URL / System" colors={colors} />
        <TextInput
          style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="https://example.gov.in/login"
          placeholderTextColor={colors.mutedForeground}
          value={targetUrl}
          onChangeText={setTargetUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* Steps to reproduce */}
        <Label text="Steps to Reproduce" colors={colors} />
        <TextInput
          style={[styles.textarea, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="1. Go to login page&#10;2. Enter ' OR 1=1-- in username&#10;3. ..."
          placeholderTextColor={colors.mutedForeground}
          value={steps}
          onChangeText={setSteps}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Impact */}
        <Label text="Impact Description" colors={colors} />
        <TextInput
          style={[styles.textarea, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Describe the potential impact of this vulnerability..."
          placeholderTextColor={colors.mutedForeground}
          value={impact}
          onChangeText={setImpact}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Fix suggestion */}
        <Label text="Suggested Fix" colors={colors} />
        <TextInput
          style={[styles.textarea, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="How should this be fixed? (parameterized queries, input validation...)"
          placeholderTextColor={colors.mutedForeground}
          value={fix}
          onChangeText={setFix}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* AI note */}
        <View style={[styles.aiNote, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}>
          <Feather name="cpu" size={16} color={colors.primary} />
          <Text style={[styles.aiNoteText, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>
            RakshBot AI will automatically analyze your submission for quality and plagiarism before it reaches reviewers.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Feather name="send" size={18} color={loading ? colors.mutedForeground : "#FFF"} />
          <Text style={[styles.submitBtnText, { color: loading ? colors.mutedForeground : "#FFF", fontFamily: "Inter_600SemiBold" }]}>
            {loading ? "Submitting..." : "Submit Report"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ text, colors }: any) {
  return (
    <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22 },
  headerSub: { fontSize: 13, marginTop: 2 },
  content: { padding: 16 },
  label: { fontSize: 14, marginBottom: 8, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  sevChip: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, alignItems: "center", marginRight: 6 },
  chipText: { fontSize: 13 },
  row: { flexDirection: "row", marginBottom: 16 },
  input: {
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, marginBottom: 16,
  },
  textarea: {
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, marginBottom: 16, minHeight: 100,
  },
  aiNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  aiNoteText: { flex: 1, fontSize: 13, lineHeight: 18 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14 },
  submitBtnText: { fontSize: 16 },
});
