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

export type IngestVoiceResponse = {
  box: Box;
  items: BoxItem[];
};

export type FindResult = {
  boxId: string;
  label: string;
  qrToken: string;
  lastTouched: string;
  locationHint?: string;
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
