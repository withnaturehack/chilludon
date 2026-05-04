import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const QUICK_PROMPTS = [
  "How do I start bug bounty?",
  "What is SQL injection?",
  "Explain XSS vulnerability",
  "Best tools for OSINT?",
  "How to get better rank?",
  "Explain OWASP Top 10",
];

export default function RakshBotScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useApi();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const flatRef = useRef<FlatList>(null);
  const isWeb = Platform.OS === "web";
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { data, isLoading } = useQuery({
    queryKey: ["rakshbot-history"],
    queryFn: () => apiFetch("/rakshbot/history?limit=50"),
  });

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const allMessages: Message[] = [...(data?.messages || []), ...localMessages];

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);
    Haptics.selectionAsync();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      created_at: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, userMsg]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await apiFetch("/rakshbot/chat", {
        method: "POST",
        body: JSON.stringify({ message: msg }),
      });
      const botMsg: Message = {
        id: res.message_id || (Date.now() + 1).toString(),
        role: "assistant",
        content: res.response,
        created_at: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, botMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setLocalMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Yaar, kuch problem aa gayi. Network check karo aur phir try karo! 🙏",
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  const topPad = insets.top + (isWeb ? 16 : 0);

  const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isBot = item.role === "assistant";
    return (
      <View style={[styles.msgRow, isBot ? styles.botRow : styles.userRow]}>
        {isBot && (
          <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.botAvatar}>
            <MaterialCommunityIcons name="robot" size={14} color="#FFF" />
          </LinearGradient>
        )}
        <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
          {isBot && <LinearGradient colors={["rgba(59,130,246,0.08)", "rgba(6,182,212,0.05)"]} style={StyleSheet.absoluteFill} />}
          {isBot && !item.content && <ActivityIndicator size="small" color="#3B82F6" />}
          <Text style={[styles.bubbleText, { color: isBot ? "#F8FAFC" : "#FFF" }]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, { color: isBot ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.55)" }]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  }, []);

  return (
    <LinearGradient colors={["#060D1A", "#0B1120"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <LinearGradient colors={["#0F2040", "#1A3A6B", "#0B1120"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View style={styles.headerContent}>
            <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.botIconBg}>
              <MaterialCommunityIcons name="robot" size={22} color="#FFF" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.botName}>RakshBot</Text>
              <View style={styles.onlineRow}>
                <Animated.View style={[styles.onlineDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.onlineText}>AI Mentor · Powered by Claude AI</Text>
              </View>
            </View>
            <View style={styles.headerBadge}>
              <MaterialCommunityIcons name="brain" size={14} color="#06B6D4" />
              <Text style={styles.headerBadgeText}>AI</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Messages */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#3B82F6" size="large" />
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 12 }}>
              Loading conversation...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={allMessages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={[styles.messageList, { paddingBottom: 12 }]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <LinearGradient colors={["#1D4ED830", "#3B82F620"]} style={styles.emptyIcon}>
                  <MaterialCommunityIcons name="robot-outline" size={48} color="#3B82F6" />
                </LinearGradient>
                <Text style={styles.emptyTitle}>Namaste! Main RakshBot hun 🙏</Text>
                <Text style={styles.emptySubtitle}>
                  Your personal AI cybersecurity mentor powered by Claude AI. Ask me anything in Hindi, English, or Hinglish!
                </Text>
              </View>
            }
            ListFooterComponent={sending ? (
              <View style={[styles.msgRow, styles.botRow]}>
                <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.botAvatar}>
                  <MaterialCommunityIcons name="robot" size={14} color="#FFF" />
                </LinearGradient>
                <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                  <View style={styles.typingDots}>
                    {[0, 1, 2].map(i => (
                      <View key={i} style={styles.typingDot} />
                    ))}
                  </View>
                </View>
              </View>
            ) : null}
          />
        )}

        {/* Quick Prompts */}
        {allMessages.length === 0 && !isLoading && (
          <View style={styles.quickPromptsContainer}>
            <FlatList
              horizontal
              data={QUICK_PROMPTS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.quickPrompt}
                  onPress={() => sendMessage(item)}
                  activeOpacity={0.7}
                >
                  <Feather name="zap" size={12} color="#06B6D4" />
                  <Text style={styles.quickPromptText}>{item}</Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            />
          </View>
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="robot-outline" size={20} color="rgba(255,255,255,0.3)" />
            <TextInput
              style={styles.textInput}
              placeholder="Ask RakshBot anything..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { opacity: input.trim() && !sending ? 1 : 0.4 }]}
              onPress={() => sendMessage()}
              disabled={!input.trim() || sending}
              activeOpacity={0.8}
            >
              <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.sendBtnGrad}>
                <Feather name="send" size={16} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  botIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  botName: { color: "#FFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#10B981" },
  onlineText: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "Inter_400Regular" },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(6,182,212,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  headerBadgeText: { color: "#06B6D4", fontSize: 11, fontFamily: "Inter_700Bold" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  messageList: { padding: 16, gap: 12 },
  msgRow: { flexDirection: "row", gap: 8, maxWidth: "100%" },
  botRow: { alignItems: "flex-start" },
  userRow: { justifyContent: "flex-end" },
  botAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  bubble: { maxWidth: "80%", padding: 14, borderRadius: 18, gap: 5, overflow: "hidden" },
  botBubble: { borderTopLeftRadius: 4, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  userBubble: { borderTopRightRadius: 4, backgroundColor: "#1D4ED8" },
  typingBubble: { paddingVertical: 16 },
  typingDots: { flexDirection: "row", gap: 4 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)" },
  bubbleText: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  timeText: { fontSize: 10, alignSelf: "flex-end", fontFamily: "Inter_400Regular" },
  emptyContainer: { alignItems: "center", paddingTop: 48, paddingHorizontal: 40, gap: 16 },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { color: "#F8FAFC", fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptySubtitle: { color: "rgba(255,255,255,0.45)", fontSize: 14, textAlign: "center", lineHeight: 21, fontFamily: "Inter_400Regular" },
  quickPromptsContainer: { paddingVertical: 10 },
  quickPrompt: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: "#0F1A2E", borderWidth: 1, borderColor: "rgba(6,182,212,0.2)" },
  quickPromptText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  inputContainer: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", padding: 12, backgroundColor: "#060D1A" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", backgroundColor: "#0F1A2E", borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  textInput: { flex: 1, color: "#F8FAFC", fontSize: 15, fontFamily: "Inter_400Regular", maxHeight: 100 },
  sendBtn: {},
  sendBtnGrad: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
