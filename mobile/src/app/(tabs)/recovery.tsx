import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { recoveryApi } from '../../services/api';

interface AddictionType {
  id: number;
  name: string;
  description: string;
  colorCode: string;
}

interface RecoverySession {
  id: number;
  startDate: string;
  targetDays: number;
  actualDays: number;
  progress: number;
  addictionType: {
    id: number;
    name: string;
    colorCode: string;
  };
}

export default function RecoveryScreen() {
  const [currentSession, setCurrentSession] = useState<RecoverySession | null>(null);
  const [addictionTypes, setAddictionTypes] = useState<AddictionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedAddiction, setSelectedAddiction] = useState<AddictionType | null>(null);
  const [targetDays, setTargetDays] = useState(30);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCurrentSession(),
        loadAddictionTypes()
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
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

  const loadAddictionTypes = async () => {
    try {
      const response = await recoveryApi.getAddictionTypes();
      if (response.data) {
        setAddictionTypes(response.data.addictionTypes || []);
      }
    } catch (error) {
      console.error('加载成瘾类型失败:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStartSession = async () => {
    if (!selectedAddiction) {
      Alert.alert('提示', '请选择戒断类型');
      return;
    }

    try {
      const response = await recoveryApi.startSession({
        addictionTypeId: selectedAddiction.id,
        targetDays: targetDays
      });

      if (response.data) {
        setShowStartModal(false);
        setSelectedAddiction(null);
        setTargetDays(30);
        await loadData();
        Alert.alert('成功', '戒断会话已开始！');
      }
    } catch (error) {
      console.error('开始戒断会话失败:', error);
      Alert.alert('错误', '开始戒断会话失败，请重试');
    }
  };

  const handleEndSession = () => {
    if (!currentSession) return;

    Alert.alert(
      '结束戒断会话',
      '确定要结束当前的戒断会话吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await recoveryApi.endSession({
                sessionId: currentSession.id
              });

              if (response.data) {
                await loadData();
                Alert.alert('成功', '戒断会话已结束');
              }
            } catch (error) {
              console.error('结束戒断会话失败:', error);
              Alert.alert('错误', '结束戒断会话失败，请重试');
            }
          }
        }
      ]
    );
  };

  const handleMoodCheckin = () => {
    // 导航到心情签到页面
    console.log('心情签到');
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
        {currentSession ? (
          // 有活跃会话
          <>
            {/* 戒断进度卡片 */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={[
                  styles.addictionBadge,
                  { backgroundColor: currentSession.addictionType.colorCode }
                ]}>
                  <Text style={styles.addictionBadgeText}>
                    {currentSession.addictionType.name}
                  </Text>
                </View>
                <Text style={styles.progressTitle}>戒断进度</Text>
              </View>

              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{currentSession.actualDays}</Text>
                  <Text style={styles.statLabel}>戒断天数</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{currentSession.targetDays}</Text>
                  <Text style={styles.statLabel}>目标天数</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.round(currentSession.progress)}%
                  </Text>
                  <Text style={styles.statLabel}>完成度</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { 
                      width: `${Math.min(currentSession.progress, 100)}%`,
                      backgroundColor: currentSession.addictionType.colorCode
                    }
                  ]}
                />
              </View>

              <View style={styles.progressActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleMoodCheckin}
                >
                  <Ionicons name="happy-outline" size={20} color="#007AFF" />
                  <Text style={styles.actionButtonText}>心情签到</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.endButton]}
                  onPress={handleEndSession}
                >
                  <Ionicons name="stop-outline" size={20} color="#FF3B30" />
                  <Text style={[styles.actionButtonText, styles.endButtonText]}>结束会话</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 里程碑 */}
            <View style={styles.milestonesCard}>
              <Text style={styles.cardTitle}>里程碑</Text>
              <View style={styles.milestonesList}>
                {[7, 30, 60, 90, 180, 365].map((day) => (
                  <View key={day} style={styles.milestoneItem}>
                    <View style={[
                      styles.milestoneIcon,
                      currentSession.actualDays >= day && styles.milestoneIconCompleted
                    ]}>
                      {currentSession.actualDays >= day ? (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      ) : (
                        <Text style={styles.milestoneDay}>{day}</Text>
                      )}
                    </View>
                    <Text style={styles.milestoneLabel}>{day}天</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          // 没有活跃会话
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>开始您的戒断之旅</Text>
            <Text style={styles.emptySubtitle}>
              选择一个戒断目标，开始您的康复之路
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setShowStartModal(true)}
            >
              <Text style={styles.startButtonText}>开始戒断</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 开始戒断会话模态框 */}
      <Modal
        visible={showStartModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowStartModal(false)}>
              <Text style={styles.modalCancel}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>开始戒断</Text>
            <TouchableOpacity onPress={handleStartSession}>
              <Text style={styles.modalConfirm}>确定</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>选择戒断类型</Text>
            <View style={styles.addictionTypesList}>
              {addictionTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.addictionTypeItem,
                    selectedAddiction?.id === type.id && styles.addictionTypeItemSelected
                  ]}
                  onPress={() => setSelectedAddiction(type)}
                >
                  <View style={[
                    styles.addictionTypeColor,
                    { backgroundColor: type.colorCode }
                  ]} />
                  <View style={styles.addictionTypeInfo}>
                    <Text style={styles.addictionTypeName}>{type.name}</Text>
                    <Text style={styles.addictionTypeDescription}>{type.description}</Text>
                  </View>
                  {selectedAddiction?.id === type.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSectionTitle}>目标天数</Text>
            <View style={styles.targetDaysContainer}>
              {[7, 14, 30, 60, 90, 180, 365].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.targetDayButton,
                    targetDays === days && styles.targetDayButtonSelected
                  ]}
                  onPress={() => setTargetDays(days)}
                >
                  <Text style={[
                    styles.targetDayText,
                    targetDays === days && styles.targetDayTextSelected
                  ]}>
                    {days}天
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  progressCard: {
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
  progressHeader: {
    marginBottom: 20,
  },
  addictionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  addictionBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  endButton: {
    backgroundColor: '#ffe6e6',
  },
  endButtonText: {
    color: '#FF3B30',
  },
  milestonesCard: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  milestonesList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  milestoneItem: {
    alignItems: 'center',
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  milestoneIconCompleted: {
    backgroundColor: '#007AFF',
  },
  milestoneDay: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  milestoneLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalConfirm: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addictionTypesList: {
    marginBottom: 30,
  },
  addictionTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  addictionTypeItemSelected: {
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  addictionTypeColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
  },
  addictionTypeInfo: {
    flex: 1,
  },
  addictionTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addictionTypeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  targetDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  targetDayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  targetDayButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  targetDayText: {
    fontSize: 16,
    color: '#333',
  },
  targetDayTextSelected: {
    color: '#fff',
  },
});
