import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedHero } from "../components/AnimatedHero";
import { AngkMark } from "../components/AngkMark";
import { PillButton } from "../components/PillButton";
import { useAuth } from "../lib/auth";
import { cave, space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function submit() {
    setError("");
    if (isSignup && !name.trim()) {
      setError("What should we call you?");
      return;
    }
    setLoading(true);
    try {
      if (isSignup) await signUp(email.trim(), password, name.trim());
      else await signIn(email.trim(), password);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AngkMark size={72} weight="bold" />
        <AnimatedHero
          eyebrow=""
          wordmark="Anghkooey"
          sub="I moved last year. I packed 47 boxes. I labeled four of them."
        />

        <View style={[styles.heroCard, cave.heroCard]}>
          <Text style={styles.cardLabel}>BEGIN YOUR ARCHIVE</Text>
          {isSignup ? (
            <TextInput
              style={styles.input}
              autoCapitalize="words"
              placeholder="Your name"
              placeholderTextColor={theme.faded}
              value={name}
              onChangeText={setName}
            />
          ) : null}
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={theme.faded}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={theme.faded}
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PillButton
            label={loading ? "…" : mode === "signin" ? "Open the archive" : "Create archive"}
            onPress={submit}
            variant="primary"
            size="lg"
            disabled={loading}
            style={styles.fullBtn}
          />
          <PillButton
            label={mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
            variant="ghost"
            size="sm"
            style={styles.fullBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  scroll: {
    padding: space.xxl,
    gap: 28,
    alignItems: "center",
  },
  heroCard: {
    width: "100%",
    gap: space.lg,
    padding: space.xxl,
  },
  cardLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: theme.creamFaint,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  input: {
    padding: cave.field,
    borderRadius: cave.pill,
    borderWidth: 2,
    borderColor: theme.night,
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
    color: theme.night,
    backgroundColor: theme.stamp,
  },
  error: { fontFamily: fonts.bodyBold, color: theme.cream, fontSize: 13 },
  fullBtn: { width: "100%" },
});
