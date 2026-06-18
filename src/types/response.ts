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

export type ResponseWithItems = {
  id: string;
  name: string;
  createdAt: string;
  items: Array<{
    eventDateId: string;
    status: ResponseStatus;
  }>;
};

export type EventResultsPayload = {
  event: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    language: "ja" | "zh" | "en" | "ko";
  };
  candidateDates: Array<{
    id: string;
    candidateDate: string;
  }>;
  bestCandidates: EventDateResult[];
  bestCandidate: EventDateResult | null;
  results: EventDateResult[];
  responses: ResponseWithItems[];
  totalResponses: number;
  responseRate: {
    answered: number;
    total: number;
    percentage: number;
  };
};
