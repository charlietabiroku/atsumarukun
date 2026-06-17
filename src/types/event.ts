import { AppLocale } from "@/lib/i18n/routing";

export type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  language: AppLocale;
  created_at: string;
};

export type EventDateRecord = {
  id: string;
  event_id: string;
  candidate_date: string;
  created_at: string;
};

export type EventDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: AppLocale;
  createdAt: string;
  candidateDates: Array<{
    id: string;
    candidateDate: string;
  }>;
};
