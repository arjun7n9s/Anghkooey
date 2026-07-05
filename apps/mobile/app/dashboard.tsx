import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { useAuth } from "../lib/auth";
import { listBoxesDetailed, type BoxDetail } from "../lib/boxes";
import { cave, space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

function CountUp({ value }: { value: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    anim.setValue(0);
    setDisplay(0);
    const listener = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(anim, { toValue: value, duration: 900, useNativeDriver: false }).start();
    return () => anim.removeListener(listener);
  }, [value, anim]);

  return <Text style={styles.countUp}>{display}</Text>;
}

export default function Dashboard() {
  const { session } = useAuth();
  const [boxes, setBoxes] = useState<BoxDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    listBoxesDetailed()
      .then(setBoxes)
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.body}>Sign in to view your dashboard.</Text>
      </SafeAreaView>
    );
  }

  const loggedBoxes = boxes.filter((b) => b.itemCount > 0);
  const totalItems = boxes.reduce((sum, b) => sum + b.itemCount, 0);
  const categories = new Set(boxes.flatMap((b) => b.items.map((i) => i.category ?? "other")));
  const oldest = [...loggedBoxes].sort(
    (a, b) => new Date(a.lastTouched).getTime() - new Date(b.lastTouched).getTime(),
  )[0];
  const oldestLabel = oldest?.label;
  const oldestDate = oldest
    ? new Date(oldest.lastTouched).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : undefined;

  return (
    <SafeAreaView style={styles.safe}>
      <CapsuleNav left={<AngkMark size={28} />} title="DASHBOARD" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroBlock}>
          <AnimatedHero
            eyebrow="YOUR ARCHIVE"
            wordmark="Dashboard"
            sub="Where your stuff remembers you."
            wordmarkSize={72}
          />
          <View style={styles.countRow}>
            <CountUp value={loggedBoxes.length} />
            <Text style={styles.countLabel}> boxes logged</Text>
          </View>
        </View>

        <View style={[styles.statCard, cave.heroCard, { borderRadius: cave.scoop, padding: space.xxl }]}>
          <StatRow label="Logged" value={loggedBoxes.length} />
          <StatRow label="Items" value={totalItems} hint={`Across ${categories.size} categories`} />
          <StatRow
            label="Oldest box"
            value={oldestLabel ?? "—"}
            hint={oldestDate ? `last touched ${oldestDate}` : undefined}
            isLast
          />
        </View>

        {loading ? (
          <Text style={styles.body}>Loading…</Text>
        ) : loggedBoxes.length === 0 ? (
          <Text style={styles.body}>Begin your archive — log your first box.</Text>
        ) : (
          <View style={styles.grid}>
            {loggedBoxes.map((b) => (
              <PillButton
                key={b.id}
                label={`${b.isShared ? "shared · " : ""}${b.label} · ${b.itemCount}`}
                onPress={() => router.push(`/log/${b.qrToken}`)}
                variant="ghost"
                size="md"
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  container: {
    padding: space.xxl,
    gap: space.xl,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  heroBlock: { alignItems: "center", gap: space.lg },
  countRow: { flexDirection: "row", alignItems: "baseline", marginTop: space.sm },
  countUp: { fontFamily: fonts.display, fontSize: 44, color: theme.night, letterSpacing: -1 },
  countLabel: { fontFamily: fonts.body, fontSize: 16, color: theme.inkSoft },
  statCard: { gap: 0 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  body: { fontFamily: fonts.body, fontSize: 16, color: theme.inkSoft, textAlign: "center" },
});
