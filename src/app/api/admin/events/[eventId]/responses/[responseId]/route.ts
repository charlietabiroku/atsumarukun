import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import { deleteResponseAdmin, updateResponseAdmin } from "@/lib/db/queries";
import { adminResponseUpdateSchema } from "@/lib/validations/response";

async function ensureAdmin() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string; responseId: string }> },
) {
  const unauthorized = await ensureAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { eventId, responseId } = await context.params;
    const json = await request.json();
    const input = adminResponseUpdateSchema.parse(json);
    const response = await updateResponseAdmin({
      eventId,
      responseId,
      ...input,
    });

    return NextResponse.json({
      id: response.id,
    });
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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ eventId: string; responseId: string }> },
) {
  const unauthorized = await ensureAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { eventId, responseId } = await context.params;
    await deleteResponseAdmin(eventId, responseId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete response",
      },
      { status: 400 },
    );
  }
}
