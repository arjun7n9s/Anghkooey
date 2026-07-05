import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Screen } from "../components/Screen";
import { api } from "../lib/api";
import { fonts } from "../lib/typography";
import { theme } from "../lib/theme";

function stripAutoPrint(html: string) {
  return html.replace(/<script>window\.onload=\(\)=>window\.print\(\)<\/script>/i, "");
}

export default function PrintScreen() {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .printSheetHtml()
      .then((sheet) => setHtml(stripAutoPrint(sheet)))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load print sheet"));
  }, []);

  if (error) {
    return (
      <Screen>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.hint}>Deploy the print-sheet Edge Function if you have not yet.</Text>
      </Screen>
    );
  }

  if (!html) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.stamp} size="large" />
        <Text style={styles.hint}>Loading your QR sheet…</Text>
      </Screen>
    );
  }

  return (
    <View style={styles.web}>
      <WebView originWhitelist={["*"]} source={{ html }} style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: theme.paper },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  hint: { fontFamily: fonts.body, color: theme.inkSoft, textAlign: "center" },
  error: { fontFamily: fonts.body, color: theme.error, marginBottom: 8 },
});
