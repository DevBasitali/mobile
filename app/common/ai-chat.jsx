import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatWithBot } from "../../services/aiService";

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
  },
  gold: {
    500: "#F59E0B",
    400: "#FBBF24",
  },
  white: "#FFFFFF",
  gray: {
    400: "#9CA3AF",
    500: "#6B7280",
  },
  blue: {
    500: "#3B82F6",
  },
};

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      content: "Hello! 👋 I'm SwiftRide Bot, your virtual assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    const updatedMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedMessages);

    // Build history for API (exclude the last user message as it's sent separately)
    const history = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      setLoading(true);
      const response = await chatWithBot(userMessage, history);
      const botReply = response?.data?.reply || response?.reply || "I'm sorry, I couldn't process that request.";

      setMessages((prev) => [...prev, { role: "model", content: botReply }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I'm having trouble connecting. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.botAvatar}>
              <Ionicons name="sparkles" size={20} color={COLORS.gold[500]} />
            </View>
            <View>
              <Text style={styles.headerTitle}>SwiftRide Bot</Text>
              <Text style={styles.headerSubtitle}>AI Assistant</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.role === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              {msg.role === "model" && (
                <View style={styles.botIcon}>
                  <Ionicons name="sparkles" size={14} color={COLORS.gold[500]} />
                </View>
              )}
              <Text
                style={[
                  styles.messageText,
                  msg.role === "user" ? styles.userText : styles.botText,
                ]}
              >
                {msg.content}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={[styles.messageBubble, styles.botBubble, styles.loadingBubble]}>
              <View style={styles.botIcon}>
                <Ionicons name="sparkles" size={14} color={COLORS.gold[500]} />
              </View>
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { animationDelay: "0.2s" }]} />
                <View style={[styles.typingDot, { animationDelay: "0.4s" }]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask anything..."
              placeholderTextColor={COLORS.gray[500]}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="send" size={20} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  header: {
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  botAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.gold[500],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray[400],
  },

  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },

  messageBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.gold[500],
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.navy[700],
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  botIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.navy[600],
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.navy[900],
  },
  botText: {
    color: COLORS.white,
    flex: 1,
  },

  loadingBubble: {
    paddingVertical: 16,
  },
  typingIndicator: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[400],
    opacity: 0.6,
  },

  inputContainer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    backgroundColor: COLORS.navy[800],
    borderTopWidth: 1,
    borderTopColor: COLORS.navy[700],
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.navy[700],
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gold[500],
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.gray[500],
    opacity: 0.5,
  },
});
