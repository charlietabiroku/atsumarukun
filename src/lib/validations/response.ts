import { z } from "zod";

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
    .max(20),
});
