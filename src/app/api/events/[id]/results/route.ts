import { NextResponse } from "next/server";

import { getEventResultsById } from "@/lib/db/queries";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const results = await getEventResultsById(id);

  if (!results) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(results);
}
