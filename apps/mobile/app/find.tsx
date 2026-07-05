import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { AngkMark } from "../components/AngkMark";
import { CapsuleNav } from "../components/CapsuleNav";
import { SpecimenCard } from "../components/SpecimenCard";
import { api } from "../lib/api";
import { speakReply } from "../lib/speak";
import type { FindResult } from "../lib/types";
import { cave, space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

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
      setError("Describe what you're looking for.");
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
    <SafeAreaView style={styles.safe}>
      <CapsuleNav left={<AngkMark size={28} />} title="FIND" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>FIND ANYTHING</Text>
          <Text style={styles.title}>What are you looking for?</Text>
          <Text style={styles.sub}>Speak it. Type it. The app remembers.</Text>
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Find the old Canon camera…"
            placeholderTextColor={theme.faded}
            onSubmitEditing={() => search()}
          />
          {loading ? <ActivityIndicator color={theme.stamp} style={{ marginTop: space.md }} /> : null}
        </View>

        <Text style={styles.searchBtn} onPress={() => search()}>
          Search my boxes
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {reply && results.length > 0 ? (
          <View style={[styles.replyCard, cave.heroCard]}>
            <Text style={styles.replyLabel}>ANGHKOOEY REPLIES</Text>
            <Text style={styles.replyText}>{reply}</Text>
            <Text style={styles.listen} onPress={() => speakReply(reply)}>
              🔊 Listen to reply
            </Text>
          </View>
        ) : null}

        <View style={styles.results}>
          {results.map((item, index) => (
            <Animated.View key={`${item.boxId}-${item.qrToken}`} entering={FadeInDown.delay(index * 60)}>
              <SpecimenCard result={item} rank={index + 1} onPress={() => openLocate(item)} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  scroll: {
    padding: space.xxl,
    gap: space.lg,
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },
  hero: { alignItems: "center", gap: space.sm },
  eyebrow: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: theme.faded,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: theme.ink,
    textAlign: "center",
    letterSpacing: -1,
  },
  sub: {
    fontFamily: fonts.displayItalic,
    fontSize: 16,
    color: theme.inkSoft,
    fontStyle: "italic",
    textAlign: "center",
  },
  searchWrap: { maxWidth: 540, width: "100%", alignSelf: "center" },
  input: {
    borderRadius: cave.pill,
    paddingVertical: 18,
    paddingHorizontal: space.xl,
    fontSize: 18,
    borderWidth: 2,
    borderColor: theme.night,
    color: theme.night,
    fontFamily: fonts.bodyMedium,
    backgroundColor: theme.stamp,
  },
  searchBtn: {
    fontFamily: fonts.bodyBold,
    color: theme.cream,
    backgroundColor: theme.night,
    textAlign: "center",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: cave.pill,
    alignSelf: "center",
    overflow: "hidden",
  },
  error: { fontFamily: fonts.bodyBold, color: theme.night, textAlign: "center" },
  replyCard: { padding: 28, gap: 14 },
  replyLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: theme.creamFaint,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  replyText: {
    fontFamily: fonts.displayItalic,
    fontSize: 28,
    color: theme.cream,
    fontStyle: "italic",
    lineHeight: 36,
  },
  listen: { fontFamily: fonts.bodyBold, color: theme.stamp, fontSize: 14 },
  results: { gap: space.md },
});
