import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";
import { fonts } from "../lib/typography";
import { card, radius, space, theme } from "../lib/theme";

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {children}
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={{ marginTop: space.sm }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.paperDeep,
    padding: card.hero,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.line,
    borderStyle: "dashed",
    alignItems: "center",
    gap: space.sm,
  },
  title: { fontFamily: fonts.display, fontSize: 20, color: theme.ink, textAlign: "center" },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: theme.inkSoft,
    textAlign: "center",
    lineHeight: 21,
  },
});
