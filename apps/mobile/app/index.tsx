import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../lib/theme";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Anghkooey</Text>
      <Text style={styles.sub}>A memory layer for your physical stuff.</Text>

      <Link href="/scan" asChild>
        <Pressable style={styles.primary}>
          <Text style={styles.primaryText}>Scan a box</Text>
        </Pressable>
      </Link>

      <Link href="/find" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Find something</Text>
        </Pressable>
      </Link>

      <Text style={styles.hint}>Demo: scan Box #14 or ask for the Canon camera.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 16 },
  logo: { fontSize: 36, fontWeight: "700", color: theme.text, letterSpacing: -1 },
  sub: { fontSize: 16, color: theme.muted, marginBottom: 24 },
  primary: {
    backgroundColor: theme.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: { color: theme.bg, fontSize: 17, fontWeight: "700" },
  secondary: {
    borderColor: theme.muted,
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryText: { color: theme.text, fontSize: 17, fontWeight: "600" },
  hint: { marginTop: 32, color: theme.muted, fontSize: 13, textAlign: "center" },
});
