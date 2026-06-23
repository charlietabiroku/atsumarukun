import { AppLocale } from "@/lib/i18n/routing";

export type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  language: AppLocale;
  response_deadline: string | null;
  reception_status: "open" | "paused" | "closed";
  share_enabled: boolean;
  created_at: string;
};

export type EventDateRecord = {
  id: string;
  event_id: string;
  candidate_date: string;
  display_order: number;
  created_at: string;
};

export type EventDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: AppLocale;
  responseDeadline: string | null;
  receptionStatus: "open" | "paused" | "closed";
  shareEnabled: boolean;
  createdAt: string;
  candidateDates: Array<{
    id: string;
    candidateDate: string;
    displayOrder: number;
  }>;
};
