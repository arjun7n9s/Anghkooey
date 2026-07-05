import {
  Fraunces_400Regular_Italic,
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
import {
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
  useFonts as useBaloo,
} from "@expo-google-fonts/baloo-2";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { OfflineBanner } from "../components/OfflineBanner";
import { AuthProvider, useAuth } from "../lib/auth";
import { theme } from "../lib/theme";

const fadeScreen = {
  headerShown: false as const,
  animation: "fade" as const,
  animationDuration: 180,
};

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
  const [frauncesLoaded] = useFraunces({
    Fraunces_700Bold,
    Fraunces_600SemiBold,
    Fraunces_400Regular_Italic,
  });
  const [dmLoaded] = useDmSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const [balooLoaded] = useBaloo({
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });

  if (!frauncesLoaded || !dmLoaded || !balooLoaded) return <LoadingScreen />;

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
