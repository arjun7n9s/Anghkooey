import { Audio } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api, type Box } from "../../lib/api";
import { theme } from "../../lib/theme";

const DEMO_SCRIPT =
  "Old Canon camera body, two HDMI cables, the battery charger, my college hoodie, a paperback of Siddhartha, and a postcard from Sarah.";

export default function LogScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [box, setBox] = useState<Box | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcript, setTranscript] = useState("");
  const [items, setItems] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.resolveQr(token).then((r) => setBox(r.box)).catch(console.error);
  }, [token]);

  async function startRecording() {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();
    setRecording(rec);
    setSaved(false);
  }

  async function stopAndSave() {
    if (!recording || !token) return;
    setLoading(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      let text = DEMO_SCRIPT;
      if (uri) {
        try {
          const t = await api.transcribe(uri);
          if (t.text) text = t.text;
        } catch {
          text = DEMO_SCRIPT;
        }
      }
      setTranscript(text);
      const res = await api.ingestVoice(token, text);
      setBox(res.box);
      setItems(res.items);
      setSaved(true);
    } finally {
      setRecording(null);
      setLoading(false);
    }
  }

  async function quickDemoSave() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.ingestVoice(token, DEMO_SCRIPT);
      setTranscript(DEMO_SCRIPT);
      setBox(res.box);
      setItems(res.items);
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{box?.label ?? "Box"}</Text>
      <Text style={styles.sub}>Speak what's inside while you pack.</Text>

      <Pressable
        style={[styles.mic, recording && styles.micActive]}
        onPressIn={startRecording}
        onPressOut={stopAndSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.bg} />
        ) : (
          <Text style={styles.micText}>{recording ? "Listening… release to save" : "Hold to log"}</Text>
        )}
      </Pressable>

      <Pressable style={styles.demoBtn} onPress={quickDemoSave} disabled={loading}>
        <Text style={styles.demoText}>Use demo script (no mic)</Text>
      </Pressable>

      {transcript ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Transcript</Text>
          <Text style={styles.transcript}>{transcript}</Text>
        </View>
      ) : null}

      {items.length > 0 && (
        <View style={styles.chips}>
          {items.map((item) => (
            <View key={item.name} style={styles.chip}>
              <Text style={styles.chipText}>{item.name}</Text>
            </View>
          ))}
        </View>
      )}

      {saved && token && (
        <Pressable style={styles.findBtn} onPress={() => router.push("/find")}>
          <Text style={styles.findBtnText}>Find something →</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: "700", color: theme.text },
  sub: { color: theme.muted, marginBottom: 8 },
  mic: {
    backgroundColor: theme.accent,
    minHeight: 120,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  micActive: { backgroundColor: theme.glow },
  micText: { color: theme.bg, fontWeight: "700", fontSize: 16, textAlign: "center" },
  demoBtn: { alignItems: "center", padding: 8 },
  demoText: { color: theme.glow, fontSize: 14 },
  card: { backgroundColor: theme.surface, padding: 16, borderRadius: 14 },
  cardLabel: { color: theme.muted, fontSize: 12, marginBottom: 8 },
  transcript: { color: theme.text, lineHeight: 22 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: theme.chip, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  chipText: { color: theme.text, fontSize: 13 },
  findBtn: {
    marginTop: 16,
    backgroundColor: theme.success,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  findBtnText: { color: theme.bg, fontWeight: "700" },
});
