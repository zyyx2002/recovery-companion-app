import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useUserStatsStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { stats, fetchStats, isLoading: statsLoading } = useUserStatsStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      '确认登出',
      '您确定要登出吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              console.error('登出失败:', error);
              Alert.alert('错误', '登出失败，请重试');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    // 导航到编辑资料页面
    console.log('编辑资料');
  };

  const handleSettings = () => {
    // 导航到设置页面
    console.log('设置');
  };

  const handleHelp = () => {
    // 导航到帮助页面
    console.log('帮助');
  };

  const handleAbout = () => {
    // 导航到关于页面
    console.log('关于');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>登出中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 用户信息卡片 */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#007AFF" />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.username || '用户'}</Text>
            <Text style={styles.email}>{user?.email || ''}</Text>
            <Text style={styles.joinDate}>
              加入时间：{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : ''}
            </Text>
          </View>
        </View>

        {/* 统计信息 */}
        {stats && (
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>我的统计</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.stats?.totalPoints || 0}</Text>
                <Text style={styles.statLabel}>总积分</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.stats?.currentLevel || 1}</Text>
                <Text style={styles.statLabel}>当前等级</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.stats?.currentStreak || 0}</Text>
                <Text style={styles.statLabel}>戒断天数</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.stats?.longestStreak || 0}</Text>
                <Text style={styles.statLabel}>最长记录</Text>
              </View>
            </View>
          </View>
        )}

        {/* 功能菜单 */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color="#007AFF" />
              <Text style={styles.menuText}>编辑资料</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={24} color="#007AFF" />
              <Text style={styles.menuText}>设置</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.menuText}>帮助与支持</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.menuText}>关于我们</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* 登出按钮 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>登出</Text>
        </TouchableOpacity>

        {/* 版本信息 */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>版本 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
  versionInfo: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});
