import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { AngkMark } from "../components/AngkMark";
import { CapsuleNav } from "../components/CapsuleNav";
import { PillButton } from "../components/PillButton";
import { listBoxes } from "../lib/boxes";
import {
  buildQrSheetHtml,
  perPage,
  SIZE_LABELS,
  type QrSheetBox,
  type QrSize,
} from "../lib/qrSheet";
import { cave, space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

const SIZES: QrSize[] = ["small", "medium", "large"];

export default function PrintScreen() {
  const [boxes, setBoxes] = useState<QrSheetBox[] | null>(null);
  const [size, setSize] = useState<QrSize>("medium");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listBoxes()
      .then((rows) => setBoxes(rows.map((b) => ({ label: b.label, qrToken: b.qrToken }))))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load your labels"));
  }, []);

  const previewHtml = useMemo(
    () => (boxes ? buildQrSheetHtml(boxes, size, false) : ""),
    [boxes, size],
  );

  async function savePdf() {
    if (!boxes) return;
    setBusy(true);
    setError("");
    try {
      const { uri } = await Print.printToFileAsync({ html: buildQrSheetHtml(boxes, size, false) });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Anghkooey QR labels" });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create PDF");
    } finally {
      setBusy(false);
    }
  }

  async function printSheet() {
    if (!boxes) return;
    setBusy(true);
    setError("");
    try {
      await Print.printAsync({ html: buildQrSheetHtml(boxes, size, false) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open print dialog");
    } finally {
      setBusy(false);
    }
  }

  if (error && !boxes) {
    return (
      <SafeAreaView style={styles.safe}>
        <CapsuleNav left={<AngkMark size={28} />} title="LABELS" />
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!boxes) {
    return (
      <SafeAreaView style={styles.safe}>
        <CapsuleNav left={<AngkMark size={28} />} title="LABELS" />
        <View style={styles.center}>
          <ActivityIndicator color={theme.stamp} size="large" />
          <Text style={styles.hint}>Loading your QR sheet…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <CapsuleNav left={<AngkMark size={28} />} title="LABELS" />
      <View style={styles.toolbar}>
        <Text style={styles.title}>{boxes.length} QR labels</Text>
        <Text style={styles.sub}>
          Pick a size, then save a PDF or print. Smaller labels fit more per page (~{perPage(size)}).
        </Text>

        <View style={styles.sizeRow}>
          {SIZES.map((s) => (
            <Pressable
              key={s}
              style={[styles.sizeChip, size === s && styles.sizeChipActive]}
              onPress={() => setSize(s)}
            >
              <Text style={[styles.sizeText, size === s && styles.sizeTextActive]}>
                {SIZE_LABELS[s]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actions}>
          <PillButton label={busy ? "…" : "Save PDF"} onPress={savePdf} variant="primary" size="md" disabled={busy} style={styles.flex} />
          <PillButton label="Print" onPress={printSheet} variant="wax" size="md" disabled={busy} style={styles.flex} />
        </View>
        {error ? <Text style={styles.errorInline}>{error}</Text> : null}
      </View>

      <WebView originWhitelist={["*"]} source={{ html: previewHtml }} style={styles.web} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  web: { flex: 1, backgroundColor: theme.paper },
  toolbar: { padding: space.xl, gap: space.md },
  title: { fontFamily: fonts.display, fontSize: 24, color: theme.ink },
  sub: { fontFamily: fonts.body, fontSize: 14, color: theme.inkSoft, lineHeight: 20 },
  sizeRow: { flexDirection: "row", gap: space.sm, flexWrap: "wrap" },
  sizeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: cave.pill,
    borderWidth: 2,
    borderColor: theme.night,
    backgroundColor: "transparent",
  },
  sizeChipActive: { backgroundColor: theme.stamp },
  sizeText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: theme.ink },
  sizeTextActive: { color: theme.night, fontFamily: fonts.bodyBold },
  actions: { flexDirection: "row", gap: space.md },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  hint: { fontFamily: fonts.body, color: theme.inkSoft, textAlign: "center" },
  error: { fontFamily: fonts.bodyBold, color: theme.night, textAlign: "center", padding: space.xl },
  errorInline: { fontFamily: fonts.bodyBold, color: theme.night, fontSize: 13 },
});
