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
import { useAuth } from "../../lib/auth";
import { fonts } from "../../lib/typography";
import { card, radius, space, theme } from "../../lib/theme";

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
      {isOwner ? (
        <TextInput
          style={styles.labelInput}
          value={boxLabel}
          onChangeText={setBoxLabel}
          onBlur={saveMeta}
          placeholder="Box #14 or Garage gear"
          placeholderTextColor={theme.faded}
        />
      ) : (
        <Text style={styles.labelReadonly}>{boxLabel || box?.label}</Text>
      )}

      <Text style={styles.boxNumber}>{boxLabel || box?.label}</Text>
      {!isOwner ? (
        <Text style={styles.sharedView}>Shared with you — view only</Text>
      ) : null}

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
              style={[styles.micCircle, recording && styles.micCircleActive]}
              onPressIn={startRecording}
              onPressOut={stopAndSave}
              disabled={saving}
            >
              {saving && !recording ? (
                <ActivityIndicator color={theme.paper} size="large" />
              ) : (
                <View style={styles.micInner}>
                  <View style={[styles.micPulse, recording && styles.micPulseRecording]} />
                  <Text style={styles.micText}>{recording ? "Listening…" : "Hold to speak"}</Text>
                </View>
              )}
            </Pressable>
            <Text style={styles.micHint}>Tell this box what&apos;s inside while you pack.</Text>
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
          <PrimaryButton
            label="Save typed list"
            onPress={() => persistTranscript(manualText)}
            disabled={saving || !manualText.trim()}
          />
        </>
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
          <Text style={styles.sectionLabel}>
            {isOwner ? "ITEMS · TAP × TO REMOVE" : "ITEMS"}
          </Text>
          <AnimatedChips key={chipKey} items={items} onRemove={isOwner ? removeItem : undefined} />
        </View>
      )}

      {isOwner && items.length > 0 && (
        <View style={styles.shareSection}>
          <Text style={styles.sectionLabel}>SHARE THIS BOX</Text>
          <Text style={styles.shareHint}>Anyone you share with can scan this QR and find what you stored.</Text>
          <TextInput
            style={styles.inputSingle}
            placeholder="partner@email.com"
            placeholderTextColor={theme.faded}
            value={shareEmail}
            onChangeText={setShareEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <PrimaryButton
            label="Share with this email"
            onPress={async () => {
              const email = shareEmail.trim();
              if (!email || !token) return;
              try {
                setShareStatus("");
                await api.ensureAccount(email, "demo-password-123");
                await api.shareBox(token, email, "add");
                setShareStatus(`Shared with ${email}. They can scan this QR and see what's inside.`);
                setShareEmail("");
              } catch (e) {
                setShareStatus(e instanceof Error ? e.message : "Share failed");
              }
            }}
            style={{ marginTop: space.sm }}
          />
          {shareStatus ? <Text style={styles.saved}>{shareStatus}</Text> : null}
        </View>
      )}

      {saved && (
        <PrimaryButton label="Find something else" onPress={() => router.push("/find")} style={{ marginTop: space.lg }} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.xl, gap: space.md, backgroundColor: theme.paper },
  center: { flex: 1, justifyContent: "center", padding: space.xl, gap: space.md, backgroundColor: theme.paper },
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
    padding: card.tight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.line,
    fontSize: 15,
  },
  boxNumber: { fontFamily: fonts.display, fontSize: 48, color: theme.ink, letterSpacing: -1 },
  sharedView: { fontFamily: fonts.bodyBold, color: theme.faded, marginBottom: space.xs },
  labelReadonly: { fontFamily: fonts.bodyMedium, fontSize: 15, color: theme.inkSoft },
  locationReadonly: { fontFamily: fonts.body, fontSize: 15, color: theme.inkSoft, fontStyle: "italic" },
  locationEmpty: { fontFamily: fonts.body, fontSize: 14, color: theme.faded, fontStyle: "italic" },
  modeRow: { flexDirection: "row", gap: space.sm },
  modeBtn: {
    flex: 1,
    paddingVertical: space.md,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.paperDeep,
  },
  modeActive: { borderColor: theme.stamp, backgroundColor: theme.paper },
  modeText: { fontFamily: fonts.bodyMedium, color: theme.faded, fontSize: 13 },
  modeTextActive: { color: theme.stamp, fontFamily: fonts.bodyBold },
  micWrap: { alignItems: "center", marginVertical: space.xxl, gap: space.lg },
  micCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.stamp,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.stamp,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  micCircleActive: { backgroundColor: "#9E3A2E", transform: [{ scale: 1.04 }] },
  micInner: { alignItems: "center", gap: space.sm },
  micPulse: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.paper,
    opacity: 0.7,
  },
  micPulseRecording: { opacity: 1, transform: [{ scale: 1.4 }] },
  micText: { fontFamily: fonts.bodyBold, color: theme.paper, fontSize: 15, letterSpacing: 0.3 },
  micHint: { fontFamily: fonts.body, color: theme.faded, fontSize: 13, fontStyle: "italic" },
  input: {
    fontFamily: fonts.body,
    backgroundColor: theme.paperDeep,
    color: theme.ink,
    padding: card.tight,
    borderRadius: radius.md,
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
    padding: card.tight,
    borderRadius: radius.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.line,
  },
  quote: {
    backgroundColor: theme.paperDeep,
    padding: card.tight,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.stamp,
  },
  quoteLabel: { fontFamily: fonts.label, color: theme.faded, marginBottom: space.sm },
  quoteText: { fontFamily: fonts.body, color: theme.ink, lineHeight: 22, fontStyle: "italic" },
  chipsWrap: { gap: space.sm },
  shareSection: {
    marginTop: space.sm,
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: theme.line,
    gap: space.sm,
  },
  shareHint: { fontFamily: fonts.body, fontSize: 14, color: theme.inkSoft, lineHeight: 20 },
  error: { fontFamily: fonts.body, color: theme.error, textAlign: "center" },
  errorInline: { fontFamily: fonts.body, color: theme.error, fontSize: 13 },
  saved: { fontFamily: fonts.bodyBold, color: theme.wax },
});
