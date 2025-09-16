import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import {
  Target,
  Check,
  Zap,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  Filter,
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

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "深呼吸练习",
      description: "进行5分钟的深呼吸冥想，缓解焦虑情绪",
      category: "心理健康",
      difficulty: 1,
      points: 10,
      isDaily: true,
      completed: true,
      estimatedTime: "5分钟",
    },
    {
      id: 2,
      title: "运动锻炼",
      description: "进行30分钟的身体锻炼，可以是跑步、游泳或健身",
      category: "身体健康",
      difficulty: 2,
      points: 20,
      isDaily: true,
      completed: false,
      estimatedTime: "30分钟",
    },
    {
      id: 3,
      title: "写戒断日记",
      description: "记录今天的感受、挑战和进步",
      category: "自我反思",
      difficulty: 1,
      points: 15,
      isDaily: true,
      completed: false,
      estimatedTime: "10分钟",
    },
    {
      id: 4,
      title: "社交互动",
      description: "与朋友或家人进行有意义的交流，分享正能量",
      category: "社交",
      difficulty: 2,
      points: 25,
      isDaily: false,
      completed: false,
      estimatedTime: "20分钟",
    },
    {
      id: 5,
      title: "学习新技能",
      description: "花时间学习一项新的技能或爱好，转移注意力",
      category: "个人发展",
      difficulty: 3,
      points: 30,
      isDaily: false,
      completed: false,
      estimatedTime: "45分钟",
    },
    {
      id: 6,
      title: "健康饮食",
      description: "选择健康的食物，避免垃圾食品",
      category: "身体健康",
      difficulty: 2,
      points: 20,
      isDaily: true,
      completed: true,
      estimatedTime: "全天",
    },
  ]);

  const categories = ["全部", "心理健康", "身体健康", "自我反思", "社交", "个人发展"];

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const toggleTaskComplete = (taskId) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      1: "#4CAF50", // Easy - Green
      2: "#FF9800", // Medium - Orange  
      3: "#E91E63", // Hard - Pink
    };
    return colors[difficulty] || "#666";
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      1: "简单",
      2: "中等",
      3: "困难",
    };
    return texts[difficulty] || "未知";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "心理健康": "#9C27B0",
      "身体健康": "#4CAF50",
      "自我反思": "#2196F3",
      "社交": "#FF9800",
      "个人发展": "#E91E63",
    };
    return colors[category] || "#666";
  };

  if (!fontsLoaded) {
    return null;
  }

  const filteredTasks = selectedCategory === "全部" 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);
  
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalPointsEarned = tasks
    .filter(task => task.completed)
    .reduce((sum, task) => sum + task.points, 0);

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
            任务墙
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: isDark ? "#8F8F8F" : "#8E8E93",
              marginTop: 4,
            }}
          >
            完成任务获得奖励
          </Text>
        </View>

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
          <Filter size={20} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
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
              <Check size={24} color="#4CAF50" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#fff" : "#000",
                  marginTop: 8,
                }}
              >
                {completedTasksCount}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                  textAlign: "center",
                }}
              >
                已完成
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
              <Zap size={24} color="#FFC107" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#fff" : "#000",
                  marginTop: 8,
                }}
              >
                {totalPointsEarned}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                  textAlign: "center",
                }}
              >
                今日积分
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
              <TrendingUp size={24} color="#2196F3" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#fff" : "#000",
                  marginTop: 8,
                }}
              >
                7
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                  textAlign: "center",
                }}
              >
                连续天数
              </Text>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View style={{ marginBottom: 32 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={{
                  backgroundColor: selectedCategory === category 
                    ? (isDark ? "#fff" : "#000")
                    : (isDark ? "#1E1E1E" : "#F8F9FA"),
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 12,
                }}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: selectedCategory === category
                      ? (isDark ? "#000" : "#fff")
                      : (isDark ? "#fff" : "#000"),
                  }}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tasks List */}
        <View style={{ paddingHorizontal: 20 }}>
          <SectionHeader 
            title={selectedCategory === "全部" ? "所有任务" : selectedCategory} 
            subtitle={`• ${filteredTasks.length}个任务`}
          />

          {filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#fff",
                borderWidth: 1,
                borderColor: isDark ? "#333" : "#E6E6E6",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                opacity: task.completed ? 0.6 : 1,
              }}
              onPress={() => toggleTaskComplete(task.id)}
            >
              {/* Task Header */}
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
                      ? "#4CAF50" 
                      : isDark ? "#2A2A2A" : "#F8F9FA",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  {task.completed ? (
                    <Check size={16} color="#fff" />
                  ) : (
                    <Target size={16} color={isDark ? "#fff" : "#8E8E93"} />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 16,
                        color: isDark ? "#fff" : "#000",
                        textDecorationLine: task.completed ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </Text>
                    {task.isDaily && (
                      <View
                        style={{
                          backgroundColor: "#4CAF50" + "20",
                          borderRadius: 6,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          marginLeft: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 10,
                            color: "#4CAF50",
                          }}
                        >
                          每日
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Tags */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                      style={{
                        backgroundColor: getCategoryColor(task.category) + "20",
                        borderRadius: 6,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 10,
                          color: getCategoryColor(task.category),
                        }}
                      >
                        {task.category}
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: getDifficultyColor(task.difficulty) + "20",
                        borderRadius: 6,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 10,
                          color: getDifficultyColor(task.difficulty),
                        }}
                      >
                        {getDifficultyText(task.difficulty)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Task Description */}
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#8F8F8F" : "#8E8E93",
                  lineHeight: 20,
                  marginBottom: 12,
                }}
              >
                {task.description}
              </Text>

              {/* Task Footer */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Clock size={14} color={isDark ? "#8F8F8F" : "#8E8E93"} />
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#8F8F8F" : "#8E8E93",
                      marginLeft: 4,
                    }}
                  >
                    {task.estimatedTime}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Zap size={14} color="#FFC107" />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: "#FFC107",
                      marginLeft: 4,
                    }}
                  >
                    {task.points} 积分
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}