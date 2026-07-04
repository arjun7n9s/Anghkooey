import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../../lib/api";
import { theme } from "../../lib/theme";

export default function FindScreen() {
  const [query, setQuery] = useState("Canon camera");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [label, setLabel] = useState("");

  async function search() {
    setLoading(true);
    try {
      const res = await api.find(query);
      const top = res.results[0];
      if (top) {
        setReply(res.voiceReply);
        setToken(top.qrToken);
        setLabel(top.label);
      } else {
        setReply("Nothing found.");
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find my X</Text>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Find the old Canon camera"
        placeholderTextColor={theme.muted}
        onSubmitEditing={search}
      />
      <Pressable style={styles.btn} onPress={search} disabled={loading}>
        {loading ? <ActivityIndicator color={theme.bg} /> : <Text style={styles.btnText}>Search</Text>}
      </Pressable>

      {reply ? (
        <View style={styles.result}>
          <Text style={styles.resultLabel}>{label}</Text>
          <Text style={styles.resultText}>{reply}</Text>
          {token && (
            <Pressable style={styles.locate} onPress={() => router.push(`/locate/${token}`)}>
              <Text style={styles.locateText}>Find it → camera</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: "700", color: theme.text },
  input: {
    backgroundColor: theme.surface,
    color: theme.text,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  btn: {
    backgroundColor: theme.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: theme.bg, fontWeight: "700" },
  result: {
    marginTop: 16,
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  resultLabel: { color: theme.accent, fontWeight: "700", fontSize: 18 },
  resultText: { color: theme.text, lineHeight: 22 },
  locate: { marginTop: 8, padding: 12, backgroundColor: theme.glow, borderRadius: 10, alignItems: "center" },
  locateText: { color: theme.bg, fontWeight: "700" },
});
