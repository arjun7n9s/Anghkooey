import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { tokensMatch } from "../../lib/qr";
import { theme } from "../../lib/theme";

export default function LocateScreen() {
  const { token, label, hint } = useLocalSearchParams<{ token: string; label?: string; hint?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [found, setFound] = useState(false);
  const hapticFired = useRef(false);

  const targetLabel = label ?? "this box";
  const locationHint = hint?.trim();

  useEffect(() => {
    if (found && !hapticFired.current) {
      hapticFired.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [found]);

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Enable camera to locate {targetLabel} in the room.</Text>
        <PrimaryButton label="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => {
          if (token && tokensMatch(data, token)) setFound(true);
        }}
      />
      <View style={[styles.frame, found && styles.frameFound]} pointerEvents="none">
        <View style={[styles.corner, styles.tl, found && styles.cornerFound]} />
        <View style={[styles.corner, styles.tr, found && styles.cornerFound]} />
        <View style={[styles.corner, styles.bl, found && styles.cornerFound]} />
        <View style={[styles.corner, styles.br, found && styles.cornerFound]} />
      </View>
      <View style={[styles.banner, found && styles.bannerFound]}>
        <Text style={styles.bannerText}>
          {found
            ? `${targetLabel} found${locationHint ? ` — ${locationHint}` : ""}`
            : `Sweep the room for ${targetLabel}`}
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

const cornerBase = {
  position: "absolute" as const,
  width: 32,
  height: 32,
  borderColor: theme.paper,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ink },
  center: { flex: 1, justifyContent: "center", padding: 24, gap: 16, backgroundColor: theme.paper },
  text: { color: theme.ink, textAlign: "center" },
  frame: { ...StyleSheet.absoluteFillObject, margin: 56 },
  frameFound: {},
  corner: cornerBase,
  cornerFound: { borderColor: theme.wax },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  banner: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: "rgba(26,22,20,0.88)",
    padding: 16,
    borderRadius: 12,
  },
  bannerFound: { borderColor: theme.wax, borderWidth: 2 },
  bannerText: { color: theme.paper, textAlign: "center", fontWeight: "600" },
  pulse: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: theme.wax,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  pulseText: { color: theme.paper, fontWeight: "800", fontSize: 18 },
});
