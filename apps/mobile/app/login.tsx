import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useAuth } from "../lib/auth";
import { fonts } from "../lib/typography";
import { card, radius, space, theme } from "../lib/theme";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") await signIn(email.trim(), password);
      else await signUp(email.trim(), password);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen style={styles.container}>
      <Text style={styles.eyebrow}>YOUR BOX MEMORY</Text>
      <Text style={styles.logo}>Anghkooey</Text>
      <Text style={styles.epigraph}>
        I moved last year. I packed 47 boxes. I labeled four of them.
      </Text>
      <Text style={styles.sub}>Open your archive of physical stuff.</Text>

      <View style={styles.formCard}>
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

        <PrimaryButton
          label={loading ? "…" : mode === "signin" ? "Enter archive" : "Create archive"}
          onPress={submit}
          disabled={loading}
        />
      </View>

      <Pressable
        onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
        style={({ pressed }) => [styles.switchWrap, pressed && styles.switchPressed]}
      >
        <Text style={styles.switch}>
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "center", gap: space.md },
  eyebrow: {
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 1.4,
    color: theme.faded,
  },
  logo: {
    fontFamily: fonts.display,
    fontSize: 56,
    color: theme.ink,
    letterSpacing: -1.5,
  },
  epigraph: {
    fontFamily: fonts.displayItalic,
    fontSize: 16,
    color: theme.inkSoft,
    fontStyle: "italic",
    maxWidth: 320,
    marginTop: space.xs,
    marginBottom: space.xl,
    lineHeight: 24,
  },
  sub: { fontFamily: fonts.body, color: theme.inkSoft, marginBottom: space.md },
  formCard: {
    backgroundColor: theme.paperDeep,
    padding: card.default,
    borderRadius: radius.lg,
    gap: space.md,
    borderWidth: 1,
    borderColor: theme.line,
  },
  input: {
    fontFamily: fonts.body,
    backgroundColor: theme.paper,
    color: theme.ink,
    padding: card.tight,
    borderRadius: radius.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.line,
  },
  error: { fontFamily: fonts.body, color: theme.error, fontSize: 13 },
  switchWrap: { padding: space.sm, alignItems: "center" },
  switchPressed: { opacity: 0.6 },
  switch: {
    fontFamily: fonts.body,
    color: theme.stamp,
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
