import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl } from "@workspace/api-client-react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Web (browser): always use the domain directly — proxy or mTLS handles routing.
// Native dev (Expo Go): EXPO_PUBLIC_API_PORT=8080 is set in the dev script so
//   the phone bypasses the mTLS proxy and hits the publicly-exposed port.
// Native prod (chilludon.replit.app): no port set — serve.js proxies /api/ to
//   localhost:8080 so the same domain works for everything.
const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
const apiPort = process.env.EXPO_PUBLIC_API_PORT;
const apiBase = Platform.OS === "web" || !apiPort
  ? `https://${domain}`
  : `https://${domain}:${apiPort}`;
setBaseUrl(apiBase);

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="(student)" options={{ headerShown: false }} />
      <Stack.Screen name="(police)" options={{ headerShown: false }} />
      <Stack.Screen name="(company)" options={{ headerShown: false }} />
      <Stack.Screen name="(citizen)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
