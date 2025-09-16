import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { taskApi } from '../../services/api';

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  difficultyLevel: number;
  points: number;
  isDaily: boolean;
  completed: boolean;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'all'>('daily');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadDailyTasks(),
        loadAllTasks()
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyTasks = async () => {
    try {
      const response = await taskApi.getDailyTasks();
      if (response.data) {
        setDailyTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error('加载今日任务失败:', error);
    }
  };

  const loadAllTasks = async () => {
    try {
      const response = await taskApi.getTasks({ limit: 50 });
      if (response.data) {
        setTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error('加载所有任务失败:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTaskComplete = async (taskId: number) => {
    try {
      const response = await taskApi.completeTask({ taskId });
      if (response.data) {
        // 更新任务状态
        const updateTaskStatus = (taskList: Task[]) => 
          taskList.map(task => 
            task.id === taskId ? { ...task, completed: true } : task
          );

        setDailyTasks(updateTaskStatus);
        setTasks(updateTaskStatus);

        Alert.alert(
          '任务完成！',
          `恭喜您完成了任务，获得了 ${response.data.pointsEarned} 积分！`,
          [{ text: '确定' }]
        );
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      Alert.alert('错误', '完成任务失败，请重试');
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return '#4CAF50';
      case 2: return '#FF9800';
      case 3: return '#F44336';
      case 4: return '#9C27B0';
      case 5: return '#E91E63';
      default: return '#666';
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return '简单';
      case 2: return '中等';
      case 3: return '困难';
      case 4: return '挑战';
      case 5: return '极限';
      default: return '未知';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '心理健康': return 'brain-outline';
      case '身体健康': return 'fitness-outline';
      case '自我反思': return 'book-outline';
      case '社交': return 'people-outline';
      case '个人发展': return 'trending-up-outline';
      default: return 'checkmark-circle-outline';
    }
  };

  const renderTaskItem = (task: Task) => (
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
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <Ionicons 
              name={getCategoryIcon(task.category)} 
              size={20} 
              color={task.completed ? '#999' : '#007AFF'} 
            />
            <Text style={[
              styles.taskTitle,
              task.completed && styles.taskTitleCompleted
            ]}>
              {task.title}
            </Text>
          </View>
          <View style={styles.taskMeta}>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(task.difficultyLevel) }
            ]}>
              <Text style={styles.difficultyText}>
                {getDifficultyText(task.difficultyLevel)}
              </Text>
            </View>
            <Text style={styles.pointsText}>+{task.points}</Text>
          </View>
        </View>
        
        {task.description && (
          <Text style={[
            styles.taskDescription,
            task.completed && styles.taskDescriptionCompleted
          ]}>
            {task.description}
          </Text>
        )}
        
        <View style={styles.taskFooter}>
          <Text style={[
            styles.categoryText,
            task.completed && styles.categoryTextCompleted
          ]}>
            {task.category}
          </Text>
          {task.isDaily && (
            <View style={styles.dailyBadge}>
              <Text style={styles.dailyText}>每日</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={[
        styles.taskCheckbox,
        task.completed && styles.taskCheckboxCompleted
      ]}>
        {task.completed && (
          <Ionicons name="checkmark" size={20} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );

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

  const currentTasks = activeTab === 'daily' ? dailyTasks : tasks;
  const completedCount = currentTasks.filter(task => task.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* 标签页切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'daily' && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab('daily')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'daily' && styles.tabTextActive
          ]}>
            今日任务
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'all' && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'all' && styles.tabTextActive
          ]}>
            所有任务
          </Text>
        </TouchableOpacity>
      </View>

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentTasks.length}</Text>
          <Text style={styles.statLabel}>总任务</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>已完成</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.round((completedCount / Math.max(currentTasks.length, 1)) * 100)}%
          </Text>
          <Text style={styles.statLabel}>完成率</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {currentTasks.length > 0 ? (
          <View style={styles.tasksList}>
            {currentTasks.map(renderTaskItem)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'daily' ? '今日暂无任务' : '暂无任务'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'daily' 
                ? '明天会有新的任务等着您' 
                : '请稍后再来查看'
              }
            </Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
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
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  tasksList: {
    padding: 15,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  pointsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskDescriptionCompleted: {
    color: '#999',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  categoryTextCompleted: {
    color: '#999',
  },
  dailyBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dailyText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '600',
  },
  taskCheckbox: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
