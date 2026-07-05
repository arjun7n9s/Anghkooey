import { useEffect, useRef, useState } from "react";
import { Animated, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { useAuth } from "../lib/auth";
import { listBoxesDetailed, type BoxDetail } from "../lib/boxes";
import { theme } from "../lib/theme";
import { fonts } from "../lib/typography";

function CountUp({ value }: { value: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    anim.setValue(0);
    const listener = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(anim, { toValue: value, duration: 900, useNativeDriver: false }).start();
    return () => {
      anim.removeListener(listener);
      anim.removeAllListeners();
    };
  }, [value, anim]);

  return <Text style={styles.statNum}>{display}</Text>;
}

function BoxCard({ box, index }: { box: BoxDetail; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={[styles.boxCard, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.boxHeader}>
        <Text style={styles.boxLabel}>{box.label}</Text>
        {box.isShared ? <Text style={styles.sharedBadge}>Shared with you</Text> : null}
      </View>
      {box.locationHint ? <Text style={styles.boxHint}>📍 {box.locationHint}</Text> : null}
      <Text style={styles.boxItems}>
        {box.items.slice(0, 4).map((i) => i.name).join(" · ") || "Empty box"}
      </Text>
      {box.items.length > 4 ? <Text style={styles.boxMore}>+{box.items.length - 4} more</Text> : null}
    </Animated.View>
  );
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
      <Screen>
        <Text style={styles.body}>Sign in to view your dashboard.</Text>
      </Screen>
    );
  }

  const loggedBoxes = boxes.filter((b) => b.itemCount > 0);
  const totalItems = boxes.reduce((sum, b) => sum + b.itemCount, 0);
  const categories = new Set(boxes.flatMap((b) => b.items.map((i) => i.category ?? "other")));

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.wordmark}>Anghkooey</Text>
        <Text style={styles.heroEyebrow}>YOUR ARCHIVE</Text>
        <Text style={styles.heroTitle}>Dashboard</Text>
        <Text style={styles.sub}>Where your stuff remembers you.</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <CountUp value={loggedBoxes.length} />
            <Text style={styles.statLabel}>logged</Text>
          </View>
          <View style={styles.statCard}>
            <CountUp value={totalItems} />
            <Text style={styles.statLabel}>items</Text>
          </View>
          <View style={styles.statCard}>
            <CountUp value={categories.size} />
            <Text style={styles.statLabel}>categories</Text>
          </View>
        </View>

        {loading ? (
          <Text style={styles.body}>Loading…</Text>
        ) : loggedBoxes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No boxes logged yet</Text>
            <Text style={styles.body}>Print labels, scan a QR, and speak what’s inside.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {loggedBoxes.map((b, index) => (
              <BoxCard key={b.id} box={b} index={index} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const cardWidth = Platform.OS === "web" ? "31%" : "100%";

const styles = StyleSheet.create({
  container: {
    padding: Platform.OS === "web" ? 48 : 24,
    gap: 20,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: theme.stamp,
    letterSpacing: -0.5,
  },
  heroEyebrow: { fontFamily: fonts.label, fontSize: 12, color: theme.faded, letterSpacing: 2 },
  heroTitle: { fontFamily: fonts.display, fontSize: Platform.OS === "web" ? 72 : 48, color: theme.ink, letterSpacing: -2 },
  sub: { fontFamily: fonts.body, fontSize: 18, color: theme.inkSoft, marginBottom: 8 },
  statsRow: { flexDirection: "row", gap: 16 },
  statCard: {
    flex: 1,
    backgroundColor: theme.paperDeep,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.line,
  },
  statNum: { fontFamily: fonts.display, fontSize: Platform.OS === "web" ? 56 : 40, color: theme.ink, letterSpacing: -2 },
  statLabel: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: theme.faded,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 4,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  boxCard: {
    width: cardWidth,
    minWidth: 280,
    backgroundColor: theme.paperDeep,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.line,
    gap: 8,
  },
  boxHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  boxLabel: { fontFamily: fonts.displaySemi, fontSize: 28, color: theme.ink, letterSpacing: -0.5, flex: 1 },
  sharedBadge: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: theme.wax,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 6,
  },
  boxHint: { fontFamily: fonts.body, fontSize: 14, color: theme.inkSoft, fontStyle: "italic" },
  boxItems: { fontFamily: fonts.body, fontSize: 15, color: theme.ink, lineHeight: 22 },
  boxMore: { fontFamily: fonts.bodyBold, fontSize: 13, color: theme.stamp },
  emptyCard: {
    backgroundColor: theme.paperDeep,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.line,
    gap: 8,
  },
  emptyTitle: { fontFamily: fonts.displaySemi, fontSize: 24, color: theme.ink },
  body: { fontFamily: fonts.body, fontSize: 16, color: theme.inkSoft, lineHeight: 24 },
});
