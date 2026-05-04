import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const THREAT_LEVEL = { level: "HIGH", color: "#F97316", grad: ["#C2410C", "#F97316"] as [string, string] };

const CERT_IN_ALERTS = [
  {
    id: "CIAD-2025-001",
    title: "Critical: Apache Log4Shell Variants Targeting Indian Banks",
    severity: "CRITICAL",
    category: "Vulnerability",
    date: "2025-05-03",
    affected: "Banking Sector",
    color: "#EF4444",
  },
  {
    id: "CIAD-2025-002",
    title: "Phishing Campaign: Fake UIDAI Aadhaar Update Portals",
    severity: "HIGH",
    category: "Phishing",
    date: "2025-05-02",
    affected: "General Public",
    color: "#F97316",
  },
  {
    id: "CIAD-2025-003",
    title: "Ransomware: LockBit 4.0 Targeting Healthcare Infrastructure",
    severity: "HIGH",
    category: "Malware",
    date: "2025-05-01",
    affected: "Healthcare",
    color: "#F97316",
  },
  {
    id: "CIAD-2025-004",
    title: "UPI Fraud: SIM Swap Attacks in Maharashtra & Delhi",
    severity: "MEDIUM",
    category: "Fraud",
    date: "2025-04-30",
    affected: "UPI Users",
    color: "#EAB308",
  },
  {
    id: "CIAD-2025-005",
    title: "Supply Chain Attack: Malicious npm Packages Targeting Devs",
    severity: "MEDIUM",
    category: "Supply Chain",
    date: "2025-04-29",
    affected: "Tech Industry",
    color: "#EAB308",
  },
];

const SUSPICIOUS_IPS = [
  { ip: "185.220.101.45", country: "🇷🇺 Russia", type: "C2 Server", hits: 2341, threat: "Botnet" },
  { ip: "103.242.22.107", country: "🇨🇳 China", type: "Scanner", hits: 1876, threat: "Recon" },
  { ip: "194.165.16.89", country: "🇳🇱 Netherlands", type: "TOR Exit", hits: 987, threat: "Anonymizer" },
  { ip: "45.142.212.33", country: "🇩🇪 Germany", type: "Proxy", hits: 634, threat: "Phishing" },
  { ip: "92.118.234.12", country: "🇺🇦 Ukraine", type: "C2 Server", hits: 421, threat: "Ransomware" },
];

const MALWARE_FAMILIES = [
  { name: "LockBit 4.0", type: "Ransomware", activity: 89, color: "#EF4444" },
  { name: "AgentTesla", type: "Infostealer", activity: 72, color: "#F97316" },
  { name: "Qakbot", type: "Banking Trojan", activity: 58, color: "#EAB308" },
  { name: "AsyncRAT", type: "RAT", activity: 44, color: "#8B5CF6" },
  { name: "RedLine", type: "Stealer", activity: 31, color: "#3B82F6" },
];

const STATE_INCIDENTS = [
  { state: "Maharashtra", count: 3421, pct: 100 },
  { state: "Delhi NCR", count: 2876, pct: 84 },
  { state: "Karnataka", count: 2103, pct: 61 },
  { state: "Telangana", count: 1654, pct: 48 },
  { state: "Tamil Nadu", count: 1287, pct: 38 },
];

