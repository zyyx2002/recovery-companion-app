import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";
import {
  Plus,
  Calendar,
  Target,
  Trophy,
  TrendingUp,
  Zap,
  Check,
  Star,
  AlertTriangle,
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

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [currentStreak, setCurrentStreak] = useState(0);
  const [selectedAddiction, setSelectedAddiction] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load user stats and current session
      const statsResponse = await fetch("/api/user/stats");
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setUserStats(stats);
        setCurrentStreak(stats.currentStreak || 0);
        setSelectedAddiction(stats.currentAddiction);
      }

      // Load today's tasks
      const tasksResponse = await fetch("/api/tasks/daily");
      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json();
        setTodayTasks(tasks);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyHelp = () => {
    Alert.alert(
      "紧急支持",
      "感到困难了吗？记住你已经走了这么远，你有力量继续下去。",
      [
        {
          text: "深呼吸练习",
          onPress: () => console.log("Start breathing exercise"),
        },
        { text: "联系朋友", onPress: () => console.log("Contact friend") },
        { text: "取消", style: "cancel" },
      ],
    );
  };

  const markTaskComplete = async (taskId) => {
    try {
      const response = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          completedDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (response.ok) {
        setTodayTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, completed: true } : task,
          ),
        );

        // Refresh user stats after completing task
        const statsResponse = await fetch("/api/user/stats");
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setUserStats(stats);
        }
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  if (!fontsLoaded || loading) {
    return null;
  }

  const completedTasksCount = todayTasks.filter(
    (task) => task.completed,
  ).length;

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
          戒断之旅
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: isDark ? "#8F8F8F" : "#8E8E93",
            marginTop: 4,
          }}
        >
          坚持就是胜利
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Streak Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#fff",
              borderRadius: 24,
              padding: 24,
              alignItems: "center",
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#E6E6E6",
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: isDark ? "#2A2A2A" : "#F8F9FA",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Calendar size={40} color={isDark ? "#fff" : "#000"} />
              </View>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 48,
                  color: isDark ? "#fff" : "#000",
                  marginBottom: 8,
                }}
              >
                {currentStreak}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 18,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                }}
              >
                连续戒断天数
              </Text>
              {selectedAddiction && (
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: isDark ? "#8F8F8F" : "#8E8E93",
                    marginTop: 4,
                  }}
                >
                  {selectedAddiction.name}
                </Text>
              )}
            </View>

            {/* Emergency Support Button */}
            <TouchableOpacity
              style={{
                backgroundColor: "#E91E63",
                borderRadius: 16,
                paddingVertical: 12,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={handleEmergencyHelp}
            >
              <AlertTriangle size={20} color="#fff" />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: "#fff",
                  marginLeft: 8,
                }}
              >
                紧急支持
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
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
              <Target size={24} color={isDark ? "#fff" : "#000"} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#fff" : "#000",
                  marginTop: 8,
                }}
              >
                {completedTasksCount}/{todayTasks.length}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                  textAlign: "center",
                }}
              >
                今日任务
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
              <Star size={24} color={isDark ? "#fff" : "#000"} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#fff" : "#000",
                  marginTop: 8,
                }}
              >
                {userStats?.totalPoints || 0}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                  textAlign: "center",
                }}
              >
                积分
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
              <Trophy size={24} color={isDark ? "#fff" : "#000"} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#fff" : "#000",
                  marginTop: 8,
                }}
              >
                {userStats?.level || 1}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                  textAlign: "center",
                }}
              >
                等级
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ paddingHorizontal: 20 }}>
            <SectionHeader
              title="今日任务"
              subtitle={`• ${completedTasksCount}/${todayTasks.length}`}
              uppercase
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
          >
            {todayTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={{
                  width: 200,
                  backgroundColor: isDark ? "#1E1E1E" : "#fff",
                  borderRadius: 16,
                  padding: 16,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#333" : "#E6E6E6",
                }}
                onPress={() => !task.completed && markTaskComplete(task.id)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: task.completed
                        ? "#2ECC71"
                        : isDark
                          ? "#2A2A2A"
                          : "#F8F9FA",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {task.completed ? (
                      <Check size={16} color="#fff" />
                    ) : (
                      <Target size={16} color={isDark ? "#fff" : "#8E8E93"} />
                    )}
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        color: isDark ? "#fff" : "#000",
                        opacity: task.completed ? 0.6 : 1,
                      }}
                    >
                      {task.title}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: isDark ? "#8F8F8F" : "#8E8E93",
                    lineHeight: 16,
                  }}
                >
                  {task.description}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <Zap size={12} color="#FFC107" />
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: "#FFC107",
                      marginLeft: 4,
                    }}
                  >
                    {task.points} 积分
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20 }}>
          <SectionHeader title="快速操作" uppercase />

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
              onPress={() => showMoodRecordModal()}
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
                记录心情
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
              onPress={() => showMoodHistory()}
            >
              <TrendingUp size={20} color={isDark ? "#fff" : "#000"} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: isDark ? "#fff" : "#000",
                  marginLeft: 8,
                }}
              >
                查看记录
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );

  const showMoodRecordModal = () => {
    Alert.alert("记录今日心情", "选择你今天的心情状态", [
      { text: "😞 很糟糕 (1)", onPress: () => recordMood(1) },
      { text: "😔 不太好 (2)", onPress: () => recordMood(2) },
      { text: "😐 一般般 (3)", onPress: () => recordMood(3) },
      { text: "😊 还不错 (4)", onPress: () => recordMood(4) },
      { text: "😄 很棒！ (5)", onPress: () => recordMood(5) },
      { text: "取消", style: "cancel" },
    ]);
  };

  const recordMood = async (moodRating) => {
    try {
      const response = await fetch("/api/mood/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          moodRating,
          notes: "",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert("成功", result.message);
        // 刷新用户数据
        loadUserData();
      } else {
        Alert.alert("错误", "记录心情失败，请重试");
      }
    } catch (error) {
      console.error("Error recording mood:", error);
      Alert.alert("错误", "网络错误，请检查连接");
    }
  };

  const showMoodHistory = async () => {
    try {
      const response = await fetch("/api/mood/checkin?userId=1&limit=7");
      if (response.ok) {
        const data = await response.json();
        const records = data.moodRecords || [];

        if (records.length === 0) {
          Alert.alert("心情记录", "还没有心情记录，快去记录今天的心情吧！");
          return;
        }

        const moodText = records
          .map((record) => {
            const date = new Date(record.checkin_date).toLocaleDateString(
              "zh-CN",
            );
            const moodEmoji = ["", "😞", "😔", "😐", "😊", "😄"][
              record.mood_rating
            ];
            return `${date}: ${moodEmoji} (${record.mood_rating}/5)`;
          })
          .join("\n");

        Alert.alert("最近心情记录", moodText);
      }
    } catch (error) {
      console.error("Error fetching mood history:", error);
      Alert.alert("错误", "获取记录失败");
    }
  };
}
