import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, Platform, Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const HW = Platform.OS !== "web";

const CRIME_CATEGORIES = [
  { id: "upi_fraud", label: "UPI / Payment Fraud", icon: "credit-card-off" as const, color: "#EF4444", ipc: "IPC 420, IT Act 66C" },
  { id: "phishing", label: "Phishing Attack", icon: "hook" as const, color: "#F97316", ipc: "IPC 420, IT Act 66D" },
  { id: "identity_theft", label: "Identity Theft", icon: "account-alert" as const, color: "#8B5CF6", ipc: "IT Act 66C, IPC 468" },
  { id: "ransomware", label: "Ransomware / Malware", icon: "lock-alert" as const, color: "#DC2626", ipc: "IT Act 43, 66" },
  { id: "cyber_stalking", label: "Cyber Stalking / Threat", icon: "eye-off" as const, color: "#EC4899", ipc: "IPC 354D, 507" },
  { id: "data_breach", label: "Data Breach", icon: "database-alert" as const, color: "#06B6D4", ipc: "IT Act 43A, 72" },
  { id: "fake_news", label: "Fake News / Defamation", icon: "newspaper-variant-multiple" as const, color: "#D97706", ipc: "IPC 499, 500" },
  { id: "other", label: "Other Cyber Crime", icon: "dots-horizontal" as const, color: "#6B7280", ipc: "IT Act 66" },
];

