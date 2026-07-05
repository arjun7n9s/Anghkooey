import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useAuth } from "../lib/auth";
import { theme } from "../lib/theme";

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
      <Text style={styles.sub}>Open your archive of physical stuff.</Text>

      <View style={styles.card}>
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

      <Pressable onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
        <Text style={styles.switch}>
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "center", gap: 14 },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.4, color: theme.faded },
  logo: { fontSize: 40, fontWeight: "700", color: theme.ink, letterSpacing: -1 },
  sub: { color: theme.inkSoft, marginBottom: 12 },
  card: {
    backgroundColor: theme.paperDeep,
    padding: 20,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.line,
  },
  input: {
    backgroundColor: theme.paper,
    color: theme.ink,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.line,
  },
  error: { color: theme.error, fontSize: 13 },
  switch: { color: theme.stamp, textAlign: "center", marginTop: 8, fontSize: 14 },
});
