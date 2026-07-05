import { Link, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedHero } from "../components/AnimatedHero";
import { AngkMark } from "../components/AngkMark";
import { CapsuleNav } from "../components/CapsuleNav";
import { PillButton } from "../components/PillButton";
import { StatRow } from "../components/StatRow";
import { listBoxes, listBoxesDetailed } from "../lib/boxes";
import { useAuth } from "../lib/auth";
import { cave, space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

export default function HomeScreen() {
  const { signOut, boxesReady, boxCount, setupError, refreshBoxes } = useAuth();
  const [loggedCount, setLoggedCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const boxes = await listBoxes();
      setLoggedCount(boxes.filter((b) => b.itemCount > 0).length);
      const detailed = await listBoxesDetailed();
      const cats = new Set(detailed.flatMap((b) => b.items.map((i) => i.category ?? "other")));
      setCategoryCount(cats.size);
    } catch {
      /* home still usable */
    } finally {
      setStatsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (boxesReady) loadStats();
    else setStatsLoaded(false);
  }, [boxesReady, loadStats]);

  async function onRefresh() {
    setRefreshing(true);
    await refreshBoxes();
    await loadStats();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <CapsuleNav
        left={<AngkMark size={28} />}
        title="HOME"
        right={
          <Pressable onPress={() => signOut()} hitSlop={12}>
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.stamp} />
        }
      >
        <View style={styles.greeting}>
          <Text style={styles.dateLine}>Sunday, July 5.</Text>
          <AnimatedHero
            eyebrow=""
            wordmark="Your archive."
            sub="Where your stuff remembers you."
            wordmarkSize={38}
          />
        </View>

        <View style={styles.pillRow}>
          <PillButton label="Log a new box" onPress={() => router.push("/scan")} variant="primary" size="lg" style={styles.flex} />
          <PillButton label="Find something" onPress={() => router.push("/find")} variant="ghost" size="lg" style={styles.flex} />
        </View>

        {setupError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{setupError}</Text>
            <Pressable onPress={refreshBoxes}>
              <Text style={styles.errorRetry}>Retry setup</Text>
            </Pressable>
          </View>
        ) : null}

        {boxesReady && statsLoaded ? (
          <View style={[styles.statCard, cave.heroCard]}>
            <StatRow label="Logged" value={loggedCount} />
            <StatRow label="Labels" value={boxCount ?? 0} />
            <StatRow label="Categories" value={categoryCount} isLast />
          </View>
        ) : !setupError ? (
          <Text style={styles.hint}>Preparing your box labels…</Text>
        ) : null}

        <PillButton
          label={`My Stuff (${boxesReady && statsLoaded ? boxCount : "…"})`}
          onPress={() => router.push("/boxes")}
          variant="ghost"
          size="md"
          style={styles.fullBtn}
        />
        <PillButton
          label="Download QR labels"
          onPress={() => router.push("/print")}
          variant="wax"
          size="md"
          style={styles.fullBtn}
        />
        <PillButton
          label="Open dashboard (web)"
          onPress={() => router.push("/dashboard")}
          variant="ghost"
          size="md"
          style={styles.fullBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  scroll: {
    paddingHorizontal: space.xl,
    gap: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.xxl,
  },
  signOut: { fontFamily: fonts.bodyBold, color: theme.cream, fontSize: 13 },
  greeting: { gap: space.sm },
  dateLine: {
    fontFamily: fonts.displayItalic,
    fontSize: 16,
    color: theme.inkSoft,
    fontStyle: "italic",
  },
  pillRow: { flexDirection: "row", gap: space.md },
  flex: { flex: 1 },
  statCard: { padding: 28, gap: 0 },
  fullBtn: { width: "100%" },
  hint: { fontFamily: fonts.body, color: theme.faded, fontSize: 13, textAlign: "center" },
  errorBanner: {
    backgroundColor: theme.night,
    padding: space.lg,
    borderRadius: cave.card,
    gap: space.sm,
  },
  errorBannerText: { fontFamily: fonts.bodyBold, color: theme.cream, fontSize: 14 },
  errorRetry: { fontFamily: fonts.bodyBold, color: theme.stamp, textDecorationLine: "underline" },
});
