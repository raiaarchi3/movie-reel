"use client";
import { useState } from "react";
import { GENRE_BY_ID } from "@/lib/movies";
import { useMovieMeta } from "./MetaContext";

// Generated poster: hue comes from the film's first genre, so no image files are needed.
// With `fluid`, text scales with the poster's own width, so it also works at thumbnail size.
export default function Poster({ movie, big = false, fluid = false }) {
  const meta = useMovieMeta(movie.id);
  const [broken, setBroken] = useState(false);
  const src = meta?.poster && !broken ? meta.poster : null;
  const base = GENRE_BY_ID[movie.genres[0]].h;
  const h = (base + ((movie.n % 5) - 2) * 9 + 360) % 360;
  const len = movie.title.length;
  const background = `linear-gradient(165deg, oklch(0.5 0.19 ${h}), oklch(0.22 0.08 ${(h + 28) % 360}))`;

  // Real poster from TMDB when available. The gradient shows while it loads or if it fails.
  if (src) {
    return (
      <div
        className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]"
        style={{ background }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${movie.title} poster`} loading="lazy" draggable={false} onError={() => setBroken(true)} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }

  if (fluid) {
    const k = len > 26 ? 9 : len > 16 ? 11 : 14;
    return (
      <div style={{ containerType: "inline-size" }} className="w-full">
        <div
          className="flex aspect-[2/3] w-full flex-col justify-end overflow-hidden rounded-[3cqw] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
          style={{ background, padding: "7cqw" }}
        >
          <div className="font-display font-bold leading-[1.02] tracking-tight [overflow-wrap:anywhere]" style={{ fontSize: `${k}cqw` }}>
            {movie.title}
          </div>
          <div className="mt-[3cqw] font-mono opacity-80" style={{ fontSize: "7cqw" }}>{movie.year}</div>
        </div>
      </div>
    );
  }

  let size = len > 26 ? 0.98 : len > 16 ? 1.15 : 1.4;
  if (big) size *= 1.3;
  return (
    <div
      className="flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-lg p-3 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]"
      style={{ background }}
    >
      <div className="font-mono text-[0.66rem] uppercase tracking-widest opacity-85">{movie.language}</div>
      <div>
        <div className="font-display font-bold leading-[1.02] tracking-tight [overflow-wrap:anywhere] [text-wrap:balance]" style={{ fontSize: `${size}rem` }}>
          {movie.title}
        </div>
        <div className="mt-2 font-mono text-xs opacity-85">{movie.year}</div>
      </div>
    </div>
  );
}
