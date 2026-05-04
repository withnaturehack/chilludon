import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Alert, TextInput, Modal } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

const TX_ICONS: Record<string, string> = {
  credit: "arrow-down-circle", withdrawal: "arrow-up-circle", bonus: "star", penalty: "alert-circle",
};
const TX_COLORS: Record<string, string> = {
  credit: "#10B981", withdrawal: "#EF4444", bonus: "#F59E0B", penalty: "#EF4444",
};

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const qc = useQueryClient();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["wallet"], queryFn: () => apiFetch("/wallet"),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => apiFetch("/wallet/withdraw", { method: "POST", body: JSON.stringify({ amount: Number(amount), upi_id: upiId }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      setShowWithdraw(false); setAmount(""); setUpiId("");
      Alert.alert("Withdrawal Requested", `₹${amount} will be transferred to ${upiId} within 2-3 business days.`);
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={[styles.balanceLabel, { fontFamily: "Inter_400Regular" }]}>Available Balance</Text>
        <Text style={[styles.balance, { fontFamily: "Inter_700Bold" }]}>₹{(data?.balance || 0).toLocaleString("en-IN")}</Text>
        <Text style={[styles.earned, { fontFamily: "Inter_400Regular" }]}>Total earned: ₹{(data?.total_earned || 0).toLocaleString("en-IN")}</Text>
        <TouchableOpacity
          style={[styles.withdrawBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]}
          onPress={() => setShowWithdraw(true)}
        >
          <MaterialCommunityIcons name="bank-transfer" size={18} color="#FFF" />
          <Text style={[styles.withdrawBtnText, { fontFamily: "Inter_600SemiBold" }]}>Withdraw via UPI</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={data?.transactions || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListHeaderComponent={
            <Text style={[styles.txTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Transaction History</Text>
          }
          renderItem={({ item }) => {
            const txColor = TX_COLORS[item.type] || colors.mutedForeground;
            const isCredit = item.amount > 0;
            return (
              <View style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.txIcon, { backgroundColor: txColor + "20" }]}>
                  <Feather name={(TX_ICONS[item.type] || "circle") as any} size={20} color={txColor} />
                </View>
                <View style={styles.txContent}>
                  <Text style={[styles.txDesc, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                    {item.description || item.type}
                  </Text>
                  <Text style={[styles.txDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </Text>
                </View>
                <Text style={[styles.txAmount, { color: isCredit ? "#10B981" : "#EF4444", fontFamily: "Inter_700Bold" }]}>
                  {isCredit ? "+" : ""}₹{Math.abs(item.amount).toLocaleString("en-IN")}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="wallet-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>No transactions yet</Text>
            </View>
          }
        />
      )}

      {/* Withdraw modal */}
      <Modal visible={showWithdraw} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => setShowWithdraw(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalBalance, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Available: ₹{(data?.balance || 0).toLocaleString("en-IN")}
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="Amount (₹)"
              placeholderTextColor={colors.mutedForeground}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="UPI ID (e.g., name@upi)"
              placeholderTextColor={colors.mutedForeground}
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={() => { if (!amount || !upiId) { Alert.alert("Error", "Fill all fields"); return; } withdrawMutation.mutate(); }}
              disabled={withdrawMutation.isPending}
            >
              <Text style={[styles.confirmBtnText, { fontFamily: "Inter_600SemiBold" }]}>
                {withdrawMutation.isPending ? "Processing..." : "Confirm Withdrawal"}
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
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  balance: { color: "#FFF", fontSize: 40, marginTop: 4 },
  earned: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4, marginBottom: 16 },
  withdrawBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, alignSelf: "flex-start" },
  withdrawBtnText: { color: "#FFF", fontSize: 14 },
  txTitle: { fontSize: 16, marginBottom: 4 },
  txCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  txIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txContent: { flex: 1 },
  txDesc: { fontSize: 14 },
  txDate: { fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 16 },
  empty: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24, gap: 14 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 18 },
  modalBalance: { fontSize: 13 },
  modalInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 50, fontSize: 15 },
  confirmBtn: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  confirmBtnText: { color: "#FFF", fontSize: 16 },
});
