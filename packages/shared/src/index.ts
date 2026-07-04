export type BoxItem = {
  id: string;
  name: string;
  category?: string;
};

export type Box = {
  id: string;
  accountId: string;
  label: string;
  qrToken: string;
  lastTouched: string;
  locationHint?: string;
  rawTranscript?: string;
  items: BoxItem[];
};

export type IngestVoiceRequest = {
  qrToken: string;
  transcript: string;
  accountId?: string;
};

export type IngestVoiceResponse = {
  box: Box;
  items: BoxItem[];
};

export type FindRequest = {
  query: string;
  accountId?: string;
};

export type FindResult = {
  boxId: string;
  label: string;
  qrToken: string;
  lastTouched: string;
  snippet: string;
  items: BoxItem[];
  score: number;
};

export type FindResponse = {
  results: FindResult[];
  voiceReply: string;
};

export type QrResolveResponse = {
  box: Box;
};

export const DEMO_ACCOUNT_ID = "demo-anghkooey";
export const DEMO_BOX_14_TOKEN = "demo-box-14-canonical";
