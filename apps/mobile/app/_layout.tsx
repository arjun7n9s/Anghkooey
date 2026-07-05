import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  useFonts as useFraunces,
} from "@expo-google-fonts/fraunces";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts as useDmSans,
} from "@expo-google-fonts/dm-sans";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { AuthProvider, useAuth } from "../lib/auth";
import { theme } from "../lib/theme";

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.paper, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <ActivityIndicator color={theme.stamp} />
      <Text style={{ color: theme.faded, fontFamily: "DMSans_400Regular" }}>Loading…</Text>
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

  if (loading) return <LoadingScreen />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.paper },
        headerTintColor: theme.ink,
        headerTitleStyle: { fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
        contentStyle: { backgroundColor: theme.paper },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="boxes" options={{ title: "My boxes" }} />
      <Stack.Screen name="print" options={{ title: "Print labels" }} />
      <Stack.Screen name="scan" options={{ title: "Scan label" }} />
      <Stack.Screen name="find" options={{ title: "Find" }} />
      <Stack.Screen name="log/[token]" options={{ title: "Log box" }} />
      <Stack.Screen name="locate/[token]" options={{ title: "Locate" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [frauncesLoaded] = useFraunces({ Fraunces_700Bold, Fraunces_600SemiBold });
  const [dmLoaded] = useDmSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  if (!frauncesLoaded || !dmLoaded) return <LoadingScreen />;

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <GuardedStack />
    </AuthProvider>
  );
}
