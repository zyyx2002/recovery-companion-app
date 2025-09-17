import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import {
  Trophy,
  Star,
  Medal,
  Calendar,
  Target,
  Heart,
  Crown,
  Award,
  Lock,
  Zap,
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

export default function AchievementsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedTab, setSelectedTab] = useState("已获得");
  
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      name: "初心者",
      description: "开始你的戒断之旅",
      icon: Star,
      color: "#4CAF50",
      points: 50,
      earned: true,
      earnedDate: "2024-01-15",
      progress: 100,
      requirement: "开始第一次戒断",
    },
    {
      id: 2,
      name: "坚持一周",
      description: "连续7天成功戒断",
      icon: Calendar,
      color: "#2196F3",
      points: 100,
      earned: true,
      earnedDate: "2024-01-22",
      progress: 100,
      requirement: "连续戒断7天",
    },
    {
      id: 3,
      name: "坚持一月",
      description: "连续30天成功戒断",
      icon: Medal,
      color: "#FF9800",
      points: 300,
      earned: false,
      progress: 23,
      requirement: "连续戒断30天",
      currentStreak: 23,
    },
    {
      id: 4,
      name: "任务达人",
      description: "完成50个任务",
      icon: Target,
      color: "#9C27B0",
      points: 200,
      earned: false,
      progress: 72,
      requirement: "完成50个任务",
      currentProgress: 36,
    },
    {
      id: 5,
      name: "社区之星",
      description: "获得100个点赞",
      icon: Heart,
      color: "#E91E63",
      points: 150,
      earned: false,
      progress: 45,
      requirement: "获得100个点赞",
      currentProgress: 45,
    },
    {
      id: 6,
      name: "持之以恒",
      description: "连续100天成功戒断",
      icon: Crown,
      color: "#FFC107",
      points: 500,
      earned: false,
      progress: 23,
      requirement: "连续戒断100天",
      currentStreak: 23,
    },
  ]);

  const [userStats, setUserStats] = useState({
    totalPoints: 350,
    totalAchievements: 2,
    currentLevel: 3,
    nextLevelPoints: 500,
  });

  const tabs = ["已获得", "进行中", "全部"];

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const getFilteredAchievements = () => {
    switch (selectedTab) {
      case "已获得":
        return achievements.filter(a => a.earned);
      case "进行中":
        return achievements.filter(a => !a.earned && a.progress > 0);
      case "全部":
        return achievements;
      default:
        return achievements;
    }
  };

  const levelProgress = (userStats.totalPoints % 100) / 100 * 100;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 28,
            color: isDark ? "#fff" : "#000",
            letterSpacing: -0.5,
          }}
        >
          荣誉墙
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: isDark ? "#8F8F8F" : "#8E8E93",
            marginTop: 4,
          }}
        >
          记录你的每一个成就
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Level Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#fff",
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#E6E6E6",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#FFC107" + "20",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Crown size={40} color="#FFC107" />
            </View>
            
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 24,
                color: isDark ? "#fff" : "#000",
                marginBottom: 4,
              }}
            >
              等级 {userStats.currentLevel}
            </Text>
            
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#8F8F8F" : "#8E8E93",
                marginBottom: 16,
              }}
            >
              总积分 {userStats.totalPoints} • 下一级需要 {userStats.nextLevelPoints - userStats.totalPoints} 积分
            </Text>

            {/* Level Progress Bar */}
            <View
              style={{
                width: "100%",
                height: 8,
                backgroundColor: isDark ? "#2A2A2A" : "#F0F0F0",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${levelProgress}%`,
                  height: "100%",
                  backgroundColor: "#FFC107",
                }}
              />
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#1E1E1E" : "#F8F3FF",
                borderRadius: 16,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Trophy size={24} color="#4CAF50" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#fff" : "#000",
                  marginTop: 8,
                }}
              >
                {userStats.totalAchievements}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                  textAlign: "center",
                }}
              >
                已获得
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#1E1E1E" : "#F8F8FF",
                borderRadius: 16,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Target size={24} color="#FF9800" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#fff" : "#000",
                  marginTop: 8,
                }}
              >
                {achievements.filter(a => !a.earned && a.progress > 0).length}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                  textAlign: "center",
                }}
              >
                进行中
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#1E1E1E" : "#F0F8FF",
                borderRadius: 16,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Zap size={24} color="#2196F3" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#fff" : "#000",
                  marginTop: 8,
                }}
              >
                {userStats.totalPoints}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                  textAlign: "center",
                }}
              >
                总积分
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
              borderRadius: 16,
              padding: 4,
            }}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={{
                  flex: 1,
                  backgroundColor: selectedTab === tab 
                    ? (isDark ? "#fff" : "#000")
                    : "transparent",
                  borderRadius: 12,
                  paddingVertical: 8,
                  alignItems: "center",
                }}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: selectedTab === tab
                      ? (isDark ? "#000" : "#fff")
                      : (isDark ? "#8F8F8F" : "#8E8E93"),
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievements List */}
        <View style={{ paddingHorizontal: 20 }}>
          <SectionHeader 
            title={selectedTab} 
            subtitle={`• ${getFilteredAchievements().length}个成就`}
          />

          {getFilteredAchievements().map((achievement) => (
            <View
              key={achievement.id}
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#fff",
                borderWidth: 1,
                borderColor: isDark ? "#333" : "#E6E6E6",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                opacity: achievement.earned ? 1 : 0.8,
              }}
            >
              {/* Achievement Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: achievement.earned 
                      ? achievement.color + "20"
                      : isDark ? "#2A2A2A" : "#F0F0F0",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  {achievement.earned ? (
                    <achievement.icon size={24} color={achievement.color} />
                  ) : (
                    <Lock size={24} color={isDark ? "#666" : "#999"} />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: isDark ? "#fff" : "#000",
                      }}
                    >
                      {achievement.name}
                    </Text>
                    {achievement.earned && (
                      <View
                        style={{
                          backgroundColor: achievement.color + "20",
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
                            color: achievement.color,
                          }}
                        >
                          已获得
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: isDark ? "#8F8F8F" : "#8E8E93",
                    }}
                  >
                    {achievement.description}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Zap size={14} color="#FFC107" />
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        color: "#FFC107",
                        marginLeft: 4,
                      }}
                    >
                      {achievement.points}
                    </Text>
                  </View>
                  {achievement.earnedDate && (
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 10,
                        color: isDark ? "#666" : "#999",
                        marginTop: 4,
                      }}
                    >
                      {achievement.earnedDate}
                    </Text>
                  )}
                </View>
              </View>

              {/* Progress for non-earned achievements */}
              {!achievement.earned && achievement.progress > 0 && (
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#8F8F8F" : "#8E8E93",
                      }}
                    >
                      {achievement.requirement}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color: achievement.color,
                      }}
                    >
                      {Math.round(achievement.progress)}%
                    </Text>
                  </View>
                  
                  <View
                    style={{
                      width: "100%",
                      height: 6,
                      backgroundColor: isDark ? "#2A2A2A" : "#F0F0F0",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${achievement.progress}%`,
                        height: "100%",
                        backgroundColor: achievement.color,
                      }}
                    />
                  </View>
                  
                  {achievement.currentProgress && (
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 10,
                        color: isDark ? "#666" : "#999",
                        marginTop: 4,
                        textAlign: "center",
                      }}
                    >
                      当前: {achievement.currentProgress || achievement.currentStreak}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}