import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";
import { listBoxes, type BoxSummary } from "../lib/boxes";
import { fonts } from "../lib/typography";
import { theme } from "../lib/theme";

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
    <Screen style={{ paddingHorizontal: 0 }}>
      <View style={styles.header}>
        <Text style={styles.title}>My boxes</Text>
        <Text style={styles.sub}>
          {logged} of {boxes.length} logged · tap to edit
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={theme.stamp} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={boxes}
          keyExtractor={(b) => b.id}
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
          ListEmptyComponent={
            <EmptyState
              title="No labels yet"
              body="Your account gets 24 box labels on signup. Print them from home to get started."
              actionLabel="Print labels"
              onAction={() => router.push("/print")}
            />
          }
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => router.push(`/log/${item.qrToken}`)}>
              <View style={[styles.statusDot, item.itemCount > 0 && styles.statusLogged]} />
              <View style={styles.rowMain}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.meta}>
                  {item.itemCount} item{item.itemCount === 1 ? "" : "s"}
                  {item.locationHint ? ` · ${item.locationHint}` : ""}
                </Text>
                {item.preview ? (
                  <Text style={styles.preview} numberOfLines={2}>
                    {item.preview}
                  </Text>
                ) : (
                  <Text style={styles.emptyRow}>Empty — tap to log</Text>
                )}
              </View>
              <Text style={styles.chevron}>→</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 12, gap: 4 },
  title: { fontFamily: fonts.displaySemi, fontSize: 28, color: theme.ink },
  sub: { fontFamily: fonts.body, color: theme.inkSoft, fontSize: 14 },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.paperDeep,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.line,
    marginBottom: 10,
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.line,
  },
  statusLogged: { backgroundColor: theme.wax },
  rowMain: { flex: 1, gap: 4 },
  label: { fontFamily: fonts.bodyBold, fontSize: 17, color: theme.ink },
  meta: { fontFamily: fonts.body, fontSize: 12, color: theme.faded },
  preview: { fontFamily: fonts.body, fontSize: 13, color: theme.inkSoft, fontStyle: "italic", marginTop: 4 },
  emptyRow: { fontFamily: fonts.body, fontSize: 13, color: theme.faded, fontStyle: "italic" },
  chevron: { fontFamily: fonts.bodyBold, color: theme.stamp, fontSize: 18 },
  error: { fontFamily: fonts.body, color: theme.error, paddingHorizontal: 24, marginBottom: 8 },
});
