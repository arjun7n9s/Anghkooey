import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { SpecimenCard } from "../components/SpecimenCard";
import { Screen } from "../components/Screen";
import { api } from "../lib/api";
import type { FindResult } from "../lib/types";
import { fonts } from "../lib/typography";
import { theme } from "../lib/theme";

const SUGGESTIONS = ["camera", "cables", "charger", "hoodie", "book", "postcard"];

export default function FindScreen() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [results, setResults] = useState<FindResult[]>([]);
  const [searched, setSearched] = useState(false);

  async function search(term?: string) {
    const q = (term ?? query).trim();
    if (!q) {
      setError("Describe what you’re looking for.");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await api.find(q);
      setResults(res.results);
      setReply(res.voiceReply);
      if (res.results.length === 0) setError("Nothing matched. Log a box first, then try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
      setResults([]);
      setReply("");
    } finally {
      setLoading(false);
    }
  }

  function openLocate(item: FindResult) {
    router.push({
      pathname: "/locate/[token]",
      params: {
        token: item.qrToken,
        label: item.label,
        hint: item.locationHint ?? "",
      },
    });
  }

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>What did you forget?</Text>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Find the old Canon camera…"
        placeholderTextColor={theme.faded}
        onSubmitEditing={() => search()}
      />

      <View style={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => { setQuery(s); search(s); }}>
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <PrimaryButton label={loading ? "Searching…" : "Search my boxes"} onPress={() => search()} disabled={loading} />

      {loading ? <ActivityIndicator color={theme.stamp} style={{ marginTop: 16 }} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {reply && results.length > 0 ? (
        <View style={styles.replyCard}>
          <Text style={styles.reply}>{reply}</Text>
        </View>
      ) : null}

      {!searched && !loading ? (
        <EmptyState
          title="Search your archive"
          body="Log a few boxes first, then search by item name, location, or anything you said while packing."
          actionLabel="Go log a box"
          onAction={() => router.push("/scan")}
        />
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(r) => r.boxId}
        style={{ marginTop: 12, flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          searched && !loading && !error ? (
            <EmptyState title="No matches" body="Try a shorter word or log more items in your boxes." />
          ) : null
        }
        renderItem={({ item, index }) => (
          <SpecimenCard result={item} rank={index + 1} onPress={() => openLocate(item)} />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, flex: 1 },
  title: { fontFamily: fonts.displaySemi, fontSize: 28, color: theme.ink },
  input: {
    fontFamily: fonts.body,
    backgroundColor: theme.paperDeep,
    color: theme.ink,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.line,
  },
  suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: theme.paperDeep,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.line,
  },
  chipText: { fontFamily: fonts.body, color: theme.inkSoft, fontSize: 13 },
  error: { fontFamily: fonts.body, color: theme.error, fontSize: 13 },
  replyCard: {
    backgroundColor: theme.paperDeep,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.wax,
  },
  reply: { fontFamily: fonts.body, color: theme.ink, lineHeight: 22 },
});