export default function IntelligenceScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<"alerts" | "ips" | "malware" | "states">("alerts");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient colors={["#0A1F3A", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Threat Intelligence</Text>
            <Text style={styles.headerSub}>CERT-In · National Cyber Feed · Live</Text>
          </View>
          <View style={styles.threatLevel}>
            <Animated.View style={[styles.threatDot, { backgroundColor: THREAT_LEVEL.color, transform: [{ scale: pulseAnim }] }]} />
            <LinearGradient colors={THREAT_LEVEL.grad} style={styles.threatBadge}>
              <Text style={styles.threatText}>THREAT: {THREAT_LEVEL.level}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Tab Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
          {(["alerts", "ips", "malware", "states"] as const).map(tab => {
            const active = activeTab === tab;
            const labels: Record<string, string> = { alerts: "CERT-In Alerts", ips: "Suspicious IPs", malware: "Malware Tracker", states: "State Incidents" };
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{labels[tab]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "alerts" && (
          <>
            <View style={styles.infoStrip}>
              <MaterialCommunityIcons name="information-outline" size={14} color="#3B82F6" />
              <Text style={styles.infoStripText}>
                Live feed from CERT-In · Indian Computer Emergency Response Team · MeitY
              </Text>
            </View>
            {CERT_IN_ALERTS.map(alert => (
              <View key={alert.id} style={[styles.alertCard, { borderLeftColor: alert.color }]}>
                <LinearGradient colors={[alert.color + "08", "transparent"]} style={StyleSheet.absoluteFill} />
                <View style={styles.alertTop}>
                  <View style={[styles.sevBadge, { backgroundColor: alert.color + "20" }]}>
                    <Text style={[styles.sevText, { color: alert.color }]}>{alert.severity}</Text>
                  </View>
                  <View style={styles.catBadge}>
                    <Text style={styles.catText}>{alert.category}</Text>
                  </View>
                  <Text style={styles.alertDate}>{alert.date}</Text>
                </View>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <View style={styles.alertBottom}>
                  <MaterialCommunityIcons name="target" size={12} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.alertAffected}>Affects: {alert.affected}</Text>
                  <View style={styles.alertIdBadge}>
                    <Text style={styles.alertId}>{alert.id}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === "ips" && (
          <>
            <View style={styles.infoStrip}>
              <MaterialCommunityIcons name="shield-alert-outline" size={14} color="#EF4444" />
              <Text style={styles.infoStripText}>
                Blacklisted IPs targeting Indian infrastructure · Updated every 15 minutes
              </Text>
            </View>
            {SUSPICIOUS_IPS.map(ip => (
              <View key={ip.ip} style={styles.ipCard}>
                <View style={styles.ipLeft}>
                  <Text style={styles.ipAddr}>{ip.ip}</Text>
                  <Text style={styles.ipCountry}>{ip.country}</Text>
                </View>
                <View style={styles.ipRight}>
                  <View style={[styles.ipTypeBadge, { backgroundColor: "rgba(239,68,68,0.12)" }]}>
                    <Text style={[styles.ipTypeText, { color: "#EF4444" }]}>{ip.type}</Text>
                  </View>
                  <Text style={styles.ipHits}>{ip.hits.toLocaleString()} hits</Text>
                </View>
                <View style={[styles.threatTag, { backgroundColor: "rgba(249,115,22,0.15)" }]}>
                  <Text style={styles.threatTagText}>{ip.threat}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === "malware" && (
          <>
            <View style={styles.infoStrip}>
              <MaterialCommunityIcons name="bug-outline" size={14} color="#8B5CF6" />
              <Text style={styles.infoStripText}>
                Active malware families detected in Indian cyberspace this month
              </Text>
            </View>
            {MALWARE_FAMILIES.map(mw => (
              <View key={mw.name} style={styles.malwareCard}>
                <View style={styles.malwareTop}>
                  <View>
                    <Text style={styles.malwareName}>{mw.name}</Text>
                    <Text style={styles.malwareType}>{mw.type}</Text>
                  </View>
                  <Text style={[styles.malwareActivity, { color: mw.color }]}>{mw.activity}%</Text>
                </View>
                <View style={styles.barBg}>
                  <LinearGradient
                    colors={[mw.color, mw.color + "80"]}
                    style={[styles.barFill, { width: `${mw.activity}%` as any }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.malwareLabel}>Activity Index (last 30 days)</Text>
              </View>
            ))}
          </>
        )}

        {activeTab === "states" && (
          <>
            <View style={styles.infoStrip}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color="#10B981" />
              <Text style={styles.infoStripText}>
                State-wise cybercrime incidents reported · Source: NCRB 2025
              </Text>
            </View>
            {STATE_INCIDENTS.map((state, i) => (
              <View key={state.state} style={styles.stateCard}>
                <View style={styles.stateTop}>
                  <View style={styles.stateRank}>
                    <Text style={styles.stateRankNum}>#{i + 1}</Text>
                  </View>
                  <Text style={styles.stateName}>{state.state}</Text>
                  <Text style={styles.stateCount}>{state.count.toLocaleString()} incidents</Text>
                </View>
                <View style={styles.barBg}>
                  <LinearGradient
                    colors={["#1D4ED8", "#3B82F6"]}
                    style={[styles.barFill, { width: `${state.pct}%` as any }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>
            ))}
            <View style={styles.sourceCard}>
              <MaterialCommunityIcons name="file-document-outline" size={14} color="rgba(255,255,255,0.3)" />
              <Text style={styles.sourceText}>
                Data from National Crime Records Bureau (NCRB) · Ministry of Home Affairs
              </Text>
            </View>
          </>
        )}
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { color: "#F8FAFC", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
  threatLevel: { flexDirection: "row", alignItems: "center", gap: 8 },
  threatDot: { width: 10, height: 10, borderRadius: 5 },
  threatBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  threatText: { color: "#FFF", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  tabActive: { backgroundColor: "rgba(252,211,77,0.15)", borderColor: "#FCD34D" },
  tabText: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_500Medium" },
  tabTextActive: { color: "#FCD34D" },
  infoStrip: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  infoStripText: { flex: 1, color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  alertCard: { backgroundColor: "#0F1A2E", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 4, gap: 8, overflow: "hidden" },
  alertTop: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.06)" },
  catText: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "Inter_500Medium" },
  alertDate: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Inter_400Regular", marginLeft: "auto" },
  alertTitle: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  alertBottom: { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  alertAffected: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  alertIdBadge: { backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  alertId: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Inter_400Regular" },
  ipCard: { backgroundColor: "#0F1A2E", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  ipLeft: { flex: 1, gap: 2 },
  ipAddr: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  ipCountry: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular" },
  ipRight: { alignItems: "flex-end", gap: 4 },
  ipTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ipTypeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  ipHits: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular" },
  threatTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  threatTagText: { color: "#F97316", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  malwareCard: { backgroundColor: "#0F1A2E", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 10 },
  malwareTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  malwareName: { color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  malwareType: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  malwareActivity: { fontSize: 22, fontFamily: "Inter_700Bold" },
  barBg: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  malwareLabel: { color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "Inter_400Regular" },
  stateCard: { backgroundColor: "#0F1A2E", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 10 },
  stateTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  stateRank: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(59,130,246,0.15)", alignItems: "center", justifyContent: "center" },
  stateRankNum: { color: "#3B82F6", fontSize: 12, fontFamily: "Inter_700Bold" },
  stateName: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  stateCount: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular" },
  sourceCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 10 },
  sourceText: { flex: 1, color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
});
