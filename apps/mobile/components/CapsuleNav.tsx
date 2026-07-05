import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AngkMark } from "./AngkMark";
import { cave, space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

export function CapsuleNav({
  left,
  right,
  title,
  onPressLeft,
}: {
  left?: ReactNode;
  right?: ReactNode;
  title?: string;
  onPressLeft?: () => void;
}) {
  const leftNode = left ?? <AngkMark size={28} />;

  return (
    <View style={styles.outer}>
      <View style={[styles.inner, cave.lift]}>
        {onPressLeft ? (
          <Pressable onPress={onPressLeft}>{leftNode}</Pressable>
        ) : (
          leftNode
        )}
        {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.spacer} />}
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    padding: space.lg,
    position: "relative",
    zIndex: 40,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.paperDeep,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: theme.night,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: space.lg,
  },
  spacer: { flex: 1 },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontFamily: fonts.label,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.cream,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
});
