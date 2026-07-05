import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { fonts } from "../lib/typography";
import { card, radius, theme } from "../lib/theme";

export function PrimaryButton({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      style={[styles.btn, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: theme.stamp,
    paddingVertical: card.tight,
    borderRadius: radius.md,
    alignItems: "center",
  },
  disabled: { opacity: 0.5 },
  text: { fontFamily: fonts.bodyBold, color: theme.paper, fontSize: 16 },
});
