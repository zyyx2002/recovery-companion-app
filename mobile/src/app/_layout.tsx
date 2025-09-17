import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { isAuthenticated, getCurrentUser, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 如果有存储的认证状态，尝试获取用户信息
        if (isAuthenticated) {
          await getCurrentUser();
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // 显示加载屏幕
  if (isInitializing || isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {isAuthenticated ? (
        // 已认证用户的路由
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="ai-chat" options={{ headerShown: true, title: 'AI陪伴' }} />
          <Stack.Screen name="profile" options={{ headerShown: true, title: '个人资料' }} />
          <Stack.Screen name="settings" options={{ headerShown: true, title: '设置' }} />
        </>
      ) : (
        // 未认证用户的路由
        <>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
