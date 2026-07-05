import type { Box, FindResponse, IngestVoiceResponse, QrResolveResponse } from "./types";
import { getAccessToken } from "./supabase";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const FUNCTIONS = `${SUPABASE_URL}/functions/v1`;

async function fn<T>(name: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");

  const res = await fetch(`${FUNCTIONS}/${name}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error ?? body.message ?? JSON.stringify(body);
    } catch {
      message = await res.text();
    }
    throw new Error(message || "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  ensureBoxes: () => fn<{ ok: boolean; count: number }>("ensure-boxes"),
  resolveQr: (token: string) =>
    fn<QrResolveResponse>(`resolve-qr?token=${encodeURIComponent(token)}`),
  ingestVoice: (qrToken: string, transcript: string, mode: "replace" | "append" = "replace") =>
    fn<IngestVoiceResponse>("ingest-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken, transcript, mode }),
    }),
  find: (query: string) =>
    fn<FindResponse>("find", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }),
  printSheetHtml: async (): Promise<string> => {
    const token = await getAccessToken();
    if (!token) throw new Error("Not signed in");
    const res = await fetch(`${FUNCTIONS}/print-sheet`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
      },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.text();
  },
  transcribe: async (uri: string) => {
    const token = await getAccessToken();
    if (!token) throw new Error("Not signed in");

    const form = new FormData();
    form.append("audio", {
      uri,
      name: "recording.m4a",
      type: "audio/m4a",
    } as unknown as Blob);

    const res = await fetch(`${FUNCTIONS}/transcribe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
      },
      body: form,
    });

    if (!res.ok) {
      let message = await res.text();
      try {
        message = JSON.parse(message).error ?? message;
      } catch {
        /* keep text */
      }
      throw new Error(message || "Transcription failed");
    }
    return res.json() as Promise<{ text: string }>;
  },
};

export type { Box };
