import { ReactNode } from "react";
import { SafeAreaView, StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "../lib/theme";

export function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  inner: { flex: 1, padding: 24 },
});
