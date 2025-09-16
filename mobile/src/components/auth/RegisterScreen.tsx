import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { RegisterRequest } from '../../services/api';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export default function RegisterScreen({ onNavigateToLogin, onRegisterSuccess }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, isLoading, error, clearError } = useAuthStore();

  const validateForm = (): string | null => {
    if (!email.trim()) {
      return '请输入邮箱地址';
    }

    if (!username.trim()) {
      return '请输入用户名';
    }

    if (!password.trim()) {
      return '请输入密码';
    }

    if (!confirmPassword.trim()) {
      return '请确认密码';
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return '请输入有效的邮箱地址';
    }

    // 用户名长度验证
    if (username.length < 2 || username.length > 50) {
      return '用户名长度应在2-50个字符之间';
    }

    // 密码强度验证
    if (password.length < 8) {
      return '密码长度至少8个字符';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return '密码必须包含大小写字母和数字';
    }

    // 密码确认验证
    if (password !== confirmPassword) {
      return '两次输入的密码不一致';
    }

    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('输入错误', validationError);
      return;
    }

    clearError();

    const registerData: RegisterRequest = {
      email: email.trim(),
      username: username.trim(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim()
    };

    const success = await register(registerData);
    
    if (success) {
      onRegisterSuccess();
    } else {
      // 错误信息已经在store中设置
      if (!error) {
        Alert.alert('注册失败', '请检查您的输入信息');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 头部 */}
          <View style={styles.header}>
            <Text style={styles.title}>创建账户</Text>
            <Text style={styles.subtitle}>开始您的戒断康复之旅</Text>
          </View>

          {/* 表单 */}
          <View style={styles.form}>
            {/* 邮箱输入 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>邮箱地址</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入您的邮箱"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* 用户名输入 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>用户名</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入用户名"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* 密码输入 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>密码</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="请输入密码（至少8位，包含大小写字母和数字）"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPassword ? '隐藏' : '显示'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 确认密码输入 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>确认密码</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="请再次输入密码"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <Text style={styles.eyeButtonText}>
                    {showConfirmPassword ? '隐藏' : '显示'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 错误信息 */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 注册按钮 */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>注册</Text>
              )}
            </TouchableOpacity>

            {/* 登录链接 */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>已有账户？</Text>
              <TouchableOpacity
                onPress={onNavigateToLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginLink}>立即登录</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
});
