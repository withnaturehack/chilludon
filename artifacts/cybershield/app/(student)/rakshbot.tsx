import React, { useState, useRef, useCallback } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApi } from "@/hooks/useApi";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const QUICK_PROMPTS = [
  "How do I start bug bounty hunting?",
  "What is SQL injection?",
  "Explain XSS vulnerability",
  "How to improve my rank?",
  "What should I learn today?",
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

  const { data, isLoading } = useQuery({
    queryKey: ["rakshbot-history"],
    queryFn: () => apiFetch("/rakshbot/history?limit=50"),
  });

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
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry yaar, kuch problem aa gayi. Please try again!",
        created_at: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  }

  const topPad = insets.top + (isWeb ? 16 : 0);

  const renderItem = useCallback(({ item }: { item: Message }) => {
    const isBot = item.role === "assistant";
    return (
      <View style={[styles.msgRow, isBot ? styles.botRow : styles.userRow]}>
        {isBot && (
          <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="robot" size={16} color="#FFF" />
          </View>
        )}
        <View style={[
          styles.bubble,
          isBot
            ? [styles.botBubble, { backgroundColor: colors.card, borderColor: colors.border }]
            : [styles.userBubble, { backgroundColor: colors.primary }],
        ]}>
          <Text style={[
            styles.bubbleText,
            { color: isBot ? colors.foreground : "#FFF", fontFamily: "Inter_400Regular" },
          ]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, { color: isBot ? colors.mutedForeground : "rgba(255,255,255,0.6)" }]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  }, [colors]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.botInfo}>
            <View style={[styles.botIconBg, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <MaterialCommunityIcons name="robot" size={24} color="#FFF" />
            </View>
            <View>
              <Text style={[styles.botName, { fontFamily: "Inter_700Bold" }]}>RakshBot</Text>
              <View style={styles.onlineRow}>
                <View style={[styles.onlineDot, { backgroundColor: "#10B981" }]} />
                <Text style={[styles.onlineText, { fontFamily: "Inter_400Regular" }]}>AI Mentor · Hinglish</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={allMessages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.messageList, { paddingBottom: 10 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="robot-outline" size={64} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Namaste! Main RakshBot hun
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Your personal AI cybersecurity mentor. Ask me anything!
              </Text>
            </View>
          }
          ListFooterComponent={sending ? (
            <View style={[styles.msgRow, styles.botRow]}>
              <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="robot" size={16} color="#FFF" />
              </View>
              <View style={[styles.bubble, styles.botBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          ) : null}
        />
      )}

      {/* Quick prompts */}
      {allMessages.length === 0 && !isLoading && (
        <View style={styles.quickPromptsContainer}>
          <Text style={[styles.quickPromptsTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Try asking:
          </Text>
          <FlatList
            horizontal
            data={QUICK_PROMPTS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.quickPrompt, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => sendMessage(item)}
              >
                <Text style={[styles.quickPromptText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          />
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom + 8 }]}>
        <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            placeholder="Ask RakshBot anything..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || sending}
            activeOpacity={0.8}
          >
            <Feather name="send" size={18} color={input.trim() ? "#FFF" : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerContent: {},
  botInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  botIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  botName: { color: "#FFF", fontSize: 18 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  messageList: { padding: 16, gap: 12 },
  msgRow: { flexDirection: "row", gap: 8, maxWidth: "100%" },
  botRow: { alignItems: "flex-end" },
  userRow: { justifyContent: "flex-end" },
  botAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bubble: { maxWidth: "80%", padding: 12, borderRadius: 16, gap: 4 },
  botBubble: { borderTopLeftRadius: 4, borderWidth: 1 },
  userBubble: { borderTopRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  timeText: { fontSize: 10, alignSelf: "flex-end" },
  emptyContainer: { alignItems: "center", paddingTop: 60, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 20, textAlign: "center" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  quickPromptsContainer: { paddingVertical: 12 },
  quickPromptsTitle: { fontSize: 12, paddingHorizontal: 16, marginBottom: 8 },
  quickPrompt: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  quickPromptText: { fontSize: 13 },
  inputContainer: { borderTopWidth: 1, padding: 12 },
  inputRow: { flexDirection: "row", alignItems: "flex-end", borderRadius: 24, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  textInput: { flex: 1, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
