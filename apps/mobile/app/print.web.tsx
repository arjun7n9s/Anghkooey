import { createElement, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    api
      .printSheetHtml()
      .then((sheet) => setHtml(stripAutoPrint(sheet)))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load print sheet"));
  }, []);

  function downloadSheet() {
    if (!html || typeof document === "undefined") return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "anghkooey-qr-labels.html";
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
      return;
    }
    if (!html || typeof window === "undefined") return;
    const popup = window.open("", "_blank");
    if (!popup) return;
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  }

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
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <View style={styles.toolbarText}>
          <Text style={styles.title}>24 QR labels</Text>
          <Text style={styles.sub}>Download the sheet, print it, then stick labels on your boxes.</Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton label="Download" onPress={downloadSheet} style={styles.actionBtn} />
          <PrimaryButton label="Print" onPress={printSheet} style={styles.actionBtn} />
        </View>
      </View>
      {createElement("iframe", {
        ref: iframeRef,
        srcDoc: html,
        title: "Anghkooey QR label sheet",
        style: {
          flex: 1,
          width: "100%",
          border: "none",
          background: theme.paper,
          minHeight: 480,
        },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.paper },
  toolbar: {
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
    backgroundColor: theme.paperDeep,
  },
  toolbarText: { gap: 4 },
  title: { fontFamily: fonts.displaySemi, fontSize: 22, color: theme.ink },
  sub: { fontFamily: fonts.body, fontSize: 14, color: theme.inkSoft, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  hint: { fontFamily: fonts.body, color: theme.inkSoft, textAlign: "center" },
  error: { fontFamily: fonts.body, color: theme.error, marginBottom: 8 },
});
