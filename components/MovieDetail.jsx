"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Poster from "./Poster";
import Rail from "./Rail";
import Stars, { StarIcon } from "./Stars";
import { useMetaStore } from "./MetaContext";
import { GENRE_BY_ID, RATING_LABELS, similarTo, watchLinks } from "@/lib/movies";

function fmtDate(ts) {
  return ts ? new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";
}

export default function MovieDetail({
  movie, user, reviews, stats, wished, autoTrailer, onClose, onOpenMovie, onLogin,
  onSaveReview, onRemoveReview, onToggleWish,
}) {
  const mine = user ? reviews.find((r) => r.userId === user.id) : null;
  const [rating, setRating] = useState(mine?.rating || 0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState(mine?.text || "");
  const [status, setStatus] = useState({ msg: "", err: false });
  const [busy, setBusy] = useState(false);
  const closeBtn = useRef(null);
  const sheet = useRef(null);
  const scroller = useRef(null);
  const similar = useMemo(() => similarTo(movie), [movie]);
  const isWished = wished.has(movie.id);
  const { meta, configured, load } = useMetaStore();
  const trailerKey = meta[movie.id]?.trailer || null;
  const [playing, setPlaying] = useState(Boolean(autoTrailer));
  const player = useRef(null);

  useEffect(() => { load(similar.map((m) => m.id)); }, [similar]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setPlaying(Boolean(autoTrailer)); }, [movie.id, autoTrailer]);
  useEffect(() => { if (playing) player.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [playing, trailerKey]);

  useEffect(() => {
    closeBtn.current?.focus();
    scroller.current?.scrollTo({ top: 0 });
  }, [movie.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const f = [...sheet.current.querySelectorAll("a[href], button, input, textarea, [tabindex='0']")].filter((n) => !n.disabled && n.tabIndex >= 0);
      if (!f.length) return;
      const a = f[0], b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const all = [...reviews].sort((a, b) => b.ts - a.ts);
  const avg = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
  const shown = hover || rating;

  async function save() {
    if (!rating) return;
    setBusy(true);
    const res = await onSaveReview(movie.id, rating, text.trim());
    setBusy(false);
    setStatus(res.ok ? { msg: "Saved. Everyone can see your rating.", err: false } : { msg: res.error, err: true });
  }
  async function remove() {
    setBusy(true);
    const res = await onRemoveReview(movie.id);
    setBusy(false);
    if (res.ok) { setRating(0); setText(""); setStatus({ msg: "Review removed.", err: false }); }
    else setStatus({ msg: res.error, err: true });
  }
  const onStarKey = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setRating((r) => Math.min(5, r + 1)); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setRating((r) => Math.max(1, r - 1)); }
  };

  return (
    <div
      ref={scroller}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 p-3"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={sheet} role="dialog" aria-modal="true" aria-labelledby="dtitle" className="my-auto w-full max-w-4xl rounded-xl bg-surface shadow-2xl">
        <div className="sticky top-0 z-10 flex justify-end rounded-t-xl bg-surface p-2 pb-0">
          <button ref={closeBtn} onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-md hover:bg-sunken">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </div>

        <div className="grid gap-5 px-4 pb-6 md:grid-cols-[240px_minmax(0,1fr)] md:gap-8 md:px-7 md:pb-8">
          <div className="max-w-[170px] md:max-w-none"><Poster movie={movie} big /></div>

          <div className="min-w-0">
            <h2 id="dtitle" className="font-display text-3xl font-bold leading-tight tracking-tight [text-wrap:balance] md:text-4xl">{movie.title}</h2>
            <p className="mb-3 mt-2 font-mono text-sm text-muted">{movie.year} · {movie.director} · {movie.language}</p>
            <div className="flex flex-wrap gap-1.5">
              {movie.genres.map((id) => (
                <span key={id} className="inline-flex items-center gap-1.5 rounded border border-line px-2 py-0.5 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full" style={{ background: `oklch(0.7 0.17 ${GENRE_BY_ID[id].h})` }} />
                  {GENRE_BY_ID[id].label}
                </span>
              ))}
            </div>

            <div className="my-4 flex flex-wrap items-center gap-x-3 gap-y-1">
              {all.length ? (
                <>
                  <span className="font-display text-4xl font-bold tracking-tight">{avg.toFixed(1)}</span>
                  <Stars value={avg} size="h-[18px] w-[18px]" />
                  <span className="font-mono text-sm text-muted">{all.length} {all.length === 1 ? "rating" : "ratings"} from readers</span>
                </>
              ) : <span className="font-mono text-sm text-muted">No ratings yet</span>}
            </div>

            <div ref={player} className="mb-5">
              {playing && trailerKey ? (
                <>
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-line bg-black">
                    <iframe
                      key={trailerKey}
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                      title={`${movie.title} trailer`}
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <button type="button" className="font-semibold text-accent underline underline-offset-2" onClick={() => setPlaying(false)}>Close trailer</button>
                    <a className="text-muted underline underline-offset-2" href={`https://www.youtube.com/watch?v=${trailerKey}`} target="_blank" rel="noopener noreferrer">Open on YouTube</a>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  {trailerKey ? (
                    <button type="button" className="btn-primary" onClick={() => setPlaying(true)}><span aria-hidden="true">▶ </span>Play trailer</button>
                  ) : (
                    <a className="btn-primary inline-flex items-center" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " " + movie.year + " official trailer")}`} target="_blank" rel="noopener noreferrer">
                      <span aria-hidden="true">▶ </span>Find trailer on YouTube
                    </a>
                  )}
                  {playing && !trailerKey && configured !== false && <span className="text-sm text-muted">Looking up the trailer…</span>}
                  {configured === false && <span className="text-sm text-muted">Add a TMDB key to play trailers inside the app.</span>}
                </div>
              )}
            </div>

            <h3 className="font-display text-lg font-bold">Summary</h3>
            <p className="mt-1 max-w-[60ch]">{movie.blurb}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                aria-pressed={isWished}
                onClick={() => onToggleWish(movie.id)}
                className={isWished ? "btn bg-fill text-on-fill" : "btn-ghost"}
              >
                {isWished ? "In your wishlist" : "Add to wishlist"}
              </button>
              {!user && <span className="text-sm text-muted">Log in to save films.</span>}
            </div>

            <div className="mt-6">
              <h3 className="font-display text-lg font-bold">Where to watch</h3>
              <p className="mt-1 max-w-[60ch] text-sm text-muted">Streaming availability changes by country and by month, so these open a live lookup.</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {watchLinks(movie).map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="btn-ghost inline-flex items-center !min-h-0 !py-1.5 text-sm">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 border-t border-line pt-5">
              <h3 className="font-display text-lg font-bold">{mine ? "Your rating" : "Rate this film"}</h3>
              {user ? (
                <>
                  <div className="flex flex-wrap items-center gap-0.5" role="radiogroup" aria-label="Your rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                        tabIndex={(rating ? rating === n : n === 1) ? 0 : -1}
                        onClick={() => setRating(n)}
                        onKeyDown={onStarKey}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        className={`rounded-md p-1 ${n <= shown ? "text-star" : "text-star-off"}`}
                      >
                        <StarIcon className="h-8 w-8" />
                      </button>
                    ))}
                    <span className="ml-2 min-w-[5ch] font-mono text-sm text-muted">{RATING_LABELS[shown]}</span>
                  </div>
                  <label htmlFor="review-text" className="text-sm font-semibold">Review (optional)</label>
                  <textarea id="review-text" className="field min-h-24 w-full resize-y leading-snug" rows={4} maxLength={600} placeholder="What did you think?" value={text} onChange={(e) => setText(e.target.value)} />
                  <p className="text-sm text-muted">Posting as {user.name}. Anyone who opens this app can read it.</p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button type="button" className="btn-primary" disabled={!rating || busy} onClick={save}>{mine ? "Update" : "Post rating"}</button>
                    {mine && <button type="button" className="btn-danger" disabled={busy} onClick={remove}>Remove mine</button>}
                  </div>
                  <p className={`min-h-[1.3em] text-sm font-semibold ${status.err ? "text-danger" : "text-accent"}`} aria-live="polite">{status.msg}</p>
                </>
              ) : (
                <div className="rounded-lg border border-line bg-sunken p-4">
                  <p className="max-w-[55ch]">Log in to rate this film, write a review and keep a wishlist. Browsing needs no account.</p>
                  <button type="button" className="btn-primary mt-3" onClick={onLogin}>Log in or sign up</button>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="font-display text-lg font-bold">Reviews</h3>
              {all.length === 0 && <p className="mt-2 text-muted">No reviews yet.</p>}
              {all.map((r) => (
                <div key={r.userId} className="border-t border-line py-3.5 first:mt-2">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="font-bold">{user && r.userId === user.id ? "You" : r.userName}</span>
                    <Stars value={r.rating} />
                    <span className="font-mono text-xs text-muted">{fmtDate(r.ts)}</span>
                  </div>
                  {r.text && <p className="mt-1.5 max-w-[65ch] whitespace-pre-wrap [overflow-wrap:anywhere]">{r.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="border-t border-line px-4 pb-4 pt-5 md:px-7" aria-labelledby="more-like">
            <h3 id="more-like" className="mb-3 font-display text-lg font-bold">More like this</h3>
            <Rail movies={similar} stats={stats} wished={wished} onOpen={onOpenMovie} label="Movies like this one" size="w-32" />
          </section>
        )}
      </div>
    </div>
  );
}
