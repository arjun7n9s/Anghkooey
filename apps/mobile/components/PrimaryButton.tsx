import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { theme } from "../lib/theme";

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
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  disabled: { opacity: 0.5 },
  text: { color: theme.paper, fontSize: 16, fontWeight: "700" },
});
