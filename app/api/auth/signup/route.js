import crypto from "crypto";
import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { hashPassword, startSession } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim().slice(0, 40);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
  const password = String(body.password || "");
  if (!name) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Use a password of at least 6 characters." }, { status: 400 });

  const db = readDb();
  if (db.users.some((u) => u.email === email)) {
    return NextResponse.json({ error: "An account with this email already exists. Log in instead." }, { status: 409 });
  }
  const { salt, hash } = hashPassword(password);
  const user = { id: crypto.randomUUID(), name, email, salt, hash };
  db.users.push(user);
  writeDb(db);
  startSession(user.id);
  return NextResponse.json({ user: { id: user.id, name, email } });
}
