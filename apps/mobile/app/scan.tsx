import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../lib/theme";

function extractToken(data: string): string | null {
  if (data.includes("/b/")) return data.split("/b/").pop()?.split("?")[0] ?? null;
  if (data.startsWith("demo-box-")) return data;
  if (data.startsWith("qr-")) return data;
  return data.length < 64 ? data : null;
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera access needed to scan your box QR.</Text>
        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Allow camera</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => router.push("/log/demo-box-14-canonical")}>
          <Text style={styles.linkText}>Demo: open Box #14</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => {
          if (locked) return;
          const token = extractToken(data);
          if (!token) return;
          setLocked(true);
          router.push(`/log/${token}`);
        }}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>Point at an Anghkooey QR</Text>
        <Pressable style={styles.link} onPress={() => router.push("/log/demo-box-14-canonical")}>
          <Text style={styles.linkText}>Skip scan → Box #14 demo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, justifyContent: "center", padding: 24 },
  text: { color: theme.text, textAlign: "center", marginBottom: 16 },
  btn: { backgroundColor: theme.accent, padding: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: theme.bg, fontWeight: "700" },
  overlay: { position: "absolute", bottom: 48, left: 0, right: 0, alignItems: "center", gap: 12 },
  hint: { color: theme.text, fontSize: 16, fontWeight: "600" },
  link: { padding: 8 },
  linkText: { color: theme.glow, fontSize: 14 },
});
