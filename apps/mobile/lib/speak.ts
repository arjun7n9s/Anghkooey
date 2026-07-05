import * as Speech from "expo-speech";

export async function speakReply(text: string): Promise<void> {
  if (!text.trim()) return;

  await Speech.stop();
  Speech.speak(text, { rate: 0.95, language: "en-US" });
}
