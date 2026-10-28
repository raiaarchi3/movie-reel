// import { NextResponse } from "next/server";
// import { readDb, writeDb } from "@/lib/db";
// import { MOVIE_BY_ID } from "@/lib/movies";

// export const dynamic = "force-dynamic";

// const API = "https://api.themoviedb.org/3";
// const IMG = "https://image.tmdb.org/t/p/w500";

// function auth() {
//   const token = process.env.TMDB_READ_TOKEN;
//   const key = process.env.TMDB_API_KEY;
//   return {
//     headers: token ? { Authorization: `Bearer ${token}`, accept: "application/json" } : { accept: "application/json" },
//     qs: !token && key ? `api_key=${encodeURIComponent(key)}&` : "",
//     ok: Boolean(token || key),
//   };
// }

// async function tmdb(path, a) {
//   const url = `${API}${path}${path.includes("?") ? "&" : "?"}${a.qs}`;
//   const res = await fetch(url, { headers: a.headers, cache: "no-store" });
//   if (!res.ok) throw new Error(`TMDB ${res.status}`);
//   return res.json();
// }

// // Find the poster and the official trailer's YouTube id for one film.
// async function lookup(movie, a) {
//   const q = encodeURIComponent(movie.title);
//   let found = null;
//   for (const extra of [`&year=${movie.year}`, ""]) {
//     const data = await tmdb(`/search/movie?query=${q}${extra}&include_adult=false`, a);
//     const hit = (data.results || []).find((r) => Math.abs(Number((r.release_date || "0").slice(0, 4)) - movie.year) <= 1) || (extra ? null : data.results?.[0]);
//     if (hit) { found = hit; break; }
//   }
//   if (!found) return { poster: null, trailer: null };
//   let trailer = null;
//   try {
//     const v = await tmdb(`/movie/${found.id}/videos`, a);
//     const yt = (v.results || []).filter((x) => x.site === "YouTube");
//     const pick =
//       yt.find((x) => x.type === "Trailer" && x.official) ||
//       yt.find((x) => x.type === "Trailer") ||
//       yt.find((x) => x.type === "Teaser");
//     trailer = pick ? pick.key : null;
//   } catch {}
//   return { poster: found.poster_path ? IMG + found.poster_path : null, trailer, tmdbId: found.id };
// }

// // GET /api/meta?ids=a,b,c  ->  { configured, meta: { id: { poster, trailer } } }
// export async function GET(req) {
//   const a = auth();
//   if (!a.ok) return NextResponse.json({ configured: false, meta: {} });

//   const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").filter((id) => MOVIE_BY_ID[id]).slice(0, 80);
//   const db = readDb();
//   db.meta ||= {};
//   const missing = ids.filter((id) => !db.meta[id]);

//   let dirty = false;
//   const queue = [...missing];
//   const worker = async () => {
//     while (queue.length) {
//       const id = queue.shift();
//       try {
//         db.meta[id] = { ...(await lookup(MOVIE_BY_ID[id], a)), ts: Date.now() };
//         dirty = true;
//       } catch {
//         // Leave it uncached so a later request retries.
//       }
//     }
//   };
//   await Promise.all(Array.from({ length: 6 }, worker));
//   if (dirty) {
//     // Re-read so we don't overwrite reviews written while we were fetching.
//     const fresh = readDb();
//     fresh.meta = { ...(fresh.meta || {}), ...db.meta };
//     writeDb(fresh);
//   }

//   const meta = {};
//   ids.forEach((id) => { if (db.meta[id]) meta[id] = { poster: db.meta[id].poster, trailer: db.meta[id].trailer }; });
//   return NextResponse.json({ configured: true, meta });
// }
import { NextResponse } from "next/server";
import { MOVIE_BY_ID } from "@/lib/movies";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

// Kept in memory per server instance. Vercel's disk is read-only, so nothing is written to files.
// The CDN cache headers below do the long-term caching.
const cache = globalThis.__metaCache || (globalThis.__metaCache = new Map());

function auth() {
  const token = (process.env.TMDB_READ_TOKEN || "").trim();
  const key = (process.env.TMDB_API_KEY || "").trim();
  return {
    headers: token ? { Authorization: `Bearer ${token}`, accept: "application/json" } : { accept: "application/json" },
    qs: !token && key ? `api_key=${encodeURIComponent(key)}&` : "",
    ok: Boolean(token || key),
  };
}

async function tmdb(path, a) {
  const url = `${API}${path}${path.includes("?") ? "&" : "?"}${a.qs}`;
  const res = await fetch(url, { headers: a.headers, cache: "no-store" });
  if (!res.ok) {
    const err = new Error(`TMDB ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Find the poster and the official trailer's YouTube id for one film.
async function lookup(movie, a) {
  const q = encodeURIComponent(movie.title);
  let found = null;
  for (const extra of [`&year=${movie.year}`, ""]) {
    const data = await tmdb(`/search/movie?query=${q}${extra}&include_adult=false`, a);
    const hit =
      (data.results || []).find((r) => Math.abs(Number((r.release_date || "0").slice(0, 4)) - movie.year) <= 1) ||
      (extra ? null : data.results?.[0]);
    if (hit) { found = hit; break; }
  }
  if (!found) return { poster: null, trailer: null };
  let trailer = null;
  try {
    const v = await tmdb(`/movie/${found.id}/videos`, a);
    const yt = (v.results || []).filter((x) => x.site === "YouTube");
    const pick =
      yt.find((x) => x.type === "Trailer" && x.official) ||
      yt.find((x) => x.type === "Trailer") ||
      yt.find((x) => x.type === "Teaser");
    trailer = pick ? pick.key : null;
  } catch {}
  return { poster: found.poster_path ? IMG + found.poster_path : null, trailer };
}

// GET /api/meta?ids=a,b,c  ->  { configured, meta: { id: { poster, trailer } }, failed: [...], error? }
export async function GET(req) {
  const a = auth();
  if (!a.ok) {
    return NextResponse.json({ configured: false, meta: {}, failed: [], error: "TMDB_READ_TOKEN is not set on the server." });
  }

  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").filter((id) => MOVIE_BY_ID[id]).slice(0, 80);
  const queue = ids.filter((id) => !cache.has(id));
  const failed = [];
  let authError = false;

  const worker = async () => {
    while (queue.length) {
      const id = queue.shift();
      try {
        cache.set(id, await lookup(MOVIE_BY_ID[id], a));
      } catch (e) {
        failed.push(id);
        if (e.status === 401 || e.status === 403) authError = true;
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

  const meta = {};
  ids.forEach((id) => { if (cache.has(id)) meta[id] = cache.get(id); });

  const res = NextResponse.json({
    configured: !authError,
    meta,
    failed,
    ...(authError ? { error: "TMDB rejected the token (401). Check TMDB_READ_TOKEN in the Vercel settings." } : {}),
  });
  // Cache complete answers at the edge for a day; never cache a partial or failed one.
  res.headers.set(
    "Cache-Control",
    failed.length || authError ? "no-store" : "public, s-maxage=86400, stale-while-revalidate=604800"
  );
  return res;
}