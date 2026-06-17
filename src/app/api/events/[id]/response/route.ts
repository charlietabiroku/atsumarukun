import { NextRequest, NextResponse } from "next/server";

import { createResponse, getEventById } from "@/lib/db/queries";
import { createResponseSchema } from "@/lib/validations/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const event = await getEventById(id);

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const json = await request.json();
    const input = createResponseSchema.parse(json);
    const response = await createResponse({
      eventId: id,
      name: input.name,
      items: input.items,
    });

    return NextResponse.json({ responseId: response.id, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create response",
      },
      { status: 400 },
    );
  }
}
