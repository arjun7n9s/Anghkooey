import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../lib/theme";

export default function LocateScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [found, setFound] = useState(false);

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text} onPress={requestPermission}>
          Tap to enable camera for locate mode
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => {
          const scanned = data.includes("/b/") ? data.split("/b/").pop() : data;
          if (scanned === token) setFound(true);
        }}
      />
      <View style={[styles.banner, found && styles.bannerFound]}>
        <Text style={styles.bannerText}>
          {found
            ? "Box found — top shelf, far right"
            : `Sweep room for QR… target: ${token?.slice(0, 12)}`}
        </Text>
      </View>
      {found && (
        <View style={styles.pulse}>
          <Text style={styles.pulseText}>● HERE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, justifyContent: "center", padding: 24 },
  text: { color: theme.text, textAlign: "center" },
  banner: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "rgba(20,20,22,0.9)",
    padding: 16,
    borderRadius: 12,
  },
  bannerFound: { borderColor: theme.success, borderWidth: 2 },
  bannerText: { color: theme.text, textAlign: "center", fontWeight: "600" },
  pulse: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: theme.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  pulseText: { color: theme.bg, fontWeight: "800", fontSize: 18 },
});
