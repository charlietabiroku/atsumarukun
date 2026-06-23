export const RESPONSE_STORAGE_PREFIX = "atsumarukun_response_";

export type StoredResponseMeta = {
  eventId: string;
  responseId: string;
  name: string;
  answeredAt: string;
};

export function buildResponseStorageKey(eventId: string) {
  return `${RESPONSE_STORAGE_PREFIX}${eventId}`;
}

export function parseStoredResponseMeta(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as StoredResponseMeta;

    if (!parsed.eventId || !parsed.responseId || !parsed.name || !parsed.answeredAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
