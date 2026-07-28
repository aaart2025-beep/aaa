import { NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_TTL_MS, authSecret, checkCredentials } from "@/lib/auth";
import { createSessionToken } from "@/lib/session";

const FAIL_DELAY_MS = 1000; // damp brute-force attempts

export async function POST(req: Request) {
  let username = "";
  let password = "";
  try {
    const body = await req.json();
    username = String(body?.username ?? "");
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (!checkCredentials(username, password)) {
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
    return NextResponse.json({ ok: false, error: "Invalid username or password" }, { status: 401 });
  }

  const token = await createSessionToken(authSecret(), SESSION_TTL_MS);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return res;
}
