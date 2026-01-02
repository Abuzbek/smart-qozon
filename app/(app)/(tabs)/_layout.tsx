import { Tabs } from "expo-router";
import { Heart, Home, Settings } from "lucide-react-native";
import React from "react";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].text,
        headerShown: false,
        tabBarStyle: {
          backgroundColor:
            colorScheme === "dark"
              ? Colors.light.primary
              : Colors.light.background,
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: -2 },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Boridan Yo'q",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Sevimlilar",
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Sozlamalar",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
