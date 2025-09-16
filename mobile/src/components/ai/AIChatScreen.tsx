import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../../services/aiApi';
import { useUserStatsStore } from '../../stores/authStore';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
  encouragement?: string;
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyMotivation, setDailyMotivation] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { stats } = useUserStatsStore();

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // 获取每日激励
      const motivationResponse = await aiApi.getDailyMotivation();
      setDailyMotivation(motivationResponse.data.motivation);

      // 添加欢迎消息
      const welcomeMessage: Message = {
        id: '1',
        text: '你好！我是你的戒断康复助手。我在这里陪伴你的戒断之旅，为你提供支持和鼓励。有什么想聊的吗？',
        isUser: false,
        timestamp: new Date(),
        suggestions: [
          '我今天感觉很困难',
          '给我一些建议',
          '我需要鼓励',
          '分享我的心情'
        ]
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('初始化聊天失败:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await aiApi.chat({
        message: userMessage.text,
        context: {
          currentStreak: stats?.stats?.currentStreak,
          addictionType: stats?.stats?.currentAddiction?.name,
          mood: 'neutral' // 可以从其他地方获取
        }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message,
        isUser: false,
        timestamp: new Date(),
        suggestions: response.data.suggestions,
        encouragement: response.data.encouragement
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('发送消息失败:', error);
      Alert.alert('错误', '发送消息失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleQuickAction = async (action: string) => {
    let message = '';
    
    switch (action) {
      case 'encouragement':
        message = '我需要一些鼓励';
        break;
      case 'advice':
        message = '给我一些戒断建议';
        break;
      case 'mood':
        message = '我想分享我的心情';
        break;
      case 'motivation':
        message = '给我一些动力';
        break;
      default:
        return;
    }

    setInputText(message);
    // 自动发送
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiAvatar}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#007AFF" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI康复助手</Text>
            <Text style={styles.headerSubtitle}>24小时在线陪伴</Text>
          </View>
        </View>
      </View>

      {/* 每日激励 */}
      {dailyMotivation && (
        <View style={styles.motivationCard}>
          <Ionicons name="bulb" size={20} color="#FFD700" />
          <Text style={styles.motivationText}>{dailyMotivation}</Text>
        </View>
      )}

      {/* 快速操作 */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => handleQuickAction('encouragement')}
        >
          <Ionicons name="heart" size={16} color="#FF6B6B" />
          <Text style={styles.quickActionText}>鼓励</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => handleQuickAction('advice')}
        >
          <Ionicons name="bulb" size={16} color="#4ECDC4" />
          <Text style={styles.quickActionText}>建议</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => handleQuickAction('mood')}
        >
          <Ionicons name="happy" size={16} color="#45B7D1" />
          <Text style={styles.quickActionText}>心情</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => handleQuickAction('motivation')}
        >
          <Ionicons name="trending-up" size={16} color="#96CEB4" />
          <Text style={styles.quickActionText}>动力</Text>
        </TouchableOpacity>
      </View>

      {/* 聊天消息 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View key={message.id} style={styles.messageContainer}>
              <View style={[
                styles.messageBubble,
                message.isUser ? styles.userMessage : styles.aiMessage
              ]}>
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.isUser ? styles.userMessageTime : styles.aiMessageTime
                ]}>
                  {message.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>

              {/* AI建议 */}
              {!message.isUser && message.suggestions && message.suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>建议回复：</Text>
                  <View style={styles.suggestionsList}>
                    {message.suggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionButton}
                        onPress={() => handleSuggestionPress(suggestion)}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* 加载指示器 */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.aiMessage}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>AI正在思考...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* 输入框 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="输入消息..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    marginLeft: 10,
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiMessageTime: {
    color: '#999',
  },
  suggestionsContainer: {
    marginTop: 10,
    marginLeft: 10,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionButton: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  suggestionText: {
    fontSize: 12,
    color: '#007AFF',
  },
  loadingContainer: {
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
