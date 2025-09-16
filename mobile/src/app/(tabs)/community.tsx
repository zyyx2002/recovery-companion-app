import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user: {
    username: string;
  };
}

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('经验分享');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // 模拟数据
      const mockPosts: Post[] = [
        {
          id: 1,
          title: '戒断30天的心得体会',
          content: '经过30天的坚持，我深深感受到戒断带来的好处。身体更健康了，精神状态也更好了...',
          category: '经验分享',
          isAnonymous: false,
          likesCount: 15,
          commentsCount: 8,
          createdAt: '2024-01-15T10:30:00Z',
          user: { username: '戒断达人' }
        },
        {
          id: 2,
          title: '如何克服戒断初期的困难',
          content: '戒断初期确实很困难，但通过一些方法可以更好地度过这个阶段...',
          category: '求助',
          isAnonymous: true,
          likesCount: 23,
          commentsCount: 12,
          createdAt: '2024-01-14T15:20:00Z',
          user: { username: '匿名用户' }
        },
        {
          id: 3,
          title: '分享我的戒断计划',
          content: '制定一个合理的戒断计划非常重要，以下是我的经验分享...',
          category: '经验分享',
          isAnonymous: false,
          likesCount: 8,
          commentsCount: 5,
          createdAt: '2024-01-13T09:15:00Z',
          user: { username: '坚持者' }
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('提示', '请填写标题和内容');
      return;
    }

    const newPost: Post = {
      id: Date.now(),
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      category: newPostCategory,
      isAnonymous: false,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      user: { username: '我' }
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostCategory('经验分享');
    setShowCreatePost(false);
    Alert.alert('成功', '帖子发布成功！');
  };

  const handleLikePost = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likesCount: post.likesCount + 1 }
        : post
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '经验分享': return '#4CAF50';
      case '求助': return '#FF9800';
      case '心情': return '#2196F3';
      case '成就': return '#9C27B0';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
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
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>社区</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreatePost(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postMeta}>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(post.category) }
                  ]}>
                    <Text style={styles.categoryText}>{post.category}</Text>
                  </View>
                  <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                </View>
                {post.isAnonymous && (
                  <View style={styles.anonymousBadge}>
                    <Ionicons name="eye-off" size={12} color="#666" />
                    <Text style={styles.anonymousText}>匿名</Text>
                  </View>
                )}
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent} numberOfLines={3}>
                {post.content}
              </Text>

              <View style={styles.postFooter}>
                <View style={styles.postAuthor}>
                  <Ionicons name="person" size={16} color="#666" />
                  <Text style={styles.authorText}>
                    {post.isAnonymous ? '匿名用户' : post.user.username}
                  </Text>
                </View>
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLikePost(post.id)}
                  >
                    <Ionicons name="heart-outline" size={18} color="#666" />
                    <Text style={styles.actionText}>{post.likesCount}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={18} color="#666" />
                    <Text style={styles.actionText}>{post.commentsCount}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>暂无帖子</Text>
            <Text style={styles.emptySubtitle}>
              成为第一个分享的人吧！
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 创建帖子模态框 */}
      {showCreatePost && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreatePost(false)}>
                <Text style={styles.modalCancel}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>发布帖子</Text>
              <TouchableOpacity onPress={handleCreatePost}>
                <Text style={styles.modalConfirm}>发布</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.titleInput}
                placeholder="请输入标题"
                value={newPostTitle}
                onChangeText={setNewPostTitle}
                maxLength={50}
              />
              
              <TextInput
                style={styles.contentInput}
                placeholder="分享您的想法..."
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                numberOfLines={8}
                maxLength={500}
              />
              
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>分类：</Text>
                <View style={styles.categoryOptions}>
                  {['经验分享', '求助', '心情', '成就'].map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        newPostCategory === category && styles.categoryOptionSelected
                      ]}
                      onPress={() => setNewPostCategory(category)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        newPostCategory === category && styles.categoryOptionTextSelected
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  anonymousText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  postActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  modalBody: {
    padding: 20,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#333',
  },
  categoryOptionTextSelected: {
    color: '#fff',
  },
});
