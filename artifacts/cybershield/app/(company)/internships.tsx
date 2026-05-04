import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, Platform,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["internships-company"], queryFn: () => apiFetch("/internships"),
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
      Alert.alert("Posted!", "Your internship has been posted successfully.");
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Internships</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Find cyber talent from India's top institutions
        </Text>
        <TouchableOpacity
          style={[styles.postBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowForm(true)}
        >
          <Feather name="plus" size={18} color="#FFF" />
          <Text style={[styles.postBtnText, { fontFamily: "Inter_600SemiBold" }]}>Post Internship</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={data?.internships || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.orgName, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>{item.org_name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: "#10B981" + "20" }]}>
                  <Text style={[styles.statusText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>OPEN</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{item.title}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {item.location_type}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="users" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {item.filled_seats}/{item.total_seats} seats
                  </Text>
                </View>
                {item.stipend_amount && (
                  <Text style={[styles.stipend, { color: "#10B981", fontFamily: "Inter_700Bold" }]}>
                    ₹{item.stipend_amount?.toLocaleString()}/mo
                  </Text>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* Post Form Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Post Internship</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {[
              { label: "Title *", value: title, set: setTitle, placeholder: "Security Analyst Intern" },
              { label: "Description", value: description, set: setDescription, placeholder: "Role description...", multi: true },
              { label: "Requirements", value: requirements, set: setRequirements, placeholder: "Skills required..." },
              { label: "Duration (months)", value: duration, set: setDuration, placeholder: "3", keyboard: "numeric" as any },
              { label: "City", value: locationCity, set: setLocationCity, placeholder: "Bangalore" },
              { label: "Stipend (₹/month)", value: stipend, set: setStipend, placeholder: "20000", keyboard: "numeric" as any },
              { label: "Total Seats", value: seats, set: setSeats, placeholder: "5", keyboard: "numeric" as any },
            ].map(f => (
              <View key={f.label}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{f.label}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }, f.multi ? { minHeight: 70 } : {}]}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  value={f.value}
                  onChangeText={f.set}
                  keyboardType={f.keyboard}
                  multiline={f.multi}
                  textAlignVertical={f.multi ? "top" : "auto"}
                />
              </View>
            ))}

            {/* Location type */}
            <View style={styles.typeRow}>
              {["remote", "onsite", "hybrid"].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, { backgroundColor: locationType === t ? colors.primary : colors.muted, borderColor: locationType === t ? colors.primary : colors.border }]}
                  onPress={() => setLocationType(t)}
                >
                  <Text style={[styles.typeText, { color: locationType === t ? "#FFF" : colors.foreground, fontFamily: "Inter_500Medium" }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={() => { if (!title) { Alert.alert("Error", "Title is required"); return; } postMutation.mutate(); }}
              disabled={postMutation.isPending}
            >
              <Text style={[styles.submitBtnText, { fontFamily: "Inter_600SemiBold" }]}>
                {postMutation.isPending ? "Posting..." : "Post Internship"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, paddingTop: 16 },
  title: { fontSize: 22 },
  subtitle: { fontSize: 13, marginTop: 2, marginBottom: 12 },
  postBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignSelf: "flex-start" },
  postBtnText: { color: "#FFF", fontSize: 14 },
  card: { borderRadius: 16, padding: 14, borderWidth: 1, gap: 8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  orgName: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10 },
  cardTitle: { fontSize: 15 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  stipend: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20, gap: 10, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between" },
  modalTitle: { fontSize: 18 },
  inputLabel: { fontSize: 12, marginBottom: 4 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 46, fontSize: 14, marginBottom: 4 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  typeText: { fontSize: 13 },
  submitBtn: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  submitBtnText: { color: "#FFF", fontSize: 16 },
});
