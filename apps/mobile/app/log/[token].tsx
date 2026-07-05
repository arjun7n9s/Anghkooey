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
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedChips } from "../../components/AnimatedChips";
import { AngkMark } from "../../components/AngkMark";
import { CapsuleNav } from "../../components/CapsuleNav";
import { PillButton } from "../../components/PillButton";
import { deleteBoxItem, updateBoxMeta } from "../../lib/boxes";
import { api, type Box } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { fonts } from "../../lib/typography";
import { cave, space, theme } from "../../lib/theme";

export default function LogScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { session } = useAuth();
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
  const [shareEmail, setShareEmail] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  const isOwner = Boolean(box && session?.user?.id === box.accountId);

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
      setError("Say or type what's inside the box first.");
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
    if (!token || !isOwner) return;
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
    if (!isOwner) return;
    setError("");
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      ios: {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
        extension: ".wav",
        outputFormat: Audio.IOSOutputFormat.LINEARPCM,
        sampleRate: 16000,
        numberOfChannels: 1,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    });
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
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={theme.stamp} size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (error && !box) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>{error}</Text>
        <PillButton label="Back home" onPress={() => router.replace("/")} variant="primary" size="md" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <CapsuleNav left={<AngkMark size={28} />} title="LOG" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>BOX</Text>
          <Text style={styles.heroTitle}>{boxLabel || box?.label || "Untitled box"}</Text>
          <Text style={styles.heroSub}>
            {!isOwner
              ? "Shared with you — view only"
              : box?.locationHint || "Tell this box what's inside"}
          </Text>
        </View>

        {isOwner ? (
          <>
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

            <View style={styles.micWrap}>
              <Pressable
                style={[styles.micCircle, recording && styles.micCircleActive, cave.lift]}
                onPressIn={startRecording}
                onPressOut={stopAndSave}
                disabled={saving}
              >
                {saving && !recording ? (
                  <ActivityIndicator color={theme.paper} size="large" />
                ) : (
                  <View style={styles.micInner}>
                    <View style={[styles.micRing, recording && styles.micRingActive]} />
                    <Text style={styles.micText}>{recording ? "Listening…" : "Hold to speak"}</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <Text style={styles.sectionLabel}>OR TYPE IT</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Canon camera, HDMI cables, charger…"
              placeholderTextColor={theme.faded}
              value={manualText}
              onChangeText={setManualText}
            />
            <PillButton
              label="Save typed list"
              onPress={() => persistTranscript(manualText)}
              variant="primary"
              size="md"
              disabled={saving || !manualText.trim()}
              style={styles.fullBtn}
            />
          </>
        ) : null}

        {items.length > 0 ? (
          <View style={[styles.itemsPanel, cave.heroCard, { borderRadius: cave.scoop }]}>
            <Text style={styles.panelLabel}>{isOwner ? "ITEMS · TAP × TO REMOVE" : "ITEMS"}</Text>
            <AnimatedChips key={chipKey} items={items} onRemove={isOwner ? removeItem : undefined} />
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>WHERE IS THIS BOX?</Text>
        {isOwner ? (
          <TextInput
            style={styles.inputSingle}
            placeholder="Garage, top shelf, far right…"
            placeholderTextColor={theme.faded}
            value={locationHint}
            onChangeText={setLocationHint}
            onBlur={saveMeta}
          />
        ) : box?.locationHint ? (
          <Text style={styles.locationReadonly}>📍 {box.locationHint}</Text>
        ) : (
          <Text style={styles.locationEmpty}>No location logged yet.</Text>
        )}

        {transcript ? (
          <View style={styles.quote}>
            <Text style={styles.quoteLabel}>Your log</Text>
            <Text style={styles.quoteText}>{transcript}</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorInline}>{error}</Text> : null}
        {saved ? <Text style={styles.saved}>Saved to {boxLabel || box?.label}</Text> : null}

        {isOwner && items.length > 0 ? (
          <View style={[styles.sharePanel, cave.heroCard, { borderRadius: cave.scoop, padding: space.xl }]}>
            <Text style={styles.panelLabel}>SHARE THIS BOX</Text>
            <Text style={styles.shareHint}>
              Anyone you share with can scan this QR and find what you stored.
            </Text>
            <TextInput
              style={styles.inputSingle}
              placeholder="partner@email.com"
              placeholderTextColor={theme.faded}
              value={shareEmail}
              onChangeText={setShareEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <PillButton
              label="Share with this email"
              onPress={async () => {
                const email = shareEmail.trim();
                if (!email || !token) return;
                try {
                  setShareStatus("");
                  await api.ensureAccount(email, "demo-password-123");
                  await api.shareBox(token, email, "add");
                  setShareStatus(`Shared with ${email}.`);
                  setShareEmail("");
                } catch (e) {
                  setShareStatus(e instanceof Error ? e.message : "Share failed");
                }
              }}
              variant="primary"
              size="md"
              style={styles.fullBtn}
            />
            {shareStatus ? <Text style={styles.saved}>{shareStatus}</Text> : null}
          </View>
        ) : null}

        {saved ? (
          <PillButton label="Find something else" onPress={() => router.push("/find")} variant="ghost" size="md" style={styles.fullBtn} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  scroll: {
    padding: space.xxl,
    gap: space.xl,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  hero: { alignItems: "center", gap: space.sm },
  heroLabel: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: theme.faded,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: theme.ink,
    textAlign: "center",
    letterSpacing: -1,
  },
  heroSub: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: theme.inkSoft,
    fontStyle: "italic",
    textAlign: "center",
  },
  modeRow: { flexDirection: "row", gap: space.sm },
  modeBtn: {
    flex: 1,
    paddingVertical: space.md,
    borderRadius: cave.pill,
    alignItems: "center",
    borderWidth: cave.hairline,
    borderColor: theme.line,
    backgroundColor: theme.paperDeep,
  },
  modeActive: { borderColor: theme.stamp, backgroundColor: theme.paper },
  modeText: { fontFamily: fonts.bodyMedium, color: theme.creamSoft, fontSize: 13 },
  modeTextActive: { color: theme.night, fontFamily: fonts.bodyBold },
  micWrap: { alignItems: "center", marginVertical: space.xl },
  micCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.night,
    borderWidth: 3,
    borderColor: theme.stamp,
    alignItems: "center",
    justifyContent: "center",
  },
  micCircleActive: { backgroundColor: "#C0392B", transform: [{ scale: 1.04 }] },
  micInner: { alignItems: "center", gap: space.md },
  micRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: theme.stamp,
  },
  micRingActive: { borderColor: theme.cream, transform: [{ scale: 1.08 }] },
  micText: { fontFamily: fonts.bodyBold, color: theme.cream, fontSize: 15 },
  sectionLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: theme.faded,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  panelLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: theme.creamFaint,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  input: {
    fontFamily: fonts.bodyMedium,
    backgroundColor: theme.stamp,
    color: theme.night,
    padding: cave.field,
    borderRadius: cave.card,
    fontSize: 15,
    borderWidth: 2,
    borderColor: theme.night,
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputSingle: {
    fontFamily: fonts.bodyMedium,
    backgroundColor: theme.stamp,
    color: theme.night,
    padding: cave.field,
    borderRadius: cave.pill,
    fontSize: 15,
    borderWidth: 2,
    borderColor: theme.night,
  },
  itemsPanel: { gap: space.sm },
  quote: {
    backgroundColor: theme.night,
    padding: cave.field,
    borderRadius: cave.card,
    borderLeftWidth: 4,
    borderLeftColor: theme.stamp,
  },
  quoteLabel: { fontFamily: fonts.label, color: theme.creamFaint, marginBottom: space.sm },
  quoteText: { fontFamily: fonts.displayItalic, color: theme.cream, lineHeight: 22, fontStyle: "italic" },
  sharePanel: { gap: space.sm },
  shareHint: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: theme.creamSoft,
    fontStyle: "italic",
    lineHeight: 20,
  },
  locationReadonly: { fontFamily: fonts.bodyMedium, fontSize: 15, color: theme.ink, fontStyle: "italic" },
  locationEmpty: { fontFamily: fonts.body, fontSize: 14, color: theme.inkFaint, fontStyle: "italic" },
  fullBtn: { width: "100%" },
  error: { fontFamily: fonts.bodyBold, color: theme.night, textAlign: "center", padding: space.xl },
  errorInline: { fontFamily: fonts.bodyBold, color: theme.night, fontSize: 13 },
  saved: { fontFamily: fonts.bodyBold, color: theme.night },
});
