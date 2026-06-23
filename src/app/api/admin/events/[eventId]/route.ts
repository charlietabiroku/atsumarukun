import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  deleteEventAdmin,
  getAdminEventById,
  updateEventAdmin,
} from "@/lib/db/queries";
import { adminEventSchema } from "@/lib/validations/event";

async function ensureAdmin() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const unauthorized = await ensureAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { eventId } = await context.params;
  const event = await getAdminEventById(eventId);

  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const unauthorized = await ensureAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { eventId } = await context.params;
    const json = await request.json();
    const input = adminEventSchema.parse(json);
    const event = await updateEventAdmin({
      id: eventId,
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
          error instanceof Error ? error.message : "Failed to update event",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const unauthorized = await ensureAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { eventId } = await context.params;
    await deleteEventAdmin(eventId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete event",
      },
      { status: 400 },
    );
  }
}
