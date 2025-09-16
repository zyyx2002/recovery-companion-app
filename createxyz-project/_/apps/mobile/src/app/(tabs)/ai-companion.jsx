import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  MessageCircle,
  Send,
  Sparkles,
  Heart,
  Lightbulb,
  Bot,
  Shield,
  Zap,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useHandleStreamResponse from "@/utils/useHandleStreamResponse";

export default function AICompanionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const handleFinish = useCallback((message) => {
    setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    setStreamingMessage("");
    setIsLoading(false);
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: handleFinish,
  });

  const prompts = [
    {
      icon: Heart,
      text: "我感到很想放弃了",
      color: "#E91E63",
    },
    {
      icon: Shield,
      text: "今天诱惑特别强烈",
      color: "#2196F3",
    },
    {
      icon: Lightbulb,
      text: "给我一些坚持的动力",
      color: "#FF9800",
    },
    {
      icon: Sparkles,
      text: "我感觉很好！",
      color: "#4CAF50",
    },
  ];

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    const newUserMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "你是一个专业的戒断康复AI助手。你的名字叫小康。你要用温暖、理解和支持的语气帮助用户克服各种成瘾问题（戒烟、戒酒、戒色情等）。请用中文回复，保持简洁而有力的建议。当用户表达困难时，给出具体的应对策略和鼓励。",
            },
            ...messages,
            newUserMessage,
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      handleStreamResponse(response);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "抱歉，我现在无法回复。请检查网络连接或稍后再试。如果问题持续，你可以尝试刷新页面。",
        },
      ]);
    }

    // Scroll to bottom after sending
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (!fontsLoaded) {
    return null;
  }

  const AIAvatar = ({ size = 40 }) => (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#CAB8FF",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Bot size={size * 0.5} color="#000" />
    </View>
  );

  const EmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingBottom: 100,
        paddingTop: 40,
      }}
    >
      <AIAvatar size={80} />

      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 24,
          color: isDark ? "#fff" : "#000",
          textAlign: "center",
          marginTop: 20,
          marginBottom: 8,
        }}
      >
        你好，我是小康
      </Text>

      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 16,
          color: isDark ? "#8F8F8F" : "#8E8E93",
          textAlign: "center",
          lineHeight: 22,
          marginBottom: 32,
        }}
      >
        我在这里陪伴和支持你的戒断之旅。无论何时感到困难，都可以和我聊聊。
      </Text>

      <View style={{ width: "100%" }}>
        {prompts.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#fff",
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#E6E6EA",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => sendMessage(prompt.text)}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: `${prompt.color}20`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <prompt.icon size={16} color={prompt.color} />
            </View>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: isDark ? "#fff" : "#000",
                flex: 1,
              }}
            >
              {prompt.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const MessageBubble = ({ message, isUser }) => (
    <View
      style={{
        flexDirection: "row",
        marginBottom: 16,
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      {!isUser && <AIAvatar size={32} />}
      <View
        style={{
          maxWidth: "80%",
          backgroundColor: isUser
            ? isDark
              ? "#fff"
              : "#000"
            : isDark
              ? "#1E1E1E"
              : "#F5F5F5",
          borderRadius: 18,
          padding: 12,
          marginLeft: isUser ? 0 : 8,
          marginRight: isUser ? 0 : 8,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 15,
            color: isUser
              ? isDark
                ? "#000"
                : "#fff"
              : isDark
                ? "#fff"
                : "#000",
            lineHeight: 20,
          }}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? "#333" : "#E6E6E9",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <AIAvatar size={40} />
          <View style={{ marginLeft: 12 }}>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 18,
                color: isDark ? "#fff" : "#000",
              }}
            >
              AI助手 小康
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#8F8F8F" : "#8E8E93",
              }}
            >
              24小时陪伴支持
            </Text>
          </View>
        </View>
      </View>

      {/* Chat Content */}
      {messages.length === 0 && !streamingMessage ? (
        <EmptyState />
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 20,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <MessageBubble
              key={index}
              message={msg}
              isUser={msg.role === "user"}
            />
          ))}

          {streamingMessage && (
            <MessageBubble
              message={{ content: streamingMessage }}
              isUser={false}
            />
          )}

          {isLoading && !streamingMessage && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <AIAvatar size={32} />
              <View
                style={{
                  backgroundColor: isDark ? "#1E1E1E" : "#F5F5F5",
                  borderRadius: 18,
                  padding: 12,
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 15,
                    color: isDark ? "#8F8F8F" : "#8E8E93",
                  }}
                >
                  小康正在思考...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Message Input */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: isDark ? "#121212" : "#fff",
          borderTopWidth: 0.5,
          borderTopColor: isDark ? "#333" : "#E6E6E9",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: isDark ? "#1E1E1E" : "#F5F5F5",
              borderRadius: 24,
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 16,
              paddingRight: 12,
              paddingVertical: 12,
              marginRight: 16,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#fff" : "#000",
                maxHeight: 100,
              }}
              placeholder="分享你的感受..."
              placeholderTextColor={isDark ? "#8F8F8F" : "#9A9A9A"}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isDark ? "#fff" : "#000",
              justifyContent: "center",
              alignItems: "center",
              opacity: isLoading ? 0.5 : 1,
            }}
            onPress={() => sendMessage(message)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Zap size={20} color={isDark ? "#000" : "#fff"} />
            ) : (
              <Send size={20} color={isDark ? "#000" : "#fff"} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
