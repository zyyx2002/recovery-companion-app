import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useUserStatsStore } from '../../stores/authStore';
import { recoveryApi, taskApi } from '../../services/api';
import { useRouter } from 'expo-router';

export default function TodayScreen() {
  const { user } = useAuthStore();
  const { stats, fetchStats, isLoading: statsLoading } = useUserStatsStore();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        loadTodayTasks(),
        loadCurrentSession()
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayTasks = async () => {
    try {
      const response = await taskApi.getDailyTasks();
      if (response.data) {
        setTodayTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error('加载今日任务失败:', error);
    }
  };

  const loadCurrentSession = async () => {
    try {
      const response = await recoveryApi.getCurrentSession();
      if (response.data) {
        setCurrentSession(response.data.session);
      }
    } catch (error) {
      console.error('加载当前会话失败:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMoodCheckin = () => {
    // 导航到心情签到页面
    console.log('心情签到');
  };

  const handleAIChat = () => {
    router.push('/ai-chat');
  };

  const handleTaskComplete = async (taskId: number) => {
    try {
      const response = await taskApi.completeTask({ taskId });
      if (response.data) {
        // 重新加载数据
        await loadData();
      }
    } catch (error) {
      console.error('完成任务失败:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 欢迎区域 */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            你好，{user?.username || '用户'}！
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </Text>
        </View>

        {/* 戒断进度卡片 */}
        {currentSession && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>戒断进度</Text>
              <Text style={styles.progressSubtitle}>
                {currentSession.addictionType?.name || '戒断目标'}
              </Text>
            </View>
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentSession.actualDays || 0}</Text>
                <Text style={styles.statLabel}>戒断天数</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentSession.targetDays || 30}</Text>
                <Text style={styles.statLabel}>目标天数</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round(currentSession.progress || 0)}%
                </Text>
                <Text style={styles.statLabel}>完成度</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(currentSession.progress || 0, 100)}%` }
                ]}
              />
            </View>
          </View>
        )}

        {/* 快速操作 */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMoodCheckin}>
            <Ionicons name="happy-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>心情签到</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleAIChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>AI陪伴</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="trophy-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>成就</Text>
          </TouchableOpacity>
        </View>

        {/* 今日任务 */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>今日任务</Text>
          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskItem,
                  task.completed && styles.taskItemCompleted
                ]}
                onPress={() => !task.completed && handleTaskComplete(task.id)}
                disabled={task.completed}
              >
                <View style={styles.taskContent}>
                  <Text style={[
                    styles.taskTitle,
                    task.completed && styles.taskTitleCompleted
                  ]}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskPoints}>+{task.points} 积分</Text>
                </View>
                <View style={[
                  styles.taskCheckbox,
                  task.completed && styles.taskCheckboxCompleted
                ]}>
                  {task.completed && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyText}>今日暂无任务</Text>
            </View>
          )}
        </View>

        {/* 统计信息 */}
        {stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>今日统计</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statCardNumber}>{stats.stats?.totalPoints || 0}</Text>
                <Text style={styles.statCardLabel}>总积分</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statCardNumber}>{stats.stats?.currentLevel || 1}</Text>
                <Text style={styles.statCardLabel}>当前等级</Text>
              </View>
            </View>
          </View>
        )}
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
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  progressCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
  },
  tasksSection: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskPoints: {
    fontSize: 12,
    color: '#007AFF',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  emptyTasks: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  statsSection: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    padding: 15,
  },
  statCardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
