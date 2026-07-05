import { StyleSheet, Text, View } from "react-native";
import { PillButton } from "./PillButton";
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
  const itemCount = result.items.length;

  return (
    <View style={styles.wrap}>
      <PillButton
        label={`${result.label}  ·  ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        onPress={onPress}
        variant="ghost"
        size="md"
        style={styles.full}
        iconRight={
          rank === 1 ? (
            <Text style={styles.topMatch}>Top match</Text>
          ) : undefined
        }
      />
      {result.locationHint ? (
        <Text style={styles.subLine} numberOfLines={1}>
          From {result.locationHint}. Last touched {date}.
        </Text>
      ) : null}
      {result.snippet ? (
        <Text style={styles.snippet} numberOfLines={2}>
          {result.snippet}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  full: { width: "100%" },
  topMatch: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: theme.cream,
    backgroundColor: theme.paperDeep,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  subLine: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: theme.inkSoft,
    fontStyle: "italic",
    maxWidth: 480,
  },
  snippet: {
    fontFamily: fonts.displayItalic,
    fontSize: 16,
    color: theme.inkSoft,
    fontStyle: "italic",
    maxWidth: 540,
  },
});
