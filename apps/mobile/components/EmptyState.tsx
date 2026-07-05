import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";
import { fonts } from "../lib/typography";
import { theme } from "../lib/theme";

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
        <PrimaryButton label={actionLabel} onPress={onAction} style={{ marginTop: 8 }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.paperDeep,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.line,
    borderStyle: "dashed",
    alignItems: "center",
    gap: 8,
  },
  title: { fontFamily: fonts.displaySemi, fontSize: 20, color: theme.ink, textAlign: "center" },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: theme.inkSoft,
    textAlign: "center",
    lineHeight: 21,
  },
});
