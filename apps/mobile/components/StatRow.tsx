import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

export function StatRow({
  label,
  value,
  unit,
  hint,
  isLast,
  onPress,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  isLast?: boolean;
  onPress?: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const content = (
    <Animated.View
      style={[
        styles.row,
        !isLast && styles.divider,
        onPress ? { transform: [{ scale }] } : null,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.timing(scale, { toValue: 0.98, duration: 80, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 4 }).start()
      }
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: space.lg,
    paddingHorizontal: space.sm,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.creamLine,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.label,
    letterSpacing: 1.2,
    color: theme.creamFaint,
    textTransform: "uppercase",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: space.sm,
    marginTop: space.xs,
  },
  value: {
    fontSize: 26,
    fontFamily: fonts.display,
    color: theme.cream,
  },
  unit: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: theme.creamSoft,
  },
  hint: {
    fontSize: 13,
    fontFamily: fonts.displayItalic,
    color: theme.creamSoft,
    fontStyle: "italic",
    marginTop: space.xs,
  },
});
