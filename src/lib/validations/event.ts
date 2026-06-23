import { z } from "zod";

import { MAX_CANDIDATE_DATES } from "@/lib/constants/events";

export const createEventSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().default(""),
  language: z.enum(["ja", "zh", "en", "ko"]),
  candidateDates: z
    .array(z.string().datetime())
    .min(1)
    .max(MAX_CANDIDATE_DATES)
    .transform((dates) => [...new Set(dates)].sort()),
});

export const adminEventSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().default(""),
  language: z.enum(["ja", "zh", "en", "ko"]),
  responseDeadline: z.string().datetime().nullable().optional().default(null),
  receptionStatus: z.enum(["open", "paused", "closed"]).default("open"),
  shareEnabled: z.boolean().default(true),
  candidateDates: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        candidateDate: z.string().datetime(),
        displayOrder: z.number().int().nonnegative(),
      }),
    )
    .min(1)
    .max(MAX_CANDIDATE_DATES),
});
