import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Animated, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const INDIA_HOTSPOTS = [
  { state: "Maharashtra", city: "Mumbai", reports: 142, color: "#EF4444" },
  { state: "Delhi", city: "New Delhi", reports: 128, color: "#EF4444" },
  { state: "Karnataka", city: "Bangalore", reports: 98, color: "#F97316" },
  { state: "Tamil Nadu", city: "Chennai", reports: 89, color: "#F97316" },
  { state: "Telangana", city: "Hyderabad", reports: 87, color: "#F97316" },
  { state: "West Bengal", city: "Kolkata", reports: 76, color: "#EAB308" },
  { state: "Uttar Pradesh", city: "Lucknow", reports: 65, color: "#EAB308" },
  { state: "Gujarat", city: "Ahmedabad", reports: 54, color: "#EAB308" },
  { state: "Rajasthan", city: "Jaipur", reports: 43, color: "#84CC16" },
  { state: "Punjab", city: "Chandigarh", reports: 38, color: "#84CC16" },
  { state: "Kerala", city: "Thiruvananthapuram", reports: 31, color: "#84CC16" },
  { state: "Madhya Pradesh", city: "Bhopal", reports: 27, color: "#60A5FA" },
];

const MAX_REPORTS = 142;

const NEARBY_REPORTS = [
  { id: "R-4521", type: "UPI Fraud", area: "Connaught Place, Delhi", time: "12 min ago", severity: "high" },
  { id: "R-4520", type: "Phishing SMS", area: "Karol Bagh, Delhi", time: "28 min ago", severity: "medium" },
  { id: "R-4519", type: "Identity Theft", area: "Dwarka, Delhi", time: "1hr ago", severity: "high" },
  { id: "R-4518", type: "OTP Fraud", area: "Rohini, Delhi", time: "2hr ago", severity: "medium" },
];

const SEV_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#84CC16",
};

