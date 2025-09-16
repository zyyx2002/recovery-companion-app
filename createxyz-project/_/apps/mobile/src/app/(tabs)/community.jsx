import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import {
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
  Plus,
  Search,
  User,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import ScreenContainer from "@/components/ScreenContainer";
import SectionHeader from "@/components/SectionHeader";

export default function CommunityScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [trendingTopics, setTrendingTopics] = useState([
    { name: "戒烟技巧", count: 156 },
    { name: "心理支持", count: 89 },
    { name: "运动代替", count: 67 },
    { name: "健康饮食", count: 45 },
  ]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    loadCommunityPosts();
  }, []);

  const loadCommunityPosts = async () => {
    try {
      const response = await fetch("/api/community/posts");
      if (response.ok) {
        const posts = await response.json();
        setCommunityPosts(
          posts.map((post) => ({
            id: post.id,
            author: post.author || "Anonymous",
            timeAgo: formatTimeAgo(post.created_at),
            content: post.content,
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            isLiked: false,
            category: post.category || "分享",
            streak: post.streak || 0,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading community posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "刚刚";
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays === 1) return "昨天";
    return `${diffDays}天前`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCommunityPosts();
  };

  const toggleLike = (postId) => {
    setCommunityPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  if (!fontsLoaded || loading) {
    return (
      <ScreenContainer>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: isDark ? "#8F8F8F" : "#8E8E93",
            }}
          >
            加载社区内容...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!fontsLoaded) {
    return null;
  }

  const getCategoryColor = (category) => {
    const colors = {
      戒烟: "#E91E63",
      戒酒: "#2196F3",
      戒游戏: "#FF9800",
      戒色情: "#9C27B0",
      戒糖: "#4CAF50",
    };
    return colors[category] || "#666";
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 28,
              color: isDark ? "#fff" : "#000",
              letterSpacing: -0.5,
            }}
          >
            戒断社区
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: isDark ? "#8F8F8F" : "#8E8E93",
              marginTop: 4,
            }}
          >
            与同路人分享经验
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? "#1E1E1E" : "#fff",
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#E0E0E0",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Search size={20} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: isDark ? "#fff" : "#000",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={20} color={isDark ? "#000" : "#fff"} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: isDark ? "#000" : "#fff",
                  marginLeft: 8,
                }}
              >
                分享动态
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: isDark ? "#1E1E1E" : "#fff",
                borderWidth: 1,
                borderColor: isDark ? "#333" : "#E0E0E0",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={20} color={isDark ? "#fff" : "#000"} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: isDark ? "#fff" : "#000",
                  marginLeft: 8,
                }}
              >
                加入群组
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Topics */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ paddingHorizontal: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <TrendingUp size={20} color={isDark ? "#fff" : "#000"} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: isDark ? "#fff" : "#000",
                  marginLeft: 8,
                }}
              >
                热门话题
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
          >
            {trendingTopics.map((topic, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: isDark ? "#fff" : "#000",
                  }}
                >
                  {topic.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: isDark ? "#8F8F8F" : "#8E8E93",
                    marginLeft: 4,
                  }}
                >
                  • {topic.count}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Posts */}
        <View style={{ paddingHorizontal: 20 }}>
          <SectionHeader title="最新动态" />

          {communityPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#fff",
                borderWidth: 1,
                borderColor: isDark ? "#333" : "#E6E6E6",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {/* Post Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isDark ? "#2A2A2A" : "#F0F0F0",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <User size={20} color={isDark ? "#fff" : "#000"} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 16,
                        color: isDark ? "#fff" : "#000",
                      }}
                    >
                      {post.author}
                    </Text>
                    <View
                      style={{
                        backgroundColor: getCategoryColor(post.category) + "20",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginLeft: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 10,
                          color: getCategoryColor(post.category),
                        }}
                      >
                        {post.category}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: isDark ? "#2A2A2A" : "#F0F0F0",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginLeft: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 10,
                          color: isDark ? "#8F8F8F" : "#8E8E93",
                        }}
                      >
                        {post.streak}天
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#8F8F8F" : "#8E8E93",
                      marginTop: 2,
                    }}
                  >
                    {post.timeAgo}
                  </Text>
                </View>
              </View>

              {/* Post Content */}
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#fff" : "#000",
                  lineHeight: 22,
                  marginBottom: 16,
                }}
              >
                {post.content}
              </Text>

              {/* Post Actions */}
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 24 }}
              >
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                  onPress={() => toggleLike(post.id)}
                >
                  <Heart
                    size={20}
                    color={
                      post.isLiked ? "#E91E63" : isDark ? "#8F8F8F" : "#8E8E93"
                    }
                    fill={post.isLiked ? "#E91E63" : "none"}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: post.isLiked
                        ? "#E91E63"
                        : isDark
                          ? "#8F8F8F"
                          : "#8E8E93",
                      marginLeft: 4,
                    }}
                  >
                    {post.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <MessageCircle
                    size={20}
                    color={isDark ? "#8F8F8F" : "#8E8E93"}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: isDark ? "#8F8F8F" : "#8E8E93",
                      marginLeft: 4,
                    }}
                  >
                    {post.comments}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
