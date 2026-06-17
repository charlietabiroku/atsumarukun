import { NextResponse } from "next/server";

import { getEventById, updateEvent } from "@/lib/db/queries";
import { createEventSchema } from "@/lib/validations/event";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const event = await getEventById(id);

  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const json = await request.json();
    const input = createEventSchema.parse(json);
    const event = await updateEvent({
      id,
      ...input,
    });

    return NextResponse.json({
      id: event.id,
      slug: event.slug,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update the event",
      },
      { status: 400 },
    );
  }
}
