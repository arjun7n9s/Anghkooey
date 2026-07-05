import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { categoryColor, card, radius, space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";
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
  const scale = useRef(new Animated.Value(1)).current;

  const date = new Date(result.lastTouched).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function pressIn() {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }

  function pressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }

  const chips = result.items.slice(0, 4);

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.topRow}>
          <Text style={styles.label}>{result.label}</Text>
          {rank !== undefined ? <Text style={styles.rank}>#{rank}</Text> : null}
        </View>

        {chips.length > 0 ? (
          <View style={styles.chipRow}>
            {chips.map((item) => {
              const color = categoryColor(item.category);
              return (
                <View
                  key={item.id}
                  style={[styles.chip, { borderColor: color, backgroundColor: theme.paperDeep }]}
                >
                  <Text style={[styles.chipText, { color }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.quote}>
          <Text style={styles.quoteText} numberOfLines={3}>
            {result.snippet}
          </Text>
        </View>

        <Text style={styles.touched}>
          📅 Last touched {date}
          {result.locationHint ? ` · ${result.locationHint}` : ""}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.paperDeep,
    padding: card.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.line,
    gap: space.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
  },
  rank: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: theme.faded,
    letterSpacing: -0.3,
    marginTop: space.xs,
  },
  label: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: theme.ink,
    flex: 1,
    letterSpacing: -0.5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    maxWidth: "100%",
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 11,
  },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: theme.stamp,
    paddingLeft: space.md,
    paddingVertical: 2,
  },
  quoteText: {
    fontFamily: fonts.displayItalic,
    fontSize: 15,
    color: theme.inkSoft,
    fontStyle: "italic",
    lineHeight: 22,
  },
  touched: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: theme.faded,
  },
});
