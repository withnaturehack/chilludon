import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, Platform, ScrollView, Animated,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

export default function CompanyInternshipsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [duration, setDuration] = useState("");
  const [locationType, setLocationType] = useState("remote");
  const [locationCity, setLocationCity] = useState("");
  const [stipend, setStipend] = useState("");
  const [seats, setSeats] = useState("5");
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["internships-company"],
    queryFn: () => apiFetch("/internships"),
  });

  const postMutation = useMutation({
    mutationFn: () => apiFetch("/companies/post-internship", {
      method: "POST",
      body: JSON.stringify({
        title, description, requirements,
        duration_months: Number(duration),
        location_type: locationType, location_city: locationCity,
        stipend_amount: Number(stipend),
        total_seats: Number(seats),
      }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["internships-company"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowForm(false);
      setTitle(""); setDescription(""); setRequirements(""); setDuration(""); setLocationCity(""); setStipend(""); setSeats("5");
      Alert.alert("🎉 Posted!", "Your internship is now live on CyberShield India.");
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  const LOC_TYPES = [
    { value: "remote", label: "Remote", icon: "wifi" },
    { value: "onsite", label: "Onsite", icon: "map-pin" },
    { value: "hybrid", label: "Hybrid", icon: "layers" },
  ];

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0A1A30", "#112244", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Internships</Text>
            <Text style={styles.headerSub}>Find India's best cyber talent</Text>
          </View>
          <TouchableOpacity onPress={() => setShowForm(true)} activeOpacity={0.85}>
            <LinearGradient colors={["#059669", "#10B981"]} style={styles.postBtn}>
              <Feather name="plus" size={18} color="#FFF" />
              <Text style={styles.postBtnText}>Post New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          style={{ opacity: fadeAnim }}
          data={data?.internships || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <LinearGradient colors={["rgba(16,185,129,0.05)", "transparent"]} style={StyleSheet.absoluteFill} />
              <View style={styles.cardTop}>
                <Text style={styles.orgName}>{item.org_name}</Text>
                <View style={styles.openBadge}>
                  <View style={styles.openDot} />
                  <Text style={styles.openText}>OPEN</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Feather name="map-pin" size={12} color="rgba(255,255,255,0.35)" />
                  <Text style={styles.metaText}>{item.location_type}</Text>
                </View>
                {item.duration_months && (
                  <View style={styles.metaItem}>
                    <Feather name="clock" size={12} color="rgba(255,255,255,0.35)" />
                    <Text style={styles.metaText}>{item.duration_months} months</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Feather name="users" size={12} color="rgba(255,255,255,0.35)" />
                  <Text style={styles.metaText}>{item.filled_seats}/{item.total_seats} seats</Text>
                </View>
                {item.stipend_amount && (
                  <Text style={styles.stipend}>₹{item.stipend_amount?.toLocaleString("en-IN")}/mo</Text>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 16 }}>
              <Feather name="briefcase" size={64} color="rgba(255,255,255,0.06)" />
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontFamily: "Inter_400Regular" }}>No internships posted</Text>
              <TouchableOpacity onPress={() => setShowForm(true)} activeOpacity={0.85}>
                <LinearGradient colors={["#059669", "#10B981"]} style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 }}>
                  <Text style={{ color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" }}>Post First Internship</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Post Form Modal */}
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowForm(false)} />
        <View style={styles.modal}>
          <LinearGradient colors={["#0F1A2E", "#0B1120"]} style={{ flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" }}>
            <LinearGradient colors={["rgba(16,185,129,0.1)", "transparent"]} style={{ padding: 20, paddingBottom: 14 }}>
              <View style={styles.modalHdr}>
                <Text style={styles.modalTitle}>Post Internship</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowForm(false)}>
                  <Feather name="x" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} showsVerticalScrollIndicator={false}>
              {[
                { label: "Job Title *", value: title, set: setTitle, placeholder: "Security Analyst Intern", key: "num" },
                { label: "Description", value: description, set: setDescription, placeholder: "Role description and responsibilities...", multi: true, key: "none" },
                { label: "Requirements", value: requirements, set: setRequirements, placeholder: "Required skills (e.g., Python, Kali Linux)", key: "none" },
                { label: "Duration (months)", value: duration, set: setDuration, placeholder: "3", kb: "numeric" as any, key: "none" },
                { label: "City", value: locationCity, set: setLocationCity, placeholder: "Bangalore, Mumbai...", key: "none" },
                { label: "Monthly Stipend (₹)", value: stipend, set: setStipend, placeholder: "20000", kb: "numeric" as any, key: "none" },
                { label: "Total Seats", value: seats, set: setSeats, placeholder: "5", kb: "numeric" as any, key: "none" },
              ].map(f => (
                <View key={f.label}>
                  <Text style={styles.inputLabel}>{f.label}</Text>
                  <TextInput
                    style={[styles.inputField, (f as any).multi && { minHeight: 70, textAlignVertical: "top" }]}
                    placeholder={f.placeholder}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={f.value}
                    onChangeText={f.set}
                    keyboardType={(f as any).kb}
                    multiline={(f as any).multi}
                  />
                </View>
              ))}

              {/* Location Type */}
              <View>
                <Text style={styles.inputLabel}>Location Type</Text>
                <View style={styles.locTypeRow}>
                  {LOC_TYPES.map(lt => (
                    <TouchableOpacity
                      key={lt.value}
                      style={[styles.locTypeBtn, locationType === lt.value && styles.locTypeBtnActive]}
                      onPress={() => { setLocationType(lt.value); Haptics.selectionAsync(); }}
                      activeOpacity={0.75}
                    >
                      {locationType === lt.value && <LinearGradient colors={["#059669", "#10B981"]} style={StyleSheet.absoluteFill} />}
                      <Feather name={lt.icon as any} size={14} color={locationType === lt.value ? "#FFF" : "rgba(255,255,255,0.4)"} />
                      <Text style={[styles.locTypeBtnText, locationType === lt.value && { color: "#FFF" }]}>{lt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (!title.trim()) { Alert.alert("Error", "Title is required"); return; }
                  postMutation.mutate();
                }}
                disabled={postMutation.isPending}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={postMutation.isPending ? ["#334155", "#334155"] : ["#059669", "#10B981"]}
                  style={styles.submitBtn}
                >
                  <Feather name="send" size={18} color="#FFF" />
                  <Text style={styles.submitBtnText}>
                    {postMutation.isPending ? "Posting..." : "Post Internship"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  postBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 14 },
  postBtnText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  card: { backgroundColor: "#0F1A2E", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 10, overflow: "hidden" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orgName: { color: "#06B6D4", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  openBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  openText: { color: "#10B981", fontSize: 10, fontFamily: "Inter_700Bold" },
  cardTitle: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_700Bold" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular" },
  stipend: { color: "#10B981", fontSize: 14, fontFamily: "Inter_700Bold" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  modal: { maxHeight: "90%", backgroundColor: "#0F1A2E", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHdr: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { color: "#F8FAFC", fontSize: 20, fontFamily: "Inter_700Bold" },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  inputLabel: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  inputField: { backgroundColor: "#1E293B", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, paddingVertical: 12, color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_400Regular" },
  locTypeRow: { flexDirection: "row", gap: 10 },
  locTypeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)", overflow: "hidden" },
  locTypeBtnActive: { borderColor: "#10B981" },
  locTypeBtnText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Inter_500Medium" },
  submitBtn: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  submitBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
