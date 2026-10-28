"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Poster from "./Poster";
import Stars from "./Stars";
import { GENRE_BY_ID } from "@/lib/movies";

const ease = (t) => t * t * (3 - 2 * t);

// Horizontal scroller where the poster nearest the middle grows and the rest shrink.
// Works with touch swipe, trackpad, mouse drag (with momentum), arrow keys and the buttons.
export default function CenterRail({ movies, stats, wished, onOpen, label }) {
  const scroller = useRef(null);
  const items = useRef([]);
  const frame = useRef(0);
  const passes = useRef(0);
  const [active, setActive] = useState(0);
  const [maxW, setMaxW] = useState(240);
  const activeRef = useRef(0);
  const drag = useRef({ down: false, x: 0, left: 0, moved: 0, v: 0, lastX: 0, lastT: 0, raf: 0 });

  activeRef.current = active;

  const sizes = useCallback(() => {
    const vw = scroller.current?.clientWidth || 360;
    return { max: Math.min(vw * 0.62, 300), min: vw < 640 ? 72 : 108 };
  }, []);

  // Read every poster's position first, then write widths, so the pass never fights itself.
  const layout = useCallback(() => {
    const sc = scroller.current;
    if (!sc) return;
    const { max, min } = sizes();
    const r = sc.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const reach = max * 1.15;
    const els = items.current.filter(Boolean);
    const centers = els.map((el) => { const b = el.getBoundingClientRect(); return b.left + b.width / 2; });
    let best = 0, bestD = Infinity;
    let changed = false;
    els.forEach((el, i) => {
      const d = Math.abs(centers[i] - cx);
      if (d < bestD) { bestD = d; best = i; }
      const w = min + (max - min) * ease(Math.max(0, 1 - d / reach));
      if (Math.abs(w - el.offsetWidth) > 0.5) changed = true;
      el.style.width = `${w}px`;
    });
    setActive((a) => (a === best ? a : best));
    // Widths move neighbours, so settle with a few extra passes.
    if (changed && passes.current < 5) { passes.current += 1; frame.current = requestAnimationFrame(layout); }
  }, [sizes]);

  const schedule = useCallback(() => {
    passes.current = 0;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(layout);
  }, [layout]);

  useEffect(() => {
    const onResize = () => { setMaxW(sizes().max); schedule(); };
    onResize();
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(frame.current); };
  }, [schedule, sizes]);

  // New list (genre changed): start with the first film in the middle.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = 0;
    setActive(0);
    schedule();
  }, [movies, schedule]);

  const goTo = (i) => {
    const n = Math.max(0, Math.min(movies.length - 1, i));
    items.current[n]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  };

  // Mouse drag with momentum. Touch and trackpad use native scrolling.
  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const sc = scroller.current, d = drag.current;
    cancelAnimationFrame(d.raf);
    Object.assign(d, { down: true, x: e.clientX, left: sc.scrollLeft, moved: 0, v: 0, lastX: e.clientX, lastT: performance.now() });
    sc.style.scrollSnapType = "none";
    const move = (ev) => {
      const now = performance.now();
      d.moved = Math.max(d.moved, Math.abs(ev.clientX - d.x));
      sc.scrollLeft = d.left - (ev.clientX - d.x);
      const dt = Math.max(1, now - d.lastT);
      d.v = d.v * 0.7 + ((ev.clientX - d.lastX) / dt) * 0.3;
      d.lastX = ev.clientX; d.lastT = now;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      d.down = false;
      let last = performance.now();
      const glide = (t) => {
        const dt = t - last; last = t;
        sc.scrollLeft -= d.v * dt;
        d.v *= Math.pow(0.94, dt / 16);
        if (Math.abs(d.v) > 0.03) d.raf = requestAnimationFrame(glide);
        else { sc.style.scrollSnapType = ""; goTo(activeRef.current); }
      };
      d.raf = requestAnimationFrame(glide);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); items.current[Math.min(movies.length - 1, active + 1)]?.focus(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); items.current[Math.max(0, active - 1)]?.focus(); }
  };

  const cur = movies[Math.min(active, movies.length - 1)];
  const s = cur && stats[cur.id];

  return (
    <div className="w-full">
      <div className="relative">
        <ul
          ref={scroller}
          aria-label={label}
          onScroll={schedule}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          onClickCapture={(e) => { if (drag.current.moved > 5) { e.stopPropagation(); e.preventDefault(); drag.current.moved = 0; } }}
          className="no-scrollbar m-0 flex snap-x snap-proximity items-end gap-2 overflow-x-auto overflow-y-hidden py-3 sm:gap-3"
          style={{ listStyle: "none", paddingInline: `calc(50% - ${maxW / 2}px)`, minHeight: `${maxW * 1.5 + 24}px`, cursor: "grab", touchAction: "pan-x pan-y" }}
        >
          {movies.map((m, i) => (
            <li key={m.id} ref={(el) => (items.current[i] = el)} className="shrink-0 snap-center" style={{ width: 72 }}>
              <button
                type="button"
                onClick={() => (i === active ? onOpen(m.id) : goTo(i))}
                onFocus={() => goTo(i)}
                aria-label={`${m.title}, ${m.year}${i === active ? ". Open details" : ""}`}
                className="relative block w-full select-none text-left"
                draggable={false}
              >
                <Poster movie={m} fluid />
                {wished?.has(m.id) && <span className="absolute right-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">Saved</span>}
              </button>
            </li>
          ))}
        </ul>
        {movies.length > 1 && (
          <>
            <button type="button" aria-label="Previous film" onClick={() => goTo(active - 1)} disabled={active === 0} className="absolute left-1 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-black/70 hover:border-accent disabled:opacity-30 md:grid">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" aria-label="Next film" onClick={() => goTo(active + 1)} disabled={active >= movies.length - 1} className="absolute right-1 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-black/70 hover:border-accent disabled:opacity-30 md:grid">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </div>

      {cur && (
        <div className="mx-auto mt-3 flex max-w-md flex-col items-center gap-1.5 px-2 text-center" aria-live="polite">
          <div className="font-display text-xl font-bold tracking-tight sm:text-2xl">{cur.title}</div>
          <div className="font-mono text-xs text-muted">{cur.year} · {cur.director} · {cur.genres.map((g) => GENRE_BY_ID[g].label).join(", ")}</div>
          <div className="flex min-h-[18px] items-center gap-2 font-mono text-xs text-muted">
            {s ? (<><Stars value={s.sum / s.n} />{(s.sum / s.n).toFixed(1)} ({s.n})</>) : "Not rated yet"}
          </div>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <button type="button" className="btn-primary !min-h-0 !py-1.5 text-sm" onClick={() => onOpen(cur.id, true)}>
              <span aria-hidden="true">▶ </span>Trailer
            </button>
            <button type="button" className="btn-ghost !min-h-0 !py-1.5 text-sm" onClick={() => onOpen(cur.id)}>View details</button>
          </div>
        </div>
      )}
    </div>
  );
}
