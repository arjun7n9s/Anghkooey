import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Mark } from "../components/Mark";
import { listBoxes } from "../lib/boxes";
import { useAuth } from "../lib/auth";
import { fonts } from "../lib/typography";
import { theme } from "../lib/theme";

export default function HomeScreen() {
  const { signOut, boxesReady, boxCount, setupError, refreshBoxes } = useAuth();
  const [loggedCount, setLoggedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const boxes = await listBoxes();
      setLoggedCount(boxes.filter((b) => b.itemCount > 0).length);
    } catch {
      /* home still usable */
    }
  }, []);

  useEffect(() => {
    if (boxesReady) loadStats();
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
          <Pressable onPress={() => signOut()}>
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>

        <Text style={styles.sub}>Where your stuff remembers you.</Text>

        {boxesReady && (
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
        )}

        {!boxesReady && !setupError ? (
          <Text style={styles.hint}>Preparing your {boxCount || 24} box labels…</Text>
        ) : null}

        {setupError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{setupError}</Text>
            <Pressable onPress={refreshBoxes}>
              <Text style={styles.retry}>Retry setup</Text>
            </Pressable>
          </View>
        ) : null}

        {boxesReady && loggedCount === 0 ? (
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Getting started</Text>
            <Text style={styles.tipBody}>
              Print your label sheet, stick QRs on boxes, then scan one and speak what’s inside.
            </Text>
          </View>
        ) : null}

        <Link href="/print" asChild>
          <Pressable style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>STEP 1</Text>
            <Text style={styles.heroTitle}>Print your labels</Text>
            <Text style={styles.heroSub}>24 QR stickers tied to your account — cut and stick on boxes.</Text>
          </Pressable>
        </Link>

        <Link href="/scan" asChild>
          <Pressable style={styles.actionCard}>
            <Text style={styles.cardEyebrow}>STEP 2</Text>
            <Text style={styles.cardTitle}>Scan & log by voice</Text>
            <Text style={styles.cardSub}>Scan a label, speak what’s inside while you pack.</Text>
          </Pressable>
        </Link>

        <Link href="/find" asChild>
          <Pressable style={styles.actionCard}>
            <Text style={styles.cardTitle}>Find something</Text>
            <Text style={styles.cardSub}>Search across every box you’ve logged.</Text>
          </Pressable>
        </Link>

        <Link href="/dashboard" asChild>
          <Pressable style={styles.dashboardCard}>
            <Text style={styles.dashboardEyebrow}>WEB VIEW</Text>
            <Text style={styles.dashboardTitle}>Open dashboard</Text>
            <Text style={styles.dashboardSub}>Full archive view — stats, boxes, and every item at a glance.</Text>
          </Pressable>
        </Link>

        <Link href="/boxes" asChild>
          <Pressable style={styles.ghost}>
            <Text style={styles.ghostText}>My boxes ({boxCount || "…"})</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { fontFamily: fonts.display, fontSize: 34, color: theme.ink, letterSpacing: -1 },
  signOut: { fontFamily: fonts.body, color: theme.faded, fontSize: 13, marginTop: 8 },
  sub: { fontFamily: fonts.body, color: theme.inkSoft, fontSize: 16, marginBottom: 4 },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.paperDeep,
    borderRadius: 14,
    padding: 16,
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
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: theme.wax,
    gap: 6,
  },
  tipTitle: { fontFamily: fonts.bodyBold, color: theme.ink, fontSize: 15 },
  tipBody: { fontFamily: fonts.body, color: theme.inkSoft, lineHeight: 21, fontSize: 14 },
  errorCard: {
    backgroundColor: theme.paperDeep,
    borderColor: theme.error,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: { fontFamily: fonts.body, color: theme.error, fontSize: 13 },
  retry: { fontFamily: fonts.bodyBold, color: theme.stamp },
  heroCard: { backgroundColor: theme.stamp, padding: 20, borderRadius: 16, gap: 6 },
  heroEyebrow: { fontFamily: fonts.label, fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: 1.2 },
  heroTitle: { fontFamily: fonts.displaySemi, fontSize: 22, color: theme.paper },
  heroSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.9)" },
  actionCard: {
    backgroundColor: theme.paperDeep,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.line,
    gap: 6,
  },
  cardEyebrow: { fontFamily: fonts.label, fontSize: 11, color: theme.faded, letterSpacing: 1.2 },
  cardTitle: { fontFamily: fonts.displaySemi, fontSize: 20, color: theme.ink },
  cardSub: { fontFamily: fonts.body, color: theme.inkSoft, fontSize: 14, lineHeight: 20 },
  ghost: { alignItems: "center", paddingVertical: 12 },
  ghostText: { fontFamily: fonts.bodyBold, color: theme.stamp },
  dashboardCard: {
    backgroundColor: theme.wax,
    padding: 20,
    borderRadius: 16,
    gap: 6,
  },
  dashboardEyebrow: { fontFamily: fonts.label, fontSize: 11, color: theme.inkSoft, letterSpacing: 1.2 },
  dashboardTitle: { fontFamily: fonts.displaySemi, fontSize: 22, color: theme.paper },
  dashboardSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.9)" },
});
