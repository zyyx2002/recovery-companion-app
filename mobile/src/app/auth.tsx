import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from '../components/auth/LoginScreen';
import RegisterScreen from '../components/auth/RegisterScreen';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSuccess = () => {
    // 登录成功后的处理逻辑
    // 由于使用了状态管理，认证状态会自动更新
    console.log('登录成功');
  };

  const handleRegisterSuccess = () => {
    // 注册成功后的处理逻辑
    console.log('注册成功');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {isLogin ? (
          <LoginScreen
            onNavigateToRegister={() => setIsLogin(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <RegisterScreen
            onNavigateToLogin={() => setIsLogin(true)}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
