import {
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { OfflineBanner } from "../components/OfflineBanner";
import { AuthProvider, useAuth } from "../lib/auth";
import { theme } from "../lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

const fadeScreen = {
  headerShown: false as const,
  animation: "fade" as const,
  animationDuration: 180,
};

const SUPABASE_CONFIGURED = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

function LoadingScreen({ message = "Loading…" }: { message?: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.paper,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
      }}
    >
      <ActivityIndicator color={theme.stamp} size="large" />
      <Text style={{ color: theme.ink, fontSize: 16, textAlign: "center" }}>{message}</Text>
    </View>
  );
}

function ConfigErrorScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.paper,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 32,
      }}
    >
      <Text style={{ color: theme.night, fontSize: 20, fontWeight: "700", textAlign: "center" }}>
        Missing Supabase config
      </Text>
      <Text style={{ color: theme.inkSoft, fontSize: 15, textAlign: "center", lineHeight: 22 }}>
        EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set at build time. Rebuild
        the APK with the preview profile env vars in eas.json.
      </Text>
    </View>
  );
}

function GuardedStack() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const onLogin = segments[0] === "login";

  useEffect(() => {
    if (loading) return;
    if (!session && !onLogin) router.replace("/login");
    if (session && onLogin) router.replace("/");
  }, [loading, session, onLogin, router]);

  if (loading) return <LoadingScreen message="Opening your archive…" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.paper },
        headerTintColor: theme.ink,
        headerTitleStyle: { fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
        contentStyle: { backgroundColor: theme.paper },
        headerShadowVisible: false,
        animation: "fade",
        animationDuration: 180,
      }}
    >
      <Stack.Screen name="login" options={fadeScreen} />
      <Stack.Screen name="index" options={fadeScreen} />
      <Stack.Screen name="dashboard" options={fadeScreen} />
      <Stack.Screen name="boxes" options={fadeScreen} />
      <Stack.Screen name="print" options={{ title: "Print labels" }} />
      <Stack.Screen name="scan" options={{ title: "Scan label", ...fadeScreen }} />
      <Stack.Screen name="find" options={fadeScreen} />
      <Stack.Screen name="log/[token]" options={fadeScreen} />
      <Stack.Screen name="locate/[token]" options={{ title: "Locate" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsTimedOut, setFontsTimedOut] = useState(false);
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Fraunces_700Bold,
    Fraunces_600SemiBold,
    Fraunces_400Regular_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });

  const fontsReady = fontsLoaded || Boolean(fontError) || fontsTimedOut;

  useEffect(() => {
    const timer = setTimeout(() => setFontsTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontError) console.warn("[Anghkooey] Font load error:", fontError);
  }, [fontError]);

  useEffect(() => {
    if (fontsReady && SUPABASE_CONFIGURED) {
      SplashScreen.hideAsync().catch(() => {});
      setAppReady(true);
    }
  }, [fontsReady]);

  if (!SUPABASE_CONFIGURED) {
    SplashScreen.hideAsync().catch(() => {});
    return <ConfigErrorScreen />;
  }

  if (!fontsReady) {
    return <LoadingScreen message="Loading fonts…" />;
  }

  if (!appReady) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <OfflineBanner />
        <GuardedStack />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
