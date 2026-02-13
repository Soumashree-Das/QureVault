import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text, View, TextStyle } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";

/* ===========================
   Emoji Icon
   =========================== */

type EmojiIconProps = {
  emoji: string;
  focused: boolean;
};

const EmojiIcon: React.FC<EmojiIconProps> = ({ emoji, focused }) => {
  const color = focused ? "#1a73e8" : "#94a3b8";

  const iconStyle: TextStyle = {
    fontSize: focused ? 24 : 22,
    color,
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={iconStyle}>{emoji}</Text>

      {focused && (
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 5,
            backgroundColor: "#1a73e8",
            marginTop: 4,
          }}
        />
      )}
    </View>
  );
};

/* ===========================
   Tab Layout
   =========================== */

export default function TabLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,

        // 🔥 Force background correctly
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              backgroundColor: "#ffffff",
            }}
          />
        ),

        tabBarStyle: {
          height: Platform.OS === "ios" ? 86 : 68,
          paddingBottom: Platform.OS === "ios" ? 22 : 10,
          paddingTop: 8,

          backgroundColor: "transparent", // IMPORTANT
          elevation: 0,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#1e293b" : "#e5e7eb",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <EmojiIcon emoji="🏠︎" focused={focused} />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <EmojiIcon emoji="🧭" focused={focused} />
          ),
        }}
      /> */}

      <Tabs.Screen
        name="upload"
        options={{
          tabBarIcon: ({ focused }) => (
            <EmojiIcon emoji="✙" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="pharmacies"
        options={{
          tabBarIcon: ({ focused }) => (
            <EmojiIcon emoji="📌" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <EmojiIcon emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

