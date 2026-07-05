import { StyleSheet, Text, View } from "react-native";
import { useConnectivity } from "../lib/useConnectivity";
import { fonts } from "../lib/typography";
import { theme } from "../lib/theme";

export function OfflineBanner() {
  const offline = useConnectivity();
  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Offline — your archive will sync when you're back online.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.night,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: theme.stamp,
    textAlign: "center",
  },
});
