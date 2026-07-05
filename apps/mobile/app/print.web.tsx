import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    listBoxes()
      .then((rows) => setBoxes(rows.map((b) => ({ label: b.label, qrToken: b.qrToken }))))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load your labels"));
  }, []);

  const previewHtml = useMemo(
    () => (boxes ? buildQrSheetHtml(boxes, size, false) : ""),
    [boxes, size],
  );

  function downloadSheet() {
    if (!boxes || typeof document === "undefined") return;
    const html = buildQrSheetHtml(boxes, size, false);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `anghkooey-qr-labels-${size}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function printSheet() {
    const frame = iframeRef.current;
    if (frame?.contentWindow) {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    }
  }

  if (error) {
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
        <View style={styles.toolbarText}>
          <Text style={styles.title}>{boxes.length} QR labels</Text>
          <Text style={styles.sub}>
            Pick a size, then download or print an A4 sheet. Smaller labels fit more per page (~
            {perPage(size)}).
          </Text>
        </View>

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
          <PillButton label="Download A4" onPress={downloadSheet} variant="primary" size="md" style={styles.flex} />
          <PillButton label="Print" onPress={printSheet} variant="wax" size="md" style={styles.flex} />
        </View>
      </View>

      {createElement("iframe", {
        ref: iframeRef,
        srcDoc: previewHtml,
        title: "Anghkooey QR label sheet",
        style: {
          flex: 1,
          width: "100%",
          border: "none",
          background: theme.paper,
          minHeight: 480,
        },
      })}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  toolbar: { padding: space.xl, gap: space.md },
  toolbarText: { gap: 4 },
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
});
