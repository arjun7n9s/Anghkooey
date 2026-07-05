import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { api } from "../lib/api";
import { extractToken } from "../lib/qr";
import { theme } from "../lib/theme";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  async function handleScan(data: string) {
    if (locked) return;
    const token = extractToken(data);
    if (!token) {
      setError("That QR isn’t an Anghkooey label.");
      return;
    }

    setLocked(true);
    setError("");
    try {
      await api.resolveQr(token);
      router.push(`/log/${token}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown label — use your printed sheet");
      setLocked(false);
    }
  }

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera access is required to scan your box labels.</Text>
        <PrimaryButton label="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => handleScan(data)}
      />
      <View style={styles.frame} pointerEvents="none">
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
      </View>
      <View style={styles.overlay}>
        {locked ? <ActivityIndicator color={theme.paper} /> : null}
        <Text style={styles.hint}>Align your Anghkooey label in the frame</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={() => router.push("/print")}>
          <Text style={styles.link}>Need labels? Print QR sheet</Text>
        </Pressable>
      </View>
    </View>
  );
}

const cornerBase = {
  position: "absolute" as const,
  width: 28,
  height: 28,
  borderColor: theme.paper,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ink, justifyContent: "center", padding: 24 },
  text: { color: theme.paper, textAlign: "center", marginBottom: 16 },
  frame: { ...StyleSheet.absoluteFillObject, margin: 48 },
  corner: cornerBase,
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  overlay: { position: "absolute", bottom: 48, left: 24, right: 24, alignItems: "center", gap: 10 },
  hint: { color: theme.paper, fontSize: 16, fontWeight: "600", textAlign: "center" },
  error: { color: "#ffb4a8", textAlign: "center", fontSize: 13 },
  link: { color: theme.paper, opacity: 0.85, fontSize: 14, textDecorationLine: "underline" },
});