export default function PoliceLocation() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isWeb = Platform.OS === "web";
  const topPad = insets.top + (isWeb ? 16 : 0);

  const [onDuty, setOnDuty] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<{ city?: string; region?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [watcher, setWatcher] = useState<Location.LocationSubscription | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
    return () => { watcher?.remove(); };
  }, []);

  useEffect(() => {
    if (onDuty) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.6, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      const radar = Animated.loop(
        Animated.timing(radarAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
      );
      pulse.start();
      radar.start();
      return () => { pulse.stop(); radar.stop(); };
    } else {
      pulseAnim.setValue(1);
      radarAnim.setValue(0);
    }
  }, [onDuty]);

  async function toggleOnDuty() {
    if (onDuty) {
      watcher?.remove();
      setWatcher(null);
      setOnDuty(false);
      setLocation(null);
      setAddress(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Enable location access to go on duty. This allows the system to match you with nearby crime reports.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);

      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        setAddress(geo);
      } catch {}

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 20 },
        (newLoc) => setLocation(newLoc)
      );
      setWatcher(sub);
      setOnDuty(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Error", "Could not get location. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const radarRotate = radarAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <LinearGradient colors={["#0A1F3A", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons name="map-marker-radius" size={13} color="#10B981" />
          <Text style={styles.headerBadgeText}>Live Location Tracking</Text>
        </View>
        <Text style={styles.headerTitle}>Field Map</Text>
        <Text style={styles.headerSub}>Real-time location & nearby crime reports</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.locationCenter}>
            <View style={styles.locationVisual}>
              {onDuty && (
                <>
                  <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.6], outputRange: [0.4, 0] }) }]} />
                  <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.6], outputRange: [0.25, 0] }) }]} />
                  <Animated.View style={[styles.radarLine, { transform: [{ rotate: radarRotate }] }]} />
                </>
              )}
              <LinearGradient
                colors={onDuty ? ["#059669", "#10B981"] : ["#1D4ED8", "#3B82F6"]}
                style={styles.locationDot}
              >
                <MaterialCommunityIcons name={onDuty ? "map-marker-check" : "map-marker"} size={28} color="#FFF" />
              </LinearGradient>
            </View>

            <View style={styles.dutyStatus}>
              <View style={[styles.dutyDot, { backgroundColor: onDuty ? "#10B981" : "#6B7280" }]} />
              <Text style={[styles.dutyText, { color: onDuty ? "#10B981" : "#6B7280" }]}>
                {onDuty ? "ON DUTY — Tracking Active" : "OFF DUTY — Location Paused"}
              </Text>
            </View>

            {location ? (
              <View style={styles.coordsCard}>
                <LinearGradient colors={["rgba(16,185,129,0.12)", "rgba(16,185,129,0.04)"]} style={StyleSheet.absoluteFill} />
                <View style={styles.coordRow}>
                  <MaterialCommunityIcons name="latitude" size={16} color="#10B981" />
                  <Text style={styles.coordLabel}>Latitude</Text>
                  <Text style={styles.coordValue}>{location.coords.latitude.toFixed(5)}°</Text>
                </View>
                <View style={styles.coordDivider} />
                <View style={styles.coordRow}>
                  <MaterialCommunityIcons name="longitude" size={16} color="#10B981" />
                  <Text style={styles.coordLabel}>Longitude</Text>
                  <Text style={styles.coordValue}>{location.coords.longitude.toFixed(5)}°</Text>
                </View>
                <View style={styles.coordDivider} />
                <View style={styles.coordRow}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#06B6D4" />
                  <Text style={styles.coordLabel}>Accuracy</Text>
                  <Text style={styles.coordValue}>±{Math.round(location.coords.accuracy || 0)}m</Text>
                </View>
                {address && (
                  <>
                    <View style={styles.coordDivider} />
                    <View style={styles.coordRow}>
                      <MaterialCommunityIcons name="map-marker" size={16} color="#FCD34D" />
                      <Text style={styles.coordLabel}>Location</Text>
                      <Text style={styles.coordValue} numberOfLines={1}>
                        {[address.city, address.region].filter(Boolean).join(", ")}
                      </Text>
                    </View>
                  </>
                )}
                <Text style={styles.lastUpdated}>
                  Last updated: {new Date(location.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </Text>
              </View>
            ) : (
              <View style={styles.noLocationCard}>
                <MaterialCommunityIcons name="map-marker-off" size={32} color="rgba(255,255,255,0.2)" />
                <Text style={styles.noLocationText}>Go on duty to start location tracking</Text>
                <Text style={styles.noLocationSub}>Your position will be used to match you with nearby crime reports in real-time</Text>
              </View>
            )}

            <TouchableOpacity onPress={toggleOnDuty} disabled={loading} activeOpacity={0.85} style={{ width: "100%", marginTop: 4 }}>
              <LinearGradient
                colors={loading ? ["#334155", "#334155"] : onDuty ? ["#DC2626", "#EF4444"] : ["#059669", "#10B981"]}
                style={styles.dutyBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name={onDuty ? "stop-circle" : "play-circle"} size={22} color="#FFF" />
                    <Text style={styles.dutyBtnText}>{onDuty ? "Go Off Duty" : "Go On Duty"}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="fire" size={16} color="#EF4444" />
              <Text style={styles.sectionTitle}>India Crime Heatmap</Text>
            </View>
            <Text style={styles.sectionSub}>Active reports by state</Text>
          </View>
          <View style={styles.heatmapCard}>
            <LinearGradient colors={["rgba(59,130,246,0.06)", "transparent"]} style={StyleSheet.absoluteFill} />
            {INDIA_HOTSPOTS.map((spot, i) => {
              const barWidth = (spot.reports / MAX_REPORTS) * 100;
              return (
                <View key={spot.state} style={styles.hotspotRow}>
                  <Text style={styles.hotspotRank} numberOfLines={1}>{i + 1}</Text>
                  <Text style={styles.hotspotState} numberOfLines={1}>{spot.state}</Text>
                  <View style={styles.hotspotBar}>
                    <Animated.View style={[styles.hotspotFill, { width: `${barWidth}%`, backgroundColor: spot.color }]} />
                  </View>
                  <Text style={[styles.hotspotCount, { color: spot.color }]}>{spot.reports}</Text>
                </View>
              );
            })}
          </View>

          <View style={[styles.sectionHeader, { marginTop: 8 }]}>
            <View style={styles.sectionTitleRow}>
              <Animated.View style={[styles.nearbyDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.sectionTitle}>
                Nearby Reports {address?.region ? `(${address.region})` : onDuty ? "(Your Area)" : ""}
              </Text>
            </View>
          </View>
          {NEARBY_REPORTS.map((r) => {
            const sc = SEV_COLORS[r.severity] || "#666";
            return (
              <View key={r.id} style={[styles.nearbyCard, { borderLeftColor: sc }]}>
                <LinearGradient colors={[sc + "08", "transparent"]} style={StyleSheet.absoluteFill} />
                <View style={{ flex: 1, gap: 5 }}>
                  <View style={styles.nearbyTop}>
                    <Text style={[styles.nearbyId, { color: sc }]}>{r.id}</Text>
                    <View style={[styles.nearbyBadge, { backgroundColor: sc + "20" }]}>
                      <Text style={[styles.nearbyBadgeText, { color: sc }]}>{r.severity}</Text>
                    </View>
                  </View>
                  <Text style={styles.nearbyType}>{r.type}</Text>
                  <View style={styles.nearbyFooter}>
                    <MaterialCommunityIcons name="map-marker" size={12} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.nearbyArea}>{r.area}</Text>
                    <Text style={styles.nearbyTime}>{r.time}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.respondBtn} activeOpacity={0.8}>
                  <Text style={styles.respondBtnText}>Respond</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, overflow: "hidden" },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16,185,129,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start", marginBottom: 8 },
  headerBadgeText: { color: "#10B981", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  headerTitle: { color: "#F8FAFC", fontSize: 26, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  locationCenter: { padding: 20, alignItems: "center", gap: 14 },
  locationVisual: { width: 120, height: 120, alignItems: "center", justifyContent: "center", position: "relative" },
  ring: { position: "absolute", borderRadius: 999, borderWidth: 2, borderColor: "#10B981" },
  ring1: { width: 100, height: 100 },
  ring2: { width: 130, height: 130 },
  radarLine: { position: "absolute", width: 60, height: 2, backgroundColor: "rgba(16,185,129,0.4)", left: "50%", top: "50%", transformOrigin: "left center" },
  locationDot: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  dutyStatus: { flexDirection: "row", alignItems: "center", gap: 6 },
  dutyDot: { width: 8, height: 8, borderRadius: 4 },
  dutyText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  coordsCard: { width: "100%", borderRadius: 16, borderWidth: 1, borderColor: "rgba(16,185,129,0.25)", padding: 14, gap: 0, overflow: "hidden" },
  coordRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  coordDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  coordLabel: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  coordValue: { color: "#F8FAFC", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  lastUpdated: { color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 4 },
  noLocationCard: { width: "100%", alignItems: "center", gap: 8, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", backgroundColor: "#0F1A2E" },
  noLocationText: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  noLocationSub: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  dutyBtn: { height: 54, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  dutyBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 10 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { color: "#F8FAFC", fontSize: 16, fontFamily: "Inter_700Bold" },
  sectionSub: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_400Regular" },
  nearbyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },
  heatmapCard: { marginHorizontal: 16, borderRadius: 18, padding: 16, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 8, overflow: "hidden" },
  hotspotRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 5 },
  hotspotRank: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_700Bold", width: 18, textAlign: "center" },
  hotspotState: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular", width: 100 },
  hotspotBar: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" },
  hotspotFill: { height: 6, borderRadius: 3 },
  hotspotCount: { fontSize: 12, fontFamily: "Inter_700Bold", width: 32, textAlign: "right" },
  nearbyCard: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderLeftWidth: 3, overflow: "hidden" },
  nearbyTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  nearbyId: { fontSize: 11, fontFamily: "Inter_700Bold" },
  nearbyBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  nearbyBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  nearbyType: { color: "#F8FAFC", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nearbyFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  nearbyArea: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  nearbyTime: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Inter_400Regular" },
  respondBtn: { backgroundColor: "rgba(252,211,77,0.12)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(252,211,77,0.25)" },
  respondBtnText: { color: "#FCD34D", fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
