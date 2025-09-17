'use client';

import React, { useState, useEffect } from 'react';
import { Users, Target, Trophy, MessageCircle, TrendingUp, Calendar, Star, Zap } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalPosts: 0,
    totalAchievements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // 模拟数据，实际应该从API获取
      setStats({
        totalUsers: 1248,
        activeUsers: 892,
        totalTasks: 156,
        completedTasks: 3420,
        totalPosts: 89,
        totalAchievements: 67
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          {change && (
            <p className="text-green-600 text-sm mt-1">
              +{change}% 较上周
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">戒断康复 - 管理后台</h1>
              <p className="mt-1 text-gray-600">管理用户、任务和社区内容</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                系统运行正常
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-8 border-b border-gray-200 mb-8">
          <button className="pb-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">
            数据概览
          </button>
          <button className="pb-4 px-1 text-gray-500 hover:text-gray-700">
            用户管理
          </button>
          <button className="pb-4 px-1 text-gray-500 hover:text-gray-700">
            任务管理
          </button>
          <button className="pb-4 px-1 text-gray-500 hover:text-gray-700">
            社区管理
          </button>
          <button className="pb-4 px-1 text-gray-500 hover:text-gray-700">
            成就系统
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="总用户数"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
            change={12}
          />
          <StatCard
            title="活跃用户"
            value={stats.activeUsers}
            icon={TrendingUp}
            color="bg-green-500"
            change={8}
          />
          <StatCard
            title="任务总数"
            value={stats.totalTasks}
            icon={Target}
            color="bg-purple-500"
            change={5}
          />
          <StatCard
            title="完成次数"
            value={stats.completedTasks}
            icon={Star}
            color="bg-yellow-500"
            change={25}
          />
          <StatCard
            title="社区帖子"
            value={stats.totalPosts}
            icon={MessageCircle}
            color="bg-pink-500"
            change={18}
          />
          <StatCard
            title="获得成就"
            value={stats.totalAchievements}
            icon={Trophy}
            color="bg-orange-500"
            change={15}
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">用户增长趋势</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">图表数据加载中...</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">新用户注册</p>
                  <p className="text-xs text-gray-500">李明 刚刚加入戒烟计划</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">任务完成</p>
                  <p className="text-xs text-gray-500">王小红 完成了深呼吸练习</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">社区互动</p>
                  <p className="text-xs text-gray-500">张伟 发布了戒断心得</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">成就解锁</p>
                  <p className="text-xs text-gray-500">刘芳 获得了"坚持一周"徽章</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">添加用户</p>
                  <p className="text-sm text-gray-500">创建新用户账户</p>
                </div>
              </div>
            </button>
            
            <button className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">创建任务</p>
                  <p className="text-sm text-gray-500">添加新的挑战任务</p>
                </div>
              </div>
            </button>
            
            <button className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">设计成就</p>
                  <p className="text-sm text-gray-500">创建新的奖励徽章</p>
                </div>
              </div>
            </button>
            
            <button className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">系统设置</p>
                  <p className="text-sm text-gray-500">配置APP参数</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}