import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, Animated, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";

const CRIME_TYPES = [
  { id: "upi_fraud", label: "UPI Fraud", icon: "credit-card-off", desc: "Fake payment requests, UPI scams", color: "#EF4444" },
  { id: "phishing", label: "Phishing", icon: "fish", desc: "Fake emails, websites, SMS links", color: "#F97316" },
  { id: "identity_theft", label: "Identity Theft", icon: "account-alert", desc: "Aadhaar/PAN misuse, impersonation", color: "#8B5CF6" },
  { id: "cyber_stalking", label: "Cyber Stalking", icon: "eye-off", desc: "Online harassment, threats", color: "#EC4899" },
  { id: "ransomware", label: "Ransomware", icon: "lock-alert", desc: "Files locked, ransom demanded", color: "#DC2626" },
  { id: "data_breach", label: "Data Breach", icon: "database-alert", desc: "Personal data leaked/stolen", color: "#06B6D4" },
  { id: "fake_website", label: "Fake Website", icon: "web-cancel", desc: "Fraud shopping/banking sites", color: "#D97706" },
  { id: "other", label: "Other", icon: "dots-horizontal", desc: "Any other cyber crime", color: "#6B7280" },
];

export default function CitizenReport() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const [step, setStep] = useState(1);
  const [crimeType, setCrimeType] = useState("");
  const [description, setDescription] = useState("");
  const [amountLost, setAmountLost] = useState("");
  const [suspectInfo, setSuspectInfo] = useState("");
  const [websiteOrApp, setWebsiteOrApp] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  async function detectLocation() {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Location access helps police respond to your report faster. You can still submit without it.");
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const address = [geo?.street, geo?.district, geo?.city, geo?.region].filter(Boolean).join(", ");
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude, address });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Error", "Could not detect location. You can still submit without it.");
    } finally {
      setLocationLoading(false);
    }
  }

  async function handleSubmit() {
    if (!crimeType || !description) {
      Alert.alert("Error", "Please select crime type and describe the incident");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/citizen/report", {
        method: "POST",
        body: JSON.stringify({
          crime_type: crimeType,
          description,
          amount_lost: amountLost ? Number(amountLost) : null,
          suspect_info: suspectInfo,
          website_or_app: websiteOrApp,
          location_lat: location?.lat,
          location_lng: location?.lng,
          location_address: location?.address,
        }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch {
      Alert.alert("Submission Failed", "Could not submit report. Please try again or call 1930.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <LinearGradient colors={["#059669", "#10B981"]} style={styles.successIcon}>
          <Feather name="check" size={40} color="#FFF" />
        </LinearGradient>
        <Text style={styles.successTitle}>Report Submitted!</Text>
        <Text style={styles.successSub}>
          Your report has been registered. Cyber police will review it within 24 hours. Your report ID has been saved.
        </Text>
        <Text style={styles.successHelpline}>For urgent matters, call 1930</Text>
        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => { setSubmitted(false); setStep(1); setCrimeType(""); setDescription(""); setAmountLost(""); setSuspectInfo(""); setWebsiteOrApp(""); setLocation(null); }}
        >
          <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.successBtnGrad}>
            <Text style={styles.successBtnText}>Report Another</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#1A0505", "#2A0808", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons name="shield-alert" size={12} color="#EF4444" />
          <Text style={styles.headerBadgeText}>Cyber Crime Report</Text>
        </View>
        <Text style={styles.headerTitle}>File a Report</Text>
        <Text style={styles.headerSub}>Report will be sent to your state cyber police</Text>
        <View style={styles.progressRow}>
          {[1, 2, 3].map(s => (
            <View key={s} style={styles.progressItem}>
              <View style={[styles.progressDot, step >= s && { backgroundColor: "#EF4444" }, step === s && { width: 28, borderRadius: 4 }]}>
                {step > s
                  ? <Feather name="check" size={10} color="#FFF" />
                  : <Text style={styles.progressNum}>{s}</Text>
                }
              </View>
              <Text style={[styles.progressLabel, step >= s && { color: "#EF4444" }]}>
                {s === 1 ? "Type" : s === 2 ? "Details" : "Location"}
              </Text>
            </View>
          ))}
          <View style={styles.progressLine} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 90, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {step === 1 && (
            <View style={{ gap: 10 }}>
              <Text style={styles.stepTitle}>What type of cyber crime occurred?</Text>
              <View style={styles.crimeGrid}>
                {CRIME_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.crimeCard, crimeType === t.id && { borderColor: t.color, borderWidth: 2 }]}
                    onPress={() => { setCrimeType(t.id); Haptics.selectionAsync(); }}
                    activeOpacity={0.75}
                  >
                    {crimeType === t.id && <LinearGradient colors={[t.color + "20", t.color + "05"]} style={StyleSheet.absoluteFill} />}
                    <MaterialCommunityIcons name={t.icon as any} size={24} color={crimeType === t.id ? t.color : "rgba(255,255,255,0.4)"} />
                    <Text style={[styles.crimeLabel, crimeType === t.id && { color: t.color }]}>{t.label}</Text>
                    <Text style={styles.crimeDesc}>{t.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => crimeType ? setStep(2) : Alert.alert("Select Type", "Please select the type of crime")}
                activeOpacity={0.85}
                style={{ marginTop: 8 }}
              >
                <LinearGradient colors={["#DC2626", "#EF4444"]} style={styles.nextBtn}>
                  <Text style={styles.nextBtnText}>Continue</Text>
                  <Feather name="arrow-right" size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={{ gap: 14 }}>
              <Text style={styles.stepTitle}>Describe what happened</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Incident Description *</Text>
                <TextInput
                  style={[styles.textArea]}
                  placeholder="Describe the cyber crime in detail. When did it happen? What did you receive? What did you click or share?"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Website / App / Phone Number</Text>
                <View style={styles.inputRow}>
                  <Feather name="link" size={16} color="rgba(255,255,255,0.35)" />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., www.fake-sbi.com or +91 98765..."
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={websiteOrApp}
                    onChangeText={setWebsiteOrApp}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Amount Lost (₹)</Text>
                <View style={styles.inputRow}>
                  <MaterialCommunityIcons name="currency-inr" size={16} color="rgba(255,255,255,0.35)" />
                  <TextInput
                    style={styles.input}
                    placeholder="0 if no money lost"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={amountLost}
                    onChangeText={setAmountLost}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Suspect Information (if known)</Text>
                <View style={styles.inputRow}>
                  <Feather name="user-x" size={16} color="rgba(255,255,255,0.35)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Name, phone, email, profile link..."
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={suspectInfo}
                    onChangeText={setSuspectInfo}
                  />
                </View>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn} activeOpacity={0.7}>
                  <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => description ? setStep(3) : Alert.alert("Required", "Please describe the incident")}
                  activeOpacity={0.85}
                  style={{ flex: 1 }}
                >
                  <LinearGradient colors={["#DC2626", "#EF4444"]} style={styles.nextBtn}>
                    <Text style={styles.nextBtnText}>Continue</Text>
                    <Feather name="arrow-right" size={18} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={{ gap: 14 }}>
              <Text style={styles.stepTitle}>Add your location</Text>
              <Text style={styles.stepSubtitle}>This helps police respond quickly to your area</Text>

              {location ? (
                <View style={styles.locationCard}>
                  <LinearGradient colors={["rgba(16,185,129,0.12)", "transparent"]} style={StyleSheet.absoluteFill} />
                  <MaterialCommunityIcons name="map-marker-check" size={24} color="#10B981" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locationText}>{location.address || "Location detected"}</Text>
                    <Text style={styles.locationCoords}>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setLocation(null)}>
                    <Feather name="x" size={18} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={detectLocation} style={styles.detectBtn} activeOpacity={0.8}>
                  <LinearGradient colors={["rgba(6,182,212,0.15)", "rgba(6,182,212,0.05)"]} style={StyleSheet.absoluteFill} />
                  {locationLoading
                    ? <ActivityIndicator color="#06B6D4" />
                    : <MaterialCommunityIcons name="map-marker-radius" size={28} color="#06B6D4" />
                  }
                  <View>
                    <Text style={styles.detectTitle}>Detect My Location</Text>
                    <Text style={styles.detectSub}>Auto-detect using GPS</Text>
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.noteCard}>
                <Feather name="info" size={14} color="#06B6D4" />
                <Text style={styles.noteText}>
                  Location is optional. Your report will still be processed without it. All data is encrypted and shared only with authorized cyber police.
                </Text>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity onPress={() => setStep(2)} style={styles.backBtn} activeOpacity={0.7}>
                  <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} disabled={submitting} activeOpacity={0.85} style={{ flex: 1 }}>
                  <LinearGradient colors={submitting ? ["#334155", "#334155"] : ["#DC2626", "#EF4444"]} style={styles.nextBtn}>
                    {submitting ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="shield-alert" size={18} color="#FFF" />
                        <Text style={styles.nextBtnText}>Submit Report</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, overflow: "hidden" },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(239,68,68,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start", marginBottom: 8 },
  headerBadgeText: { color: "#EF4444", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  headerTitle: { color: "#F8FAFC", fontSize: 26, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, position: "relative" },
  progressItem: { flex: 1, alignItems: "center", gap: 5, zIndex: 1 },
  progressDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  progressNum: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  progressLabel: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Inter_400Regular" },
  progressLine: { position: "absolute", height: 1, backgroundColor: "rgba(255,255,255,0.08)", left: "16%", right: "16%", top: 12 },
  stepTitle: { color: "#F8FAFC", fontSize: 18, fontFamily: "Inter_700Bold" },
  stepSubtitle: { color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  crimeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  crimeCard: { flexBasis: "47%", flexGrow: 1, padding: 14, borderRadius: 16, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", alignItems: "center", gap: 8, overflow: "hidden" },
  crimeLabel: { color: "#F8FAFC", fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  crimeDesc: { color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  fieldGroup: { gap: 8 },
  fieldLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_500Medium" },
  textArea: { backgroundColor: "#0F1A2E", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14, color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 120 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#0F1A2E", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, height: 50 },
  input: { flex: 1, color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_400Regular" },
  nextBtn: { height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  nextBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  btnRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, height: 52, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  backBtnText: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "Inter_500Medium" },
  detectBtn: { flexDirection: "row", alignItems: "center", gap: 14, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: "rgba(6,182,212,0.25)", overflow: "hidden" },
  detectTitle: { color: "#06B6D4", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  detectSub: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  locationCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(16,185,129,0.25)", backgroundColor: "#0F1A2E", overflow: "hidden" },
  locationText: { color: "#F8FAFC", fontSize: 13, fontFamily: "Inter_500Medium" },
  locationCoords: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  noteCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(6,182,212,0.15)", backgroundColor: "rgba(6,182,212,0.04)" },
  noteText: { flex: 1, color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular" },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  successTitle: { color: "#F8FAFC", fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 12 },
  successSub: { color: "rgba(255,255,255,0.5)", fontSize: 15, textAlign: "center", lineHeight: 22, fontFamily: "Inter_400Regular", marginBottom: 16 },
  successHelpline: { color: "#06B6D4", fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 24 },
  successBtn: { overflow: "hidden", borderRadius: 14, width: "100%" },
  successBtnGrad: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  successBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
