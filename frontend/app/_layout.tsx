import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';


import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // <ThemeProvider value={DefaultTheme}>
    //   <Stack
    //     screenOptions={{
    //       headerShown: false, // ✅ This hides headers for ALL screens by default
    //     }}
    //   >
    //     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    //     <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
      
    //   </Stack>
    //   <StatusBar style="auto" />
    // </ThemeProvider>
     <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* This allows ALL routes to work */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}