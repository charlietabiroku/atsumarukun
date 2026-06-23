import { z } from "zod";

import { MAX_CANDIDATE_DATES } from "@/lib/constants/events";

export const createResponseSchema = z.object({
  responseId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(60),
  comment: z.string().trim().max(500).optional().default(""),
  items: z
    .array(
      z.object({
        eventDateId: z.string().uuid(),
        status: z.enum(["available", "maybe", "unavailable"]),
      }),
    )
    .min(1)
    .max(MAX_CANDIDATE_DATES),
});

export const updateResponseSchema = createResponseSchema.omit({
  responseId: true,
});

export const adminResponseUpdateSchema = z.object({
  name: z.string().trim().min(1).max(60),
  comment: z.string().trim().max(500).optional().default(""),
  items: z.array(
    z.object({
      eventDateId: z.string().uuid(),
      status: z.enum(["available", "maybe", "unavailable"]),
    }),
  ),
});
