import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 这里可以添加错误上报逻辑
    // 例如发送到错误监控服务
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // 模拟错误上报
    if (__DEV__) {
      console.log('📊 错误上报:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
    
    // 实际项目中应该发送到错误监控服务
    // 例如 Sentry, Bugsnag 等
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReport = () => {
    // 这里可以添加用户反馈功能
    console.log('用户报告错误');
  };

  render() {
    if (this.state.hasError) {
      // 如果有自定义的fallback组件，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误界面
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={80} color="#FF6B6B" />
            </View>
            
            <Text style={styles.title}>出现了一些问题</Text>
            <Text style={styles.subtitle}>
              很抱歉，应用遇到了一个错误。我们已经记录了这个问题，并会尽快修复。
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>错误详情 (开发模式):</Text>
                <Text style={styles.errorMessage}>
                  {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStack}>
                    {this.state.error.stack}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.handleRetry}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryButtonText}>重试</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reportButton}
                onPress={this.handleReport}
              >
                <Ionicons name="bug" size={20} color="#007AFF" />
                <Text style={styles.reportButtonText}>报告问题</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>需要帮助？</Text>
              <Text style={styles.helpText}>
                如果问题持续存在，请联系我们的技术支持团队。
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  errorDetails: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  reportButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '100%',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

// 高阶组件包装器
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;
