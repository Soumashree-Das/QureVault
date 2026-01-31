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
              backgroundColor: isDark ? "#0f172a" : "#ffffff",
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


//v1 ->working
// import { Tabs } from "expo-router";
// import React from "react";
// import { Platform, Text, TextStyle } from "react-native";

// import { HapticTab } from "@/components/haptic-tab";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";

// type EmojiIconProps = {
//   emoji: string;
//   color: string;
// };

// const EmojiIcon: React.FC<EmojiIconProps> = ({ emoji, color }) => {
//   const style: TextStyle = {
//     fontSize: 22,
//     color,
//     marginTop: 6,
//   };

//   return <Text style={style}>{emoji}</Text>;
// };

// export default function TabLayout(){
//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme ?? "light"];

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarButton: HapticTab,

//         tabBarShowLabel: false,

//         tabBarActiveTintColor: theme.tint,
//         tabBarInactiveTintColor: theme.text + "80",

//         tabBarStyle: {
//           height: Platform.OS === "ios" ? 85 : 65,
//           paddingBottom: Platform.OS === "ios" ? 20 : 8,
//           paddingTop: 6,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           tabBarIcon: ({ color }: { color: string }) => (
//             <EmojiIcon emoji="🏠" color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="explore"
//         options={{
//           tabBarIcon: ({ color }: { color: string }) => (
//             <EmojiIcon emoji="🧭" color={color} />
//           ),
//         }}
//       />
// <Tabs.Screen
//         name="upload"
//         options={{
//           tabBarIcon: ({ color }: { color: string }) => (
//             <EmojiIcon emoji="➕" color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="qr"
//         options={{
//           tabBarIcon: ({ color }: { color: string }) => (
//             <EmojiIcon emoji="📷" color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="profile"
//         options={{
//           tabBarIcon: ({ color }: { color: string }) => (
//             <EmojiIcon emoji="👤" color={color} />
//           ),
//         }}
//       />
      
//     </Tabs>
//   );
// }




















// original expo template
// import { Tabs } from 'expo-router';
// import React from 'react';

// import { HapticTab } from '@/components/haptic-tab';
// import { IconSymbol } from '@/components/ui/icon-symbol';
// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="explore"
//         options={{
//           title: 'Explore',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="qr"
//         options={{
//           title: 'QR Code',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }

// import { Tabs } from "expo-router";
// import React from "react";
// import { Platform } from "react-native";

// import { HapticTab } from "@/components/haptic-tab";
// import { IconSymbol } from "@/components/ui/icon-symbol";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";

// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme ?? "light"];

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarButton: HapticTab,

//         tabBarActiveTintColor: theme.tint,
//         tabBarInactiveTintColor: theme.text + "80",

//         tabBarLabelStyle: {
//           fontSize: 11,
//           marginTop: 2,
//         },

//         tabBarIconStyle: {
//           marginTop: 6,
//         },

//         tabBarStyle: {
//           height: Platform.OS === "ios" ? 85 : 65,
//           paddingBottom: Platform.OS === "ios" ? 20 : 8,
//           paddingTop: 6,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol name="house.fill" size={24} color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="explore"
//         options={{
//           title: "Explore",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol name="paperplane.fill" size={24} color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="qr"
//         options={{
//           title: "QR",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol name="qrcode" size={24} color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol name="person.fill" size={24} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
