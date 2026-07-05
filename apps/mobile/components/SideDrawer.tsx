import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AngkMark } from "./AngkMark";
import { useAuth } from "../lib/auth";
import { useDrawer } from "../lib/drawer";
import { listBoxesDetailed, type BoxDetail } from "../lib/boxes";
import { cave, space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

const WIDTH = 300;

type NavItem = { label: string; route: string; icon: string };

const NAV: NavItem[] = [
  { label: "Home", route: "/", icon: "⌂" },
  { label: "My Stuff", route: "/boxes", icon: "▦" },
  { label: "Find something", route: "/find", icon: "⌕" },
  { label: "Log a new box", route: "/scan", icon: "＋" },
  { label: "Download QR labels", route: "/print", icon: "◫" },
  { label: "Dashboard", route: "/dashboard", icon: "◍" },
];

export function SideDrawer() {
  const { open, closeDrawer } = useDrawer();
  const { displayName, email, signOut } = useAuth();
  const [boxes, setBoxes] = useState<BoxDetail[]>([]);
  const slide = useRef(new Animated.Value(-WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      listBoxesDetailed()
        .then(setBoxes)
        .catch(() => setBoxes([]));
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: -WIDTH, duration: 180, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [open, slide, fade]);

  const owned = boxes.filter((b) => !b.isShared);
  const shared = boxes.filter((b) => b.isShared);
  const loggedCount = owned.filter((b) => b.itemCount > 0).length;
  const totalItems = owned.reduce((sum, b) => sum + b.itemCount, 0);

  function go(route: string) {
    closeDrawer();
    setTimeout(() => router.push(route as never), 120);
  }

  async function handleSignOut() {
    closeDrawer();
    await signOut();
  }

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={closeDrawer}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      </Animated.View>

      <Animated.View style={[styles.panel, { transform: [{ translateX: slide }] }]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <AngkMark size={44} weight="bold" />
            <Text style={styles.name} numberOfLines={1}>
              {displayName || "Your archive"}
            </Text>
            {email ? (
              <Text style={styles.email} numberOfLines={1}>
                {email}
              </Text>
            ) : null}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{loggedCount}</Text>
              <Text style={styles.statLabel}>Logged</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalItems}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{shared.length}</Text>
              <Text style={styles.statLabel}>Shared</Text>
            </View>
          </View>

          <View style={styles.section}>
            {NAV.map((item) => (
              <Pressable key={item.route} style={styles.navItem} onPress={() => go(item.route)}>
                <Text style={styles.navIcon}>{item.icon}</Text>
                <Text style={styles.navLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {shared.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SHARED WITH ME</Text>
              {shared.map((b) => (
                <Pressable
                  key={b.id}
                  style={styles.navItem}
                  onPress={() => go(`/log/${b.qrToken}`)}
                >
                  <Text style={styles.navIcon}>◆</Text>
                  <Text style={styles.navLabel} numberOfLines={1}>
                    {b.label} · {b.itemCount}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable style={styles.signOut} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(21,18,16,0.45)" },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: WIDTH,
    backgroundColor: theme.paperDeep,
    borderRightWidth: 2,
    borderRightColor: theme.night,
  },
  scroll: { padding: space.xl, paddingTop: space.hero, gap: space.xl },
  header: { gap: space.xs, alignItems: "flex-start" },
  name: { fontFamily: fonts.display, fontSize: 24, color: theme.cream, marginTop: space.sm },
  email: { fontFamily: fonts.body, fontSize: 13, color: theme.creamSoft },
  statsRow: {
    flexDirection: "row",
    gap: space.sm,
    backgroundColor: theme.night,
    borderRadius: cave.card,
    padding: space.md,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontFamily: fonts.display, fontSize: 22, color: theme.stamp },
  statLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: theme.creamFaint,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  section: { gap: space.xs },
  sectionTitle: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: theme.creamFaint,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: space.xs,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: cave.pill,
  },
  navIcon: { fontSize: 18, color: theme.stamp, width: 24, textAlign: "center" },
  navLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: theme.cream, flex: 1 },
  signOut: {
    marginTop: space.md,
    backgroundColor: theme.night,
    borderRadius: cave.pill,
    paddingVertical: space.md,
    alignItems: "center",
  },
  signOutText: { fontFamily: fonts.bodyBold, fontSize: 15, color: theme.stamp },
});
