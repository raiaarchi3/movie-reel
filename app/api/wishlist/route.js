import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { MOVIE_BY_ID } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = currentUser();
  if (!user) return NextResponse.json({ movieIds: [] });
  const db = readDb();
  const ids = (db.wishlist || []).filter((w) => w.userId === user.id).sort((a, b) => b.ts - a.ts).map((w) => w.movieId);
  return NextResponse.json({ movieIds: ids });
}

export async function POST(req) {
  const user = currentUser();
  if (!user) return NextResponse.json({ error: "Log in to use your wishlist." }, { status: 401 });
  const { movieId } = await req.json().catch(() => ({}));
  if (!MOVIE_BY_ID[movieId]) return NextResponse.json({ error: "Unknown movie." }, { status: 400 });
  const db = readDb();
  db.wishlist ||= [];
  if (!db.wishlist.some((w) => w.userId === user.id && w.movieId === movieId)) {
    db.wishlist.push({ userId: user.id, movieId, ts: Date.now() });
    writeDb(db);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const user = currentUser();
  if (!user) return NextResponse.json({ error: "Log in to use your wishlist." }, { status: 401 });
  const movieId = new URL(req.url).searchParams.get("movieId");
  const db = readDb();
  db.wishlist = (db.wishlist || []).filter((w) => !(w.userId === user.id && w.movieId === movieId));
  writeDb(db);
  return NextResponse.json({ ok: true });
}
