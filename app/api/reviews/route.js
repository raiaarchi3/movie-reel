import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { MOVIE_BY_ID } from "@/lib/movies";

export const dynamic = "force-dynamic";

// Anyone can read reviews.
export async function GET() {
  const db = readDb();
  const names = Object.fromEntries(db.users.map((u) => [u.id, u.name]));
  const reviews = db.reviews.map((r) => ({
    movieId: r.movieId,
    userId: r.userId,
    userName: names[r.userId] || "A reader",
    rating: r.rating,
    text: r.text,
    ts: r.ts,
  }));
  return NextResponse.json({ reviews });
}

// Only logged-in users can post or update their review.
export async function POST(req) {
  const user = currentUser();
  if (!user) return NextResponse.json({ error: "Log in to post a review." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const movieId = String(body.movieId || "");
  const rating = Math.round(Number(body.rating));
  const text = String(body.text || "").trim().slice(0, 600);
  if (!MOVIE_BY_ID[movieId]) return NextResponse.json({ error: "Unknown movie." }, { status: 400 });
  if (!(rating >= 1 && rating <= 5)) return NextResponse.json({ error: "Choose a rating from 1 to 5." }, { status: 400 });

  const db = readDb();
  const review = { movieId, userId: user.id, rating, text, ts: Date.now() };
  const i = db.reviews.findIndex((r) => r.movieId === movieId && r.userId === user.id);
  if (i >= 0) db.reviews[i] = review;
  else db.reviews.push(review);
  writeDb(db);
  return NextResponse.json({ review: { ...review, userName: user.name } });
}

export async function DELETE(req) {
  const user = currentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  const movieId = new URL(req.url).searchParams.get("movieId");
  const db = readDb();
  db.reviews = db.reviews.filter((r) => !(r.movieId === movieId && r.userId === user.id));
  writeDb(db);
  return NextResponse.json({ ok: true });
}
