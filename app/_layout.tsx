import { toastConfig } from "@/toast.config";
import "../api/url";
import "../global.css";
import "../i18n.config";

import { useStore } from "@/store/store";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from "nativewind";
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

const queryClient = new QueryClient()

export {
  ErrorBoundary
} from 'expo-router';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    JakartaBold: require('../assets/fonts/Jakarta/PlusJakartaSans-Bold.ttf'),
    JakartaExtraBold: require('../assets/fonts/Jakarta/PlusJakartaSans-ExtraBold.ttf'),
    JakartaLight: require('../assets/fonts/Jakarta/PlusJakartaSans-Light.ttf'),
    JakartaMedium: require('../assets/fonts/Jakarta/PlusJakartaSans-Medium.ttf'),
    JakartaSemiBold: require('../assets/fonts/Jakarta/PlusJakartaSans-SemiBold.ttf'),
    Jakarta: require('../assets/fonts/Jakarta/PlusJakartaSans-Regular.ttf'),
  });
  const hasHydrated = useStore.persist.hasHydrated();
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded || !hasHydrated) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const user = useStore(s => s.user)
  React.useEffect(() => {
    if (user) {
      router.replace("/client/dashboard")
    } else {
      router.replace('/auth/otp-verification')
    }

    SplashScreen.hideAsync();
  }, [])

  React.useEffect(() => {
    if (colorScheme == "dark") {
      setColorScheme("light")
    }
  }, [])
  return (
    <GestureHandlerRootView>

      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack initialRouteName="auth" screenOptions={{
            headerShown: false
          }}>
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="client" options={{ headerShown: false }} />
            <Stack.Screen name="nolayout" options={{ headerShown: false, animation: "fade_from_bottom" }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>


  );
}