const STATES = [
  "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

function generateFIRNumber(): string {
  const year = new Date().getFullYear();
  const ps = Math.floor(Math.random() * 900) + 100;
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `CYBER-${year}-${ps}-${num}`;
}

export default function FileFIR() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const [step, setStep] = useState(1);
  const [crimeCategory, setCrimeCategory] = useState("");
  const [complainantName, setComplainantName] = useState("");
  const [complainantPhone, setComplainantPhone] = useState("");
  const [complainantAadhaar, setComplainantAadhaar] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [amountLost, setAmountLost] = useState("");
  const [suspectInfo, setSuspectInfo] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [firNumber, setFirNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    animateIn();
  }, [step]);

  function animateIn() {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: HW }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: HW }),
    ]).start();
  }

  function handleNext() {
    if (step === 1 && !crimeCategory) {
      Alert.alert("Required", "Please select the type of cyber crime.");
      return;
    }
    if (step === 2) {
      if (!complainantName.trim()) { Alert.alert("Required", "Please enter complainant name."); return; }
      if (!incidentDesc.trim()) { Alert.alert("Required", "Please describe the incident."); return; }
    }
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setStep(s => s + 1);
  }

  function handleSubmit() {
    const fir = generateFIRNumber();
    setFirNumber(fir);
    setSubmitted(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const selectedCrime = CRIME_CATEGORIES.find(c => c.id === crimeCategory);

  if (submitted) {
    return (
      <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
        <View style={[styles.successContainer, { paddingTop: topPad }]}>
          <LinearGradient colors={["#10B981", "#059669"]} style={styles.successIcon}>
            <MaterialCommunityIcons name="check-bold" size={40} color="#FFF" />
          </LinearGradient>
          <Text style={styles.successTitle}>FIR Filed Successfully!</Text>
          <Text style={styles.successSub}>साइबर FIR दर्ज की गई</Text>

          <View style={styles.firCard}>
            <LinearGradient colors={["#0F1A2E", "#1E293B"]} style={StyleSheet.absoluteFill} />
            <View style={styles.firHeader}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#FCD34D" />
              <Text style={styles.firHeaderText}>CYBER CRIME FIR · साइबर अपराध प्रथम सूचना</Text>
            </View>
            <View style={styles.firRow}>
              <Text style={styles.firLabel}>FIR Number</Text>
              <Text style={styles.firValue}>{firNumber}</Text>
            </View>
            <View style={styles.firRow}>
              <Text style={styles.firLabel}>Crime Type</Text>
              <Text style={styles.firValue}>{selectedCrime?.label}</Text>
            </View>
            <View style={styles.firRow}>
              <Text style={styles.firLabel}>Complainant</Text>
              <Text style={styles.firValue}>{complainantName}</Text>
            </View>
            <View style={styles.firRow}>
              <Text style={styles.firLabel}>Date Filed</Text>
              <Text style={styles.firValue}>{new Date().toLocaleDateString("en-IN")}</Text>
            </View>
            <View style={styles.firRow}>
              <Text style={styles.firLabel}>IPC Sections</Text>
              <Text style={[styles.firValue, { color: "#FCD34D" }]}>{selectedCrime?.ipc}</Text>
            </View>
            <View style={styles.firRow}>
              <Text style={styles.firLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Under Investigation</Text>
              </View>
            </View>
          </View>

          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>Next Steps</Text>
            {[
              "FIR has been registered in National Cyber Crime Portal",
              "You will receive SMS updates on " + (complainantPhone || "your registered number"),
              "Investigation officer will contact within 48 hours",
              "Keep all evidence (screenshots, transaction IDs)",
            ].map((step, i) => (
              <View key={i} style={styles.nextStepItem}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                <Text style={styles.nextStepText}>{step}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => router.back()} style={styles.doneBtn}>
            <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.doneBtnGrad}>
              <MaterialCommunityIcons name="home" size={18} color="#FFF" />
              <Text style={styles.doneBtnText}>Back to Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient colors={["#1A0A05", "#2A1408", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>File Cyber FIR</Text>
            <Text style={styles.headerSub}>साइबर अपराध प्रथम सूचना रिपोर्ट</Text>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{step}/3</Text>
          </View>
        </View>

        {/* Step progress */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map(s => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepCircle, s <= step && { backgroundColor: "#FCD34D" }]}>
                {s < step ? (
                  <MaterialCommunityIcons name="check" size={13} color="#000" />
                ) : (
                  <Text style={[styles.stepCircleText, s <= step && { color: "#000" }]}>{s}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, s <= step && { color: "#FCD34D" }]}>
                {s === 1 ? "Crime Type" : s === 2 ? "Details" : "Review"}
              </Text>
              {s < 3 && <View style={[styles.stepLine, s < step && { backgroundColor: "#FCD34D" }]} />}
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* STEP 1: Crime Type */}
          {step === 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Crime Category</Text>
              <Text style={styles.sectionSub}>What type of cyber crime was committed?</Text>
              <View style={styles.crimeGrid}>
                {CRIME_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.crimeCard, crimeCategory === cat.id && { borderColor: cat.color, backgroundColor: cat.color + "15" }]}
                    onPress={() => { setCrimeCategory(cat.id); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.crimeIconWrap, { backgroundColor: cat.color + "20" }]}>
                      <MaterialCommunityIcons name={cat.icon} size={22} color={cat.color} />
                    </View>
                    <Text style={[styles.crimeLabel, crimeCategory === cat.id && { color: cat.color }]}>{cat.label}</Text>
                    <Text style={styles.crimeIpc}>{cat.ipc}</Text>
                    {crimeCategory === cat.id && (
                      <View style={[styles.crimeCheck, { backgroundColor: cat.color }]}>
                        <MaterialCommunityIcons name="check" size={10} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* STEP 2: Incident Details */}
          {step === 2 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Incident Details</Text>
              <Text style={styles.sectionSub}>Provide information about the crime and complainant</Text>

              {selectedCrime && (
                <View style={[styles.selectedCrimePill, { borderColor: selectedCrime.color + "50", backgroundColor: selectedCrime.color + "15" }]}>
                  <MaterialCommunityIcons name={selectedCrime.icon} size={16} color={selectedCrime.color} />
                  <Text style={[styles.selectedCrimeText, { color: selectedCrime.color }]}>{selectedCrime.label}</Text>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillBadgeText}>{selectedCrime.ipc}</Text>
                  </View>
                </View>
              )}

              {[
                { label: "Complainant Full Name *", value: complainantName, set: setComplainantName, icon: "account" as const, placeholder: "e.g. Rajesh Kumar Sharma" },
                { label: "Mobile Number", value: complainantPhone, set: setComplainantPhone, icon: "phone" as const, placeholder: "+91 98765 43210", keyboardType: "phone-pad" as const },
                { label: "Aadhaar / ID Number (optional)", value: complainantAadhaar, set: setComplainantAadhaar, icon: "card-account-details" as const, placeholder: "XXXX XXXX XXXX" },
                { label: "Date of Incident *", value: incidentDate, set: setIncidentDate, icon: "calendar" as const, placeholder: "DD/MM/YYYY" },
                { label: "Amount Lost (₹)", value: amountLost, set: setAmountLost, icon: "currency-inr" as const, placeholder: "0 if none", keyboardType: "numeric" as const },
                { label: "Suspect Info (name/phone/email)", value: suspectInfo, set: setSuspectInfo, icon: "account-alert" as const, placeholder: "Any known information" },
              ].map(field => (
                <View key={field.label} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <View style={styles.fieldInputWrap}>
                    <MaterialCommunityIcons name={field.icon} size={17} color="rgba(255,255,255,0.35)" />
                    <TextInput
                      style={styles.fieldInput}
                      value={field.value}
                      onChangeText={field.set}
                      placeholder={field.placeholder}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType={(field as any).keyboardType || "default"}
                    />
                  </View>
                </View>
              ))}

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Incident Description *</Text>
                <TextInput
                  style={styles.descInput}
                  value={incidentDesc}
                  onChangeText={setIncidentDesc}
                  placeholder="Describe in detail what happened, when, how, and the impact..."
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>State of Incident</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {STATES.map(st => (
                      <TouchableOpacity
                        key={st}
                        style={[styles.statePill, state === st && { backgroundColor: "#1D4ED8", borderColor: "#3B82F6" }]}
                        onPress={() => setState(st)}
                      >
                        <Text style={[styles.statePillText, state === st && { color: "#FFF" }]}>{st}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Review & Submit</Text>
              <Text style={styles.sectionSub}>Please review all information before filing the FIR</Text>

              <View style={styles.reviewCard}>
                <LinearGradient colors={["#0F1A2E", "#1E293B"]} style={StyleSheet.absoluteFill} />
                <View style={styles.reviewHeader}>
                  <MaterialCommunityIcons name="file-document-edit" size={18} color="#FCD34D" />
                  <Text style={styles.reviewHeaderText}>FIR DRAFT SUMMARY</Text>
                </View>
                {[
                  { label: "Crime Type", value: selectedCrime?.label },
                  { label: "IPC Sections", value: selectedCrime?.ipc },
                  { label: "Complainant", value: complainantName || "—" },
                  { label: "Phone", value: complainantPhone || "—" },
                  { label: "Date of Incident", value: incidentDate || "—" },
                  { label: "Amount Lost", value: amountLost ? `₹${amountLost}` : "₹0" },
                  { label: "State", value: state },
                ].map(item => (
                  <View key={item.label} style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>{item.label}</Text>
                    <Text style={styles.reviewValue}>{item.value}</Text>
                  </View>
                ))}
                {incidentDesc ? (
                  <View style={styles.reviewDescWrap}>
                    <Text style={styles.reviewLabel}>Description</Text>
                    <Text style={styles.reviewDesc}>{incidentDesc}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.warningCard}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#F59E0B" />
                <Text style={styles.warningText}>
                  By submitting, you confirm that all information provided is true and accurate. Filing a false FIR is a criminal offence under IPC Section 182.
                </Text>
              </View>

              <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85}>
                <LinearGradient colors={["#DC2626", "#EF4444"]} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <MaterialCommunityIcons name="file-document-edit" size={20} color="#FFF" />
                  <Text style={styles.submitBtnText}>File FIR Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Nav */}
      {!submitted && (
        <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 16 }]}>
          {step > 1 && (
            <TouchableOpacity style={styles.backNavBtn} onPress={() => setStep(s => s - 1)}>
              <MaterialCommunityIcons name="arrow-left" size={18} color="rgba(255,255,255,0.6)" />
              <Text style={styles.backNavText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 3 && (
            <TouchableOpacity style={{ flex: 1 }} onPress={handleNext} activeOpacity={0.85}>
              <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.nextBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.nextBtnText}>Continue</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#F8FAFC", fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular" },
  stepBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: "rgba(252,211,77,0.15)", borderWidth: 1, borderColor: "rgba(252,211,77,0.3)" },
  stepBadgeText: { color: "#FCD34D", fontSize: 12, fontFamily: "Inter_700Bold" },
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  stepCircleText: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_700Bold" },
  stepLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_500Medium" },
  stepLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  body: { padding: 20, paddingBottom: 100 },
  section: { gap: 16 },
  sectionTitle: { color: "#F8FAFC", fontSize: 20, fontFamily: "Inter_700Bold" },
  sectionSub: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  crimeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  crimeCard: { width: "48%", flexGrow: 1, backgroundColor: "#0F1A2E", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14, gap: 8, position: "relative" },
  crimeIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  crimeLabel: { color: "#F8FAFC", fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  crimeIpc: { color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter_400Regular" },
  crimeCheck: { position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  selectedCrimePill: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, flexWrap: "wrap" },
  selectedCrimeText: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  pillBadge: { backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  pillBadgeText: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "Inter_400Regular" },
  fieldWrap: { gap: 6 },
  fieldLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_500Medium" },
  fieldInputWrap: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#0F1A2E", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, height: 50 },
  fieldInput: { flex: 1, color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_400Regular" },
  descInput: { backgroundColor: "#0F1A2E", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14, color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 120 },
  statePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  statePillText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_500Medium" },
  reviewCard: { borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", padding: 20, gap: 12 },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  reviewHeaderText: { color: "#FCD34D", fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewLabel: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Inter_400Regular" },
  reviewValue: { color: "#F8FAFC", fontSize: 13, fontFamily: "Inter_600SemiBold", maxWidth: "55%", textAlign: "right" },
  reviewDescWrap: { gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  reviewDesc: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  warningCard: { flexDirection: "row", gap: 10, backgroundColor: "rgba(245,158,11,0.08)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.25)", padding: 14, alignItems: "flex-start" },
  warningText: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  submitBtn: { height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  submitBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  bottomNav: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 12, backgroundColor: "#060D1A", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  backNavBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, height: 52, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  backNavText: { color: "rgba(255,255,255,0.6)", fontSize: 15, fontFamily: "Inter_500Medium" },
  nextBtn: { height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  nextBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
  successContainer: { flex: 1, padding: 24, alignItems: "center", gap: 20 },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { color: "#F8FAFC", fontSize: 24, fontFamily: "Inter_700Bold" },
  successSub: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "Inter_400Regular" },
  firCard: { width: "100%", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", padding: 20, gap: 12 },
  firHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  firHeaderText: { color: "#FCD34D", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  firRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  firLabel: { color: "rgba(255,255,255,0.4)", fontSize: 13 },
  firValue: { color: "#F8FAFC", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  statusText: { color: "#10B981", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  nextStepsCard: { width: "100%", backgroundColor: "#0F1A2E", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16, gap: 12 },
  nextStepsTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  nextStepItem: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#1D4ED8", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  stepNumText: { color: "#FFF", fontSize: 11, fontFamily: "Inter_700Bold" },
  nextStepText: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 20 },
  doneBtn: { width: "100%" },
  doneBtnGrad: { height: 54, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  doneBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});
