import { ReactNode, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { cave, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

const SIZE = {
  sm: { paddingVertical: 8, paddingHorizontal: 20, fontSize: 14 },
  md: { paddingVertical: 14, paddingHorizontal: 28, fontSize: 16 },
  lg: { paddingVertical: 18, paddingHorizontal: 36, fontSize: 18 },
} as const;

export function PillButton({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  style,
  iconRight,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "wax";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: ViewStyle;
  iconRight?: ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const dims = SIZE[size];

  function pressIn() {
    Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
  }

  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  }

  const variantStyle =
    variant === "ghost"
      ? styles.ghost
      : variant === "wax"
        ? styles.wax
        : styles.primary;

  const textStyle =
    variant === "ghost"
      ? styles.ghostText
      : variant === "wax"
        ? styles.waxText
        : styles.primaryText;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        style={[
          styles.base,
          variantStyle,
          {
            paddingVertical: dims.paddingVertical,
            paddingHorizontal: dims.paddingHorizontal,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text style={[textStyle, { fontSize: dims.fontSize }]}>{label}</Text>
        {iconRight}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: cave.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primary: {
    backgroundColor: theme.stamp,
    borderWidth: 2,
    borderColor: theme.night,
  },
  wax: {
    backgroundColor: theme.wax,
    borderWidth: 2,
    borderColor: theme.night,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: theme.night,
  },
  primaryText: {
    fontFamily: fonts.bodyBold,
    color: theme.night,
    letterSpacing: 0.3,
  },
  ghostText: {
    fontFamily: fonts.bodyBold,
    color: theme.ink,
    letterSpacing: 0.3,
  },
  waxText: {
    fontFamily: fonts.bodyBold,
    color: theme.cream,
    letterSpacing: 0.3,
  },
});
