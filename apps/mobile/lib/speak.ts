import { Platform } from "react-native";
import * as Speech from "expo-speech";

export async function speakReply(text: string): Promise<void> {
  if (!text.trim()) return;

  if (Platform.OS === "web" && typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    return;
  }

  await Speech.stop();
  Speech.speak(text, { rate: 0.95, language: "en-US" });
}
