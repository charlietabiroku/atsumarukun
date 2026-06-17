import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().default(""),
  language: z.enum(["ja", "zh", "en", "ko"]),
  candidateDates: z
    .array(z.string().datetime())
    .min(1)
    .max(20)
    .transform((dates) => [...new Set(dates)].sort()),
});
