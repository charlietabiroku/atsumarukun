export type ResponseStatus = "available" | "maybe" | "unavailable";

export type ResponseRecord = {
  id: string;
  event_id: string;
  name: string;
  created_at: string;
};

export type ResponseItemRecord = {
  id: string;
  response_id: string;
  event_date_id: string;
  status: ResponseStatus;
};

export type EventDateResult = {
  eventDateId: string;
  candidateDate: string;
  availableCount: number;
  maybeCount: number;
  unavailableCount: number;
  score: number;
};
