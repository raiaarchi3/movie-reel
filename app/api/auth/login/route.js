import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { verifyPassword, startSession } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = readDb().users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  startSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}
