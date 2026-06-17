import { NextRequest, NextResponse } from "next/server";

import { createEvent } from "@/lib/db/queries";
import { buildAbsoluteUrl, buildEventUrl } from "@/lib/utils";
import { createEventSchema } from "@/lib/validations/event";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const input = createEventSchema.parse(json);
    const event = await createEvent(input);

    return NextResponse.json(
      {
        id: event.id,
        slug: event.slug,
        url: buildAbsoluteUrl(buildEventUrl(input.language, event.slug)),
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create the event",
      },
      { status: 400 },
    );
  }
}
