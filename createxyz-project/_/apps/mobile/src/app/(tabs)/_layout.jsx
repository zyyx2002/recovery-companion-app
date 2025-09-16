import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import {
  Home,
  MessageCircle,
  Users,
  Target,
  Trophy,
} from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#1E1E1E" : "#fff",
          borderTopWidth: 0.5,
          borderTopColor: isDark ? "#333" : "#EDEDED",
          paddingBottom: 10,
          paddingTop: 10,
          height: 90,
        },
        tabBarActiveTintColor: isDark ? "#fff" : "#000000",
        tabBarInactiveTintColor: isDark ? "#8F8F8F" : "#8F929A",
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_400Regular",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={({ focused }) => ({
          title: "今日",
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={24} fill={focused ? color : "none"} />
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: focused ? "Inter_500Medium" : "Inter_400Regular",
          },
        })}
      />
      <Tabs.Screen
        name="ai-companion"
        options={({ focused }) => ({
          title: "AI陪伴",
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} />,
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: focused ? "Inter_500Medium" : "Inter_400Regular",
          },
        })}
      />
      <Tabs.Screen
        name="community"
        options={({ focused }) => ({
          title: "社区",
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: focused ? "Inter_500Medium" : "Inter_400Regular",
          },
        })}
      />
      <Tabs.Screen
        name="tasks"
        options={({ focused }) => ({
          title: "任务墙",
          tabBarIcon: ({ color }) => <Target color={color} size={24} />,
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: focused ? "Inter_500Medium" : "Inter_400Regular",
          },
        })}
      />
      <Tabs.Screen
        name="achievements"
        options={({ focused }) => ({
          title: "荣誉墙",
          tabBarIcon: ({ color }) => <Trophy color={color} size={24} />,
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: focused ? "Inter_500Medium" : "Inter_400Regular",
          },
        })}
      />
    </Tabs>
  );
}