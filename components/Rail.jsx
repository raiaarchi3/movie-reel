"use client";
import { useRef } from "react";
import Poster from "./Poster";
import Stars from "./Stars";

// Horizontal scrolling row of movie posters. Scrolls by touch, trackpad, keyboard focus or the arrow buttons.
export default function Rail({ movies, stats, wished, onOpen, label, size = "w-40" }) {
  const ref = useRef(null);
  const scrollBy = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <div className="group/rail relative">
      <div
        ref={ref}
        role="list"
        aria-label={label}
        className="flex snap-x snap-proximity gap-4 overflow-x-auto pb-4 pt-1 [scrollbar-width:thin]"
      >
        {movies.map((m) => {
          const s = stats[m.id];
          return (
            <button
              key={m.id}
              role="listitem"
              type="button"
              onClick={() => onOpen(m.id)}
              aria-label={`${m.title}, ${m.year}`}
              className={`group flex ${size} shrink-0 snap-start flex-col gap-2 text-left`}
            >
              <div className="relative w-full transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl">
                <Poster movie={m} />
                {wished?.has(m.id) && (
                  <span className="absolute right-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[0.65rem] font-semibold text-white">Saved</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-muted [overflow-wrap:anywhere]">{m.director}</div>
                <div className="mt-0.5 flex min-h-[18px] items-center gap-2 font-mono text-xs text-muted">
                  {s ? (<><Stars value={s.sum / s.n} />{(s.sum / s.n).toFixed(1)}</>) : "Not rated yet"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {movies.length > 4 && (
        <>
          <button type="button" aria-label="Scroll left" onClick={() => scrollBy(-1)} className="absolute left-0 top-1/3 hidden h-10 w-10 -translate-x-1/2 place-items-center rounded-full border border-line bg-surface shadow-lg hover:border-accent md:grid">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" aria-label="Scroll right" onClick={() => scrollBy(1)} className="absolute right-0 top-1/3 hidden h-10 w-10 translate-x-1/2 place-items-center rounded-full border border-line bg-surface shadow-lg hover:border-accent md:grid">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
    </div>
  );
}
