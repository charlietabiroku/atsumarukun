import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);

  return NextResponse.redirect(new URL("/admin/login", request.url));
}
