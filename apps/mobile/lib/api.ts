import type { Box, FindResponse, IngestVoiceResponse, QrResolveResponse } from "../../../packages/shared/src/index";

const API = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean }>("/health"),
  resolveQr: (token: string) => request<QrResolveResponse>(`/qr/resolve/${encodeURIComponent(token)}`),
  ingestVoice: (qrToken: string, transcript: string) =>
    request<IngestVoiceResponse>("/ingest/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken, transcript }),
    }),
  find: (query: string) =>
    request<FindResponse>("/find", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }),
  transcribe: async (uri: string) => {
    const form = new FormData();
    form.append("audio", {
      uri,
      name: "recording.webm",
      type: "audio/webm",
    } as unknown as Blob);
    const res = await fetch(`${API}/voice/transcribe`, { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<{ text: string }>;
  },
};

export type { Box };
