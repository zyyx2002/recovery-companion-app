'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Award,
  Heart,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalTasks: number;
  totalRecoverySessions: number;
  totalAchievements: number;
  averageStreak: number;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'post_created' | 'task_completed' | 'milestone_reached';
  description: string;
  timestamp: string;
  user?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 模拟数据加载
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 1250,
        activeUsers: 890,
        totalPosts: 3420,
        totalTasks: 15600,
        totalRecoverySessions: 2100,
        totalAchievements: 8500,
        averageStreak: 23.5,
        completionRate: 78.2
      });

      setRecentActivity([
        {
          id: '1',
          type: 'user_registration',
          description: '新用户注册',
          timestamp: '2024-01-15T10:30:00Z',
          user: '戒断新手'
        },
        {
          id: '2',
          type: 'milestone_reached',
          description: '达成30天戒断里程碑',
          timestamp: '2024-01-15T09:15:00Z',
          user: '坚持者'
        },
        {
          id: '3',
          type: 'post_created',
          description: '发布经验分享帖子',
          timestamp: '2024-01-15T08:45:00Z',
          user: '戒断达人'
        },
        {
          id: '4',
          type: 'task_completed',
          description: '完成每日任务',
          timestamp: '2024-01-15T08:20:00Z',
          user: '积极用户'
        }
      ]);
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'milestone_reached':
        return <Award className="h-4 w-4 text-yellow-500" />;
      case 'post_created':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">管理后台</h1>
              <p className="text-gray-600 mt-1">戒断康复APP数据概览</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                最后更新: {new Date().toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总用户数</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">活跃用户</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.activeUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">戒断会话</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalRecoverySessions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">平均戒断天数</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.averageStreak}天
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 详细统计 */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">详细统计</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats?.totalPosts.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">社区帖子</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats?.totalTasks.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">完成任务</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {stats?.totalAchievements.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">获得成就</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {stats?.completionRate}%
                  </div>
                  <div className="text-sm text-gray-500">任务完成率</div>
                </div>
              </div>
            </div>
          </div>

          {/* 最近活动 */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">最近活动</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.user && (
                          <span className="font-medium">{activity.user}</span>
                        )}{' '}
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="mt-8">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">快速操作</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="btn btn-primary btn-md">
                <Users className="h-4 w-4 mr-2" />
                用户管理
              </button>
              <button className="btn btn-secondary btn-md">
                <MessageSquare className="h-4 w-4 mr-2" />
                内容审核
              </button>
              <button className="btn btn-secondary btn-md">
                <Calendar className="h-4 w-4 mr-2" />
                数据报告
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
