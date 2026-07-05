import { Pressable, StyleSheet, Text, View } from "react-native";
import { fonts } from "../lib/typography";
import { theme } from "../lib/theme";
import type { FindResult } from "../lib/types";

export function SpecimenCard({
  result,
  onPress,
  rank,
}: {
  result: FindResult;
  onPress: () => void;
  rank?: number;
}) {
  const date = new Date(result.lastTouched).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {rank !== undefined ? (
        <Text style={styles.rank}>#{rank}</Text>
      ) : null}
      <Text style={styles.label}>{result.label}</Text>
      <Text style={styles.meta}>
        Last touched {date}
        {result.locationHint ? ` · ${result.locationHint}` : ""}
      </Text>
      <Text style={styles.snippet} numberOfLines={3}>
        “{result.snippet}”
      </Text>
      {result.items.length > 0 && (
        <Text style={styles.items}>
          {result.items.slice(0, 4).map((i) => i.name).join(" · ")}
          {result.items.length > 4 ? " …" : ""}
        </Text>
      )}
      <Text style={styles.cta}>Locate this box →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.paperDeep,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.line,
    gap: 6,
  },
  rank: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: theme.faded,
    letterSpacing: 1.2,
  },
  label: { fontFamily: fonts.displaySemi, fontSize: 22, color: theme.ink },
  meta: { fontFamily: fonts.body, fontSize: 12, color: theme.wax, fontWeight: "600" },
  snippet: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: theme.inkSoft,
    fontStyle: "italic",
    lineHeight: 21,
    marginTop: 4,
  },
  items: { fontFamily: fonts.body, fontSize: 12, color: theme.faded, marginTop: 4 },
  cta: { fontFamily: fonts.bodyBold, color: theme.stamp, marginTop: 10, fontSize: 14 },
});
