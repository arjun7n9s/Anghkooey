import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Mark } from "../components/Mark";
import { Screen } from "../components/Screen";
import { listBoxes } from "../lib/boxes";
import { useAuth } from "../lib/auth";
import { fonts } from "../lib/typography";
import { card, radius, space, theme } from "../lib/theme";

export default function HomeScreen() {
  const { signOut, boxesReady, boxCount, setupError, refreshBoxes } = useAuth();
  const [loggedCount, setLoggedCount] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const boxes = await listBoxes();
      setLoggedCount(boxes.filter((b) => b.itemCount > 0).length);
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
    <Screen style={{ paddingHorizontal: 0 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.stamp} />
        }
      >
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Mark size={22} />
            <Text style={styles.logo}>Anghkooey</Text>
          </View>
          <Pressable onPress={() => signOut()} hitSlop={12} style={styles.signOutBtn}>
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>

        <Text style={styles.sub}>Where your stuff remembers you.</Text>

        {boxesReady && statsLoaded ? (
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{loggedCount}</Text>
              <Text style={styles.statLabel}>logged</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{boxCount}</Text>
              <Text style={styles.statLabel}>labels</Text>
            </View>
          </View>
        ) : null}

        {!boxesReady && !setupError ? (
          <Text style={styles.hint}>Preparing your box labels…</Text>
        ) : null}

        {setupError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{setupError}</Text>
            <Pressable onPress={refreshBoxes} style={styles.errorRetryBtn}>
              <Text style={styles.errorRetry}>Retry setup</Text>
            </Pressable>
          </View>
        ) : null}

        {boxesReady && statsLoaded && loggedCount === 0 ? (
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Getting started</Text>
            <Text style={styles.tipBody}>
              Print your label sheet, stick QRs on boxes, then scan one and speak what’s inside.
            </Text>
          </View>
        ) : null}

        <Link href="/print" asChild>
          <Pressable style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}>
            <Text style={styles.heroEyebrow}>STEP 1</Text>
            <Text style={styles.heroTitle}>Print your labels</Text>
            <Text style={styles.heroSub}>24 QR stickers tied to your account — cut and stick on boxes.</Text>
          </Pressable>
        </Link>

        <Link href="/scan" asChild>
          <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
            <Text style={styles.cardEyebrow}>STEP 2</Text>
            <Text style={styles.cardTitle}>Scan & log by voice</Text>
            <Text style={styles.cardSub}>Scan a label, speak what’s inside while you pack.</Text>
          </Pressable>
        </Link>

        <Link href="/find" asChild>
          <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
            <Text style={styles.cardTitle}>Find something</Text>
            <Text style={styles.cardSub}>Search across every box you’ve logged.</Text>
          </Pressable>
        </Link>

        <Link href="/dashboard" asChild>
          <Pressable style={({ pressed }) => [styles.dashboardCard, pressed && styles.pressed]}>
            <Text style={styles.dashboardEyebrow}>WEB VIEW</Text>
            <Text style={styles.dashboardTitle}>Open dashboard</Text>
            <Text style={styles.dashboardSub}>Full archive view — stats, boxes, and every item at a glance.</Text>
          </Pressable>
        </Link>

        <Link href="/boxes" asChild>
          <Pressable style={styles.ghost}>
            <Text style={styles.ghostText}>My boxes ({boxesReady && statsLoaded ? boxCount : "…"})</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.xl, gap: space.md },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  logo: { fontFamily: fonts.display, fontSize: 48, color: theme.ink, letterSpacing: -1 },
  signOutBtn: { padding: space.sm },
  signOut: { fontFamily: fonts.body, color: theme.faded, fontSize: 13 },
  sub: { fontFamily: fonts.body, color: theme.inkSoft, fontSize: 16, marginBottom: space.xs },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.paperDeep,
    borderRadius: radius.lg,
    padding: card.tight,
    borderWidth: 1,
    borderColor: theme.line,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statNum: { fontFamily: fonts.display, fontSize: 28, color: theme.ink },
  statLabel: { fontFamily: fonts.label, fontSize: 11, color: theme.faded, letterSpacing: 1.2, textTransform: "uppercase" },
  statDivider: { width: 1, height: 36, backgroundColor: theme.line },
  hint: { fontFamily: fonts.body, color: theme.faded, fontSize: 13 },
  tipCard: {
    backgroundColor: theme.paperDeep,
    padding: card.tight,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.wax,
    gap: space.sm,
  },
  tipTitle: { fontFamily: fonts.bodyBold, color: theme.ink, fontSize: 15 },
  tipBody: { fontFamily: fonts.body, color: theme.inkSoft, lineHeight: 21, fontSize: 14 },
  errorBanner: {
    backgroundColor: theme.stamp,
    padding: card.tight,
    borderRadius: radius.md,
    gap: space.sm,
  },
  errorBannerText: { fontFamily: fonts.bodyBold, color: theme.paper, fontSize: 14 },
  errorRetryBtn: { alignSelf: "flex-start" },
  errorRetry: { fontFamily: fonts.bodyBold, color: theme.paper, textDecorationLine: "underline" },
  heroCard: { backgroundColor: theme.stamp, padding: card.hero, borderRadius: radius.lg, gap: space.sm },
  heroEyebrow: { fontFamily: fonts.label, fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: 1.2 },
  heroTitle: { fontFamily: fonts.displaySemi, fontSize: 22, color: theme.paper },
  heroSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.9)" },
  actionCard: {
    backgroundColor: theme.paperDeep,
    padding: card.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.line,
    gap: space.sm,
  },
  cardEyebrow: { fontFamily: fonts.label, fontSize: 11, color: theme.faded, letterSpacing: 1.2 },
  cardTitle: { fontFamily: fonts.displaySemi, fontSize: 20, color: theme.ink },
  cardSub: { fontFamily: fonts.body, color: theme.inkSoft, fontSize: 14, lineHeight: 20 },
  ghost: { alignItems: "center", paddingVertical: space.md },
  ghostText: { fontFamily: fonts.bodyBold, color: theme.stamp },
  dashboardCard: {
    backgroundColor: theme.wax,
    padding: card.default,
    borderRadius: radius.lg,
    gap: space.sm,
  },
  dashboardEyebrow: { fontFamily: fonts.label, fontSize: 11, color: theme.inkSoft, letterSpacing: 1.2 },
  dashboardTitle: { fontFamily: fonts.displaySemi, fontSize: 22, color: theme.paper },
  dashboardSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.9)" },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
