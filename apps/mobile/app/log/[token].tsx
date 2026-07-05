import { Audio } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AnimatedChips } from "../../components/AnimatedChips";
import { PrimaryButton } from "../../components/PrimaryButton";
import { deleteBoxItem, updateBoxMeta } from "../../lib/boxes";
import { api, type Box } from "../../lib/api";
import { fonts } from "../../lib/typography";
import { theme } from "../../lib/theme";

export default function LogScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [box, setBox] = useState<Box | null>(null);
  const [boxLabel, setBoxLabel] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcript, setTranscript] = useState("");
  const [manualText, setManualText] = useState("");
  const [locationHint, setLocationHint] = useState("");
  const [items, setItems] = useState<{ id: string; name: string; category?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveMode, setSaveMode] = useState<"replace" | "append">("replace");
  const [chipKey, setChipKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    api
      .resolveQr(token)
      .then((r) => {
        setBox(r.box);
        setBoxLabel(r.box.label);
        setItems(r.box.items);
        setTranscript(r.box.rawTranscript ?? "");
        setLocationHint(r.box.locationHint ?? "");
        if (r.box.items.length > 0) setSaveMode("append");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load this box"))
      .finally(() => setLoading(false));
  }, [token]);

  async function persistTranscript(text: string) {
    if (!token || !text.trim()) {
      setError("Say or type what’s inside the box first.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await api.ingestVoice(token, text.trim(), saveMode);
      setBox(res.box);
      setItems(res.items);
      setTranscript(res.box.rawTranscript ?? text.trim());
      setChipKey((k) => k + 1);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function saveMeta() {
    if (!token) return;
    try {
      await updateBoxMeta(token, {
        locationHint: locationHint.trim(),
        label: boxLabel.trim() || undefined,
      });
      if (box) setBox({ ...box, label: boxLabel.trim(), locationHint: locationHint.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save details");
    }
  }

  async function removeItem(itemId: string) {
    try {
      await deleteBoxItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove item");
    }
  }

  async function startRecording() {
    setError("");
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();
    setRecording(rec);
    setSaved(false);
  }

  async function stopAndSave() {
    if (!recording) return;
    setSaving(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) throw new Error("No recording captured");
      const t = await api.transcribe(uri);
      setManualText(t.text);
      await persistTranscript(t.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription failed");
    } finally {
      setRecording(null);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.stamp} size="large" />
      </View>
    );
  }

  if (error && !box) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <PrimaryButton label="Back home" onPress={() => router.replace("/")} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionLabel}>BOX NAME</Text>
      <TextInput
        style={styles.labelInput}
        value={boxLabel}
        onChangeText={setBoxLabel}
        onBlur={saveMeta}
        placeholder="Box #14 or Garage gear"
        placeholderTextColor={theme.faded}
      />

      <Text style={styles.boxNumber}>{boxLabel || box?.label}</Text>
      <Text style={styles.sub}>Tell this box what’s inside while you pack.</Text>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeBtn, saveMode === "replace" && styles.modeActive]}
          onPress={() => setSaveMode("replace")}
        >
          <Text style={[styles.modeText, saveMode === "replace" && styles.modeTextActive]}>Replace all</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, saveMode === "append" && styles.modeActive]}
          onPress={() => setSaveMode("append")}
        >
          <Text style={[styles.modeText, saveMode === "append" && styles.modeTextActive]}>Add items</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.mic, recording && styles.micActive]}
        onPressIn={startRecording}
        onPressOut={stopAndSave}
        disabled={saving}
      >
        {saving && !recording ? (
          <ActivityIndicator color={theme.paper} />
        ) : (
          <>
            <Text style={styles.micText}>
              {recording ? "Listening… release to save" : "Hold to log by voice"}
            </Text>
            {recording ? <View style={styles.wave} /> : null}
          </>
        )}
      </Pressable>

      <Text style={styles.sectionLabel}>OR TYPE IT</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Canon camera, HDMI cables, charger…"
        placeholderTextColor={theme.faded}
        value={manualText}
        onChangeText={setManualText}
      />
      <PrimaryButton
        label="Save typed list"
        onPress={() => persistTranscript(manualText)}
        disabled={saving || !manualText.trim()}
      />

      <Text style={styles.sectionLabel}>WHERE IS THIS BOX?</Text>
      <TextInput
        style={styles.inputSingle}
        placeholder="Garage, top shelf, far right…"
        placeholderTextColor={theme.faded}
        value={locationHint}
        onChangeText={setLocationHint}
        onBlur={saveMeta}
      />

      {error ? <Text style={styles.errorInline}>{error}</Text> : null}
      {saved ? <Text style={styles.saved}>Saved to {boxLabel || box?.label}</Text> : null}

      {transcript ? (
        <View style={styles.quote}>
          <Text style={styles.quoteLabel}>Your log</Text>
          <Text style={styles.quoteText}>{transcript}</Text>
        </View>
      ) : null}

      {items.length > 0 && (
        <View style={styles.chipsWrap}>
          <Text style={styles.sectionLabel}>ITEMS · TAP × TO REMOVE</Text>
          <AnimatedChips key={chipKey} items={items} onRemove={removeItem} />
        </View>
      )}

      {saved && (
        <PrimaryButton label="Find something else" onPress={() => router.push("/find")} style={{ marginTop: 16 }} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 14, backgroundColor: theme.paper },
  center: { flex: 1, justifyContent: "center", padding: 24, gap: 12, backgroundColor: theme.paper },
  sectionLabel: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: theme.faded,
    letterSpacing: 1.2,
  },
  labelInput: {
    fontFamily: fonts.bodyMedium,
    backgroundColor: theme.paperDeep,
    color: theme.ink,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.line,
    fontSize: 15,
  },
  boxNumber: { fontFamily: fonts.display, fontSize: 48, color: theme.ink, letterSpacing: -1 },
  sub: { fontFamily: fonts.body, color: theme.inkSoft, marginBottom: 4 },
  modeRow: { flexDirection: "row", gap: 8 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.paperDeep,
  },
  modeActive: { borderColor: theme.stamp, backgroundColor: theme.paper },
  modeText: { fontFamily: fonts.bodyMedium, color: theme.faded, fontSize: 13 },
  modeTextActive: { color: theme.stamp, fontFamily: fonts.bodyBold },
  mic: {
    backgroundColor: theme.stamp,
    minHeight: 120,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 10,
  },
  micActive: { backgroundColor: "#9E3A2E" },
  micText: { fontFamily: fonts.bodyBold, color: theme.paper, fontSize: 16, textAlign: "center" },
  wave: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  input: {
    fontFamily: fonts.body,
    backgroundColor: theme.paperDeep,
    color: theme.ink,
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.line,
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputSingle: {
    fontFamily: fonts.body,
    backgroundColor: theme.paperDeep,
    color: theme.ink,
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.line,
  },
  quote: {
    backgroundColor: theme.paperDeep,
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: theme.stamp,
  },
  quoteLabel: { fontFamily: fonts.label, color: theme.faded, marginBottom: 8 },
  quoteText: { fontFamily: fonts.body, color: theme.ink, lineHeight: 22, fontStyle: "italic" },
  chipsWrap: { gap: 8 },
  error: { fontFamily: fonts.body, color: theme.error, textAlign: "center" },
  errorInline: { fontFamily: fonts.body, color: theme.error, fontSize: 13 },
  saved: { fontFamily: fonts.bodyBold, color: theme.wax },
});
