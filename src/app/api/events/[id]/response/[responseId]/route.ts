import { NextRequest, NextResponse } from "next/server";

import { createResponse, getEventById } from "@/lib/db/queries";
import { updateResponseSchema } from "@/lib/validations/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; responseId: string }> },
) {
  try {
    const { id, responseId } = await context.params;
    const event = await getEventById(id);

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const json = await request.json();
    const input = updateResponseSchema.parse(json);
    const response = await createResponse({
      eventId: id,
      responseId,
      name: input.name,
      items: input.items,
    });

    return NextResponse.json({ responseId: response.id, success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update response",
      },
      { status: 400 },
    );
  }
}
