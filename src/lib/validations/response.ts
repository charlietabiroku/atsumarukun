import { z } from "zod";

import { MAX_CANDIDATE_DATES } from "@/lib/constants/events";

export const createResponseSchema = z.object({
  name: z.string().trim().min(1).max(60),
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
