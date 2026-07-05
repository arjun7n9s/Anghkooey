import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../lib/theme";
import { fonts } from "../lib/typography";

export function AnimatedHero({
  eyebrow,
  wordmark,
  sub,
  wordmarkSize = 56,
}: {
  eyebrow: string;
  wordmark: string;
  sub: string;
  wordmarkSize?: number;
}) {
  const lineScale = useSharedValue(0);

  useEffect(() => {
    lineScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.exp) });
  }, [lineScale]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: lineScale.value }],
  }));

  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={[styles.wordmark, { fontSize: wordmarkSize }]}>{wordmark}</Text>
      <Animated.View style={[styles.hairline, lineStyle]} />
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 6 },
  eyebrow: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: theme.faded,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  wordmark: {
    fontFamily: fonts.display,
    letterSpacing: -1,
    color: theme.ink,
    textAlign: "center",
  },
  hairline: {
    width: 72,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.paperDeep,
    marginVertical: 6,
  },
  sub: {
    fontFamily: fonts.displayItalic,
    fontSize: 16,
    color: theme.inkSoft,
    maxWidth: 360,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
  },
});
