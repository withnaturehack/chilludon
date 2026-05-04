import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Platform, Alert, TextInput, Modal, Animated,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["wallet"], queryFn: () => apiFetch("/wallet"),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => apiFetch("/wallet/withdraw", { method: "POST", body: JSON.stringify({ amount: Number(amount), upi_id: upiId }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setShowWithdraw(false); setAmount(""); setUpiId("");
      Alert.alert("Withdrawal Requested! 🎉", `₹${amount} will be transferred to ${upiId} within 2-3 business days.`);
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient colors={["#0A2440", "#1A4A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.decorCircle} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.balanceSection}>
          <MaterialCommunityIcons name="wallet" size={24} color="rgba(255,255,255,0.6)" />
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balance}>
            ₹{(data?.balance || 0).toLocaleString("en-IN")}
          </Text>
          <View style={styles.earnedRow}>
            <Feather name="trending-up" size={14} color="#10B981" />
            <Text style={styles.earnedText}>Total earned: ₹{(data?.total_earned || 0).toLocaleString("en-IN")}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => setShowWithdraw(true)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.08)"]} style={styles.withdrawBtnInner}>
            <MaterialCommunityIcons name="bank-transfer" size={18} color="#FFF" />
            <Text style={styles.withdrawBtnText}>Withdraw via UPI</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          style={{ opacity: fadeAnim }}
          data={data?.transactions || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListHeaderComponent={
            <View style={styles.txHeader}>
              <Text style={styles.txTitle}>Transaction History</Text>
              <Text style={styles.txSub}>{data?.transactions?.length || 0} transactions</Text>
            </View>
          }
          renderItem={({ item }) => {
            const txColor = TX_COLORS[item.type] || "rgba(255,255,255,0.4)";
            const isCredit = item.amount > 0;
            return (
              <View style={styles.txCard}>
                <View style={[styles.txIcon, { backgroundColor: txColor + "20" }]}>
                  <Feather
                    name={isCredit ? "arrow-down-left" : "arrow-up-right"}
                    size={20}
                    color={txColor}
                  />
                </View>
                <View style={styles.txContent}>
                  <Text style={styles.txDesc} numberOfLines={1}>{item.description || item.type}</Text>
                  <Text style={styles.txDate}>
                    {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    {item.status ? ` · ${item.status}` : ""}
                  </Text>
                </View>
                <View style={styles.txAmountWrap}>
                  <Text style={[styles.txAmount, { color: isCredit ? "#10B981" : "#EF4444" }]}>
                    {isCredit ? "+" : ""}₹{Math.abs(item.amount).toLocaleString("en-IN")}
                  </Text>
                  {item.balance_after !== null && (
                    <Text style={styles.txBalance}>bal: ₹{item.balance_after?.toLocaleString("en-IN")}</Text>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <LinearGradient colors={["rgba(59,130,246,0.15)", "rgba(6,182,212,0.08)"]} style={styles.emptyIcon}>
                <MaterialCommunityIcons name="wallet-outline" size={40} color="#3B82F6" />
              </LinearGradient>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubText}>Start submitting reports to earn points and rewards!</Text>
            </View>
          }
        />
      )}

      {/* Withdraw Modal */}
      <Modal visible={showWithdraw} transparent animationType="slide" onRequestClose={() => setShowWithdraw(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowWithdraw(false)} />
        <View style={styles.modal}>
          <LinearGradient colors={["#0F1A2E", "#0B1120"]} style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" }}>
            <LinearGradient colors={["rgba(59,130,246,0.1)", "transparent"]} style={{ padding: 24, paddingBottom: 16 }}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Withdraw Funds</Text>
                  <Text style={styles.modalSub}>Available: ₹{(data?.balance || 0).toLocaleString("en-IN")}</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowWithdraw(false)}>
                  <Feather name="x" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            <View style={{ padding: 20, gap: 14 }}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>₹</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Amount"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="bank" size={18} color="rgba(255,255,255,0.4)" />
                <TextInput
                  style={styles.modalInput}
                  placeholder="UPI ID (e.g., name@upi)"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (!amount || !upiId) { Alert.alert("Error", "Fill all fields"); return; }
                  if (Number(amount) > (data?.balance || 0)) { Alert.alert("Error", "Insufficient balance"); return; }
                  withdrawMutation.mutate();
                }}
                disabled={withdrawMutation.isPending}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={withdrawMutation.isPending ? ["#334155", "#334155"] : ["#059669", "#10B981"]}
                  style={styles.confirmBtn}
                >
                  <MaterialCommunityIcons name="bank-transfer" size={18} color="#FFF" />
                  <Text style={styles.confirmBtnText}>
                    {withdrawMutation.isPending ? "Processing..." : "Confirm Withdrawal"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.withdrawNote}>
                Transfers processed within 2-3 business days via UPI
              </Text>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28, overflow: "hidden" },
  decorCircle: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(59,130,246,0.06)", top: -80, right: -40 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  balanceSection: { alignItems: "center", gap: 6, marginBottom: 20 },
  balanceLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_400Regular" },
  balance: { color: "#FFF", fontSize: 44, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  earnedRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  earnedText: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_400Regular" },
  withdrawBtn: { borderRadius: 14, overflow: "hidden" },
  withdrawBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  withdrawBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  txHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  txTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  txSub: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Inter_400Regular" },
  txCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  txIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txContent: { flex: 1 },
  txDesc: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_500Medium" },
  txDate: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
  txAmountWrap: { alignItems: "flex-end" },
  txAmount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  txBalance: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 48, gap: 14 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptySubText: { color: "rgba(255,255,255,0.35)", fontSize: 13, textAlign: "center", fontFamily: "Inter_400Regular" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  modal: { backgroundColor: "#0F1A2E", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { color: "#F8FAFC", fontSize: 20, fontFamily: "Inter_700Bold" },
  modalSub: { color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 3 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#1E293B", borderRadius: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 16, height: 52 },
  inputLabel: { color: "rgba(255,255,255,0.6)", fontSize: 18, fontFamily: "Inter_700Bold" },
  modalInput: { flex: 1, color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_400Regular" },
  confirmBtn: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  confirmBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  withdrawNote: { color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", fontFamily: "Inter_400Regular" },
});
