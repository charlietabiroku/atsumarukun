import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, getAdminCredentials } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const credentials = getAdminCredentials();

  if (email !== credentials.email || password !== credentials.password) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.redirect(new URL("/admin/events", request.url));
}
