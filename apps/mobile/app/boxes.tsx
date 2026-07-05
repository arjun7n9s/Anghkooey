import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AngkMark } from "../components/AngkMark";
import { CapsuleNav } from "../components/CapsuleNav";
import { PillButton } from "../components/PillButton";
import { listBoxes, type BoxSummary } from "../lib/boxes";
import { cave, space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

function StatusDot({ logged }: { logged: boolean }) {
  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: logged ? theme.stamp : theme.creamFaint,
        borderWidth: 1.5,
        borderColor: theme.night,
      }}
    />
  );
}

export default function BoxesScreen() {
  const [boxes, setBoxes] = useState<BoxSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setBoxes(await listBoxes());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load boxes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const logged = boxes.filter((b) => b.itemCount > 0).length;

  return (
    <SafeAreaView style={styles.safe}>
      <CapsuleNav left={<AngkMark size={28} />} title="MY STUFF" />
      <Text style={styles.subheader}>
        {logged} of {boxes.length} logged
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={theme.stamp} style={{ marginTop: space.xxl }} />
      ) : boxes.length === 0 ? (
        <View style={[styles.empty, cave.heroCard]}>
          <Text style={styles.emptyTitle}>Begin your archive.</Text>
          <Text style={styles.emptyBody}>
            Your archive is empty. Stick a label on a box and speak what&apos;s inside.
          </Text>
        </View>
      ) : (
        <FlatList
          data={boxes}
          keyExtractor={(b) => `${b.id}-${b.isShared ? "shared" : "own"}`}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={theme.stamp}
            />
          }
          renderItem={({ item }) => (
            <PillButton
              label={`${item.isShared ? "(shared) " : ""}${item.label}`}
              onPress={() => router.push(`/log/${item.qrToken}`)}
              variant="ghost"
              size="md"
              style={styles.rowBtn}
              iconRight={<StatusDot logged={item.itemCount > 0} />}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  subheader: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: theme.faded,
    textAlign: "center",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: space.sm,
  },
  list: { padding: space.xl, gap: space.md },
  rowBtn: { width: "100%" },
  empty: {
    margin: space.xl,
    padding: space.xxl,
    alignItems: "center",
    gap: space.sm,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: theme.cream,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: fonts.displayItalic,
    fontSize: 15,
    color: theme.creamSoft,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
  },
  error: {
    fontFamily: fonts.bodyBold,
    color: theme.night,
    textAlign: "center",
    paddingHorizontal: space.xl,
  },
});
