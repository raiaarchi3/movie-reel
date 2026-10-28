// "use client";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { GENRES, GENRE_BY_ID, INDUSTRIES, MOVIES, MOVIE_BY_ID } from "@/lib/movies";
// import { MetaProvider, useMetaStore } from "./MetaContext";
// import CenterRail from "./CenterRail";
// import MovieDetail from "./MovieDetail";
// import AuthModal from "./AuthModal";

// const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
// const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// export default function MovieApp() {
//   return (
//     <MetaProvider>
//       <Inner />
//     </MetaProvider>
//   );
// }

// function Inner() {
//   const { load, configured } = useMetaStore();
//   const [genre, setGenre] = useState("action"); // a genre id, "all" or "list"
//   const [industry, setIndustry] = useState("all");
//   const [autoTrailer, setAutoTrailer] = useState(false);
//   const [user, setUser] = useState(null);
//   const [reviews, setReviews] = useState([]);
//   const [wishIds, setWishIds] = useState([]);
//   const [openId, setOpenId] = useState(null);
//   const [authOpen, setAuthOpen] = useState(false);

//   const wished = useMemo(() => new Set(wishIds), [wishIds]);

//   useEffect(() => {
//     const g = lsGet("mr.genre", "action");
//     if (g === "all" || g === "list" || GENRE_BY_ID[g]) setGenre(g === "list" ? "action" : g);
//     fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user)).catch(() => {});
//     fetch("/api/reviews").then((r) => r.json()).then((d) => setReviews(d.reviews || [])).catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (!user) { setWishIds([]); return; }
//     fetch("/api/wishlist").then((r) => r.json()).then((d) => setWishIds(d.movieIds || [])).catch(() => {});
//   }, [user]);

//   useEffect(() => {
//     if (genre !== "list") lsSet("mr.genre", genre);
//   }, [genre]);

//   const stats = useMemo(() => {
//     const s = {};
//     reviews.forEach((r) => { const x = (s[r.movieId] ||= { sum: 0, n: 0 }); x.sum += r.rating; x.n += 1; });
//     return s;
//   }, [reviews]);

//   const list = useMemo(() => {
//     const byIndustry = (m) => industry === "all" || m.industry === industry;
//     if (genre === "all") return MOVIES.filter(byIndustry);
//     if (genre === "list") return wishIds.map((id) => MOVIE_BY_ID[id]).filter(Boolean).filter(byIndustry);
//     return MOVIES.filter((m) => m.genres.includes(genre) && byIndustry(m));
//   }, [genre, industry, wishIds]);

//   // Fetch posters and trailer ids for what is on screen (plus the open film's similar picks).
//   const listKey = list.map((m) => m.id).join(",");
//   useEffect(() => { if (list.length) load(list.map((m) => m.id)); }, [listKey]); // eslint-disable-line react-hooks/exhaustive-deps
//   useEffect(() => { if (openId) load([openId]); }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps

//   const saveReview = useCallback(async (movieId, rating, text) => {
//     try {
//       const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ movieId, rating, text }) });
//       const data = await res.json();
//       if (res.status === 401) { setUser(null); return { ok: false, error: "Your session ended. Log in again." }; }
//       if (!res.ok) return { ok: false, error: data.error };
//       setReviews((rs) => [...rs.filter((r) => !(r.movieId === movieId && r.userId === data.review.userId)), data.review]);
//       return { ok: true };
//     } catch { return { ok: false, error: "Could not save. Try again." }; }
//   }, []);

//   const removeReview = useCallback(async (movieId) => {
//     try {
//       const res = await fetch(`/api/reviews?movieId=${encodeURIComponent(movieId)}`, { method: "DELETE" });
//       if (!res.ok) return { ok: false, error: "Could not remove. Try again." };
//       setReviews((rs) => rs.filter((r) => !(r.movieId === movieId && r.userId === user?.id)));
//       return { ok: true };
//     } catch { return { ok: false, error: "Could not remove. Try again." }; }
//   }, [user]);

//   const toggleWish = useCallback(async (movieId) => {
//     if (!user) { setAuthOpen(true); return; }
//     const on = wished.has(movieId);
//     setWishIds((ids) => (on ? ids.filter((i) => i !== movieId) : [movieId, ...ids]));
//     try {
//       const res = await fetch(on ? `/api/wishlist?movieId=${encodeURIComponent(movieId)}` : "/api/wishlist", {
//         method: on ? "DELETE" : "POST",
//         headers: { "Content-Type": "application/json" },
//         body: on ? undefined : JSON.stringify({ movieId }),
//       });
//       if (!res.ok) throw new Error();
//     } catch {
//       setWishIds((ids) => (on ? [movieId, ...ids] : ids.filter((i) => i !== movieId)));
//     }
//   }, [user, wished]);

//   async function logout() {
//     await fetch("/api/auth/logout", { method: "POST" });
//     setUser(null);
//     if (genre === "list") setGenre("action");
//   }

//   const open = openId ? MOVIE_BY_ID[openId] : null;
//   const title = genre === "all" ? "All films" : genre === "list" ? "My wishlist" : GENRE_BY_ID[genre].label;
//   const chip = (active) =>
//     `shrink-0 rounded-md border-[1.5px] px-3.5 py-2 text-sm font-semibold transition-colors ${active ? "border-fill bg-fill text-on-fill" : "border-line bg-transparent hover:border-accent"}`;

//   return (
//     <div className="flex min-h-[100svh] flex-col">
//       {/* Top: genres in one row. Scrolls sideways on a phone, spreads out on a wide screen. */}
//       <nav aria-label="Genres" className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-black/90 py-2.5 backdrop-blur [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))] [padding-top:max(0.625rem,env(safe-area-inset-top))]">
//         <div className="no-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap px-1 md:justify-between">
//           <button type="button" className={chip(genre === "all")} aria-pressed={genre === "all"} onClick={() => setGenre("all")}>All</button>
//           {GENRES.map((g) => (
//             <button key={g.id} type="button" className={chip(genre === g.id)} aria-pressed={genre === g.id} onClick={() => setGenre(g.id)}>{g.label}</button>
//           ))}
//           <button type="button" className={chip(genre === "list")} aria-pressed={genre === "list"} onClick={() => (user ? setGenre("list") : setAuthOpen(true))}>
//             My list{user ? ` (${wishIds.length})` : ""}
//           </button>
//         </div>
//         {user ? (
//           <button type="button" onClick={logout} title={`Signed in as ${user.name}`} className="btn-ghost !min-h-0 shrink-0 !py-1.5 text-sm">Log out</button>
//         ) : (
//           <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary !min-h-0 shrink-0 !py-1.5 text-sm">Log in</button>
//         )}
//       </nav>

//       {/* Second line: industry */}
//       <div role="group" aria-label="Film industry" className="no-scrollbar flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-2.5 [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))] md:justify-center">
//         {INDUSTRIES.map((i) => (
//           <button
//             key={i.id}
//             type="button"
//             aria-pressed={industry === i.id}
//             onClick={() => setIndustry(i.id)}
//             className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${industry === i.id ? "bg-accent text-black" : "text-muted hover:text-fg"}`}
//           >
//             {i.label}
//           </button>
//         ))}
//       </div>

//       {/* Middle: the scroller sits in the vertical centre of the screen */}
//       <main className="flex flex-1 flex-col justify-center py-6">
//         <p className="mb-2 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted" aria-live="polite">
//           {title} · {list.length} {list.length === 1 ? "film" : "films"}{user ? ` · ${user.name}` : ""}
//         </p>
//         {list.length ? (
//           <CenterRail movies={list} stats={stats} wished={wished} onOpen={(id, trailer) => { setAutoTrailer(Boolean(trailer)); setOpenId(id); }} label={`${title} films`} />
//         ) : (
//           <p className="mx-auto max-w-[44ch] px-4 py-10 text-center text-muted">
//             {genre === "list" && industry === "all"
//               ? "Your wishlist is empty. Open a film and choose Add to wishlist."
//               : "No films here yet. Try another genre or choose All industries."}
//           </p>
//         )}
//       </main>

//       {open && (
//         <MovieDetail
//           movie={open}
//           user={user}
//           reviews={reviews.filter((r) => r.movieId === open.id)}
//           stats={stats}
//           wished={wished}
//           autoTrailer={autoTrailer}
//           onClose={() => { setOpenId(null); setAutoTrailer(false); }}
//           onOpenMovie={(id) => { setAutoTrailer(false); setOpenId(id); }}
//           onLogin={() => setAuthOpen(true)}
//           onSaveReview={saveReview}
//           onRemoveReview={removeReview}
//           onToggleWish={toggleWish}
//         />
//       )}
//       {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuthed={(u) => { setUser(u); setAuthOpen(false); }} />}
//       <footer className="px-4 pb-4 text-center text-[0.7rem] text-muted [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
//         {configured ? "Posters and trailers from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB." : "Add a TMDB key to show real posters and play trailers here (see README)."}
//       </footer>
//     </div>
//   );
// }
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GENRES, GENRE_BY_ID, INDUSTRIES, MOVIES, MOVIE_BY_ID } from "@/lib/movies";
import { MetaProvider, useMetaStore } from "./MetaContext";
import CenterRail from "./CenterRail";
import MovieDetail from "./MovieDetail";
import AuthModal from "./AuthModal";

const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export default function MovieApp() {
  return (
    <MetaProvider>
      <Inner />
    </MetaProvider>
  );
}

function Inner() {
  const { load, configured, problem } = useMetaStore();
  const [genre, setGenre] = useState("action"); // a genre id, "all" or "list"
  const [industry, setIndustry] = useState("all");
  const [autoTrailer, setAutoTrailer] = useState(false);
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [wishIds, setWishIds] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  const wished = useMemo(() => new Set(wishIds), [wishIds]);

  useEffect(() => {
    const g = lsGet("mr.genre", "action");
    if (g === "all" || g === "list" || GENRE_BY_ID[g]) setGenre(g === "list" ? "action" : g);
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user)).catch(() => {});
    fetch("/api/reviews").then((r) => r.json()).then((d) => setReviews(d.reviews || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) { setWishIds([]); return; }
    fetch("/api/wishlist").then((r) => r.json()).then((d) => setWishIds(d.movieIds || [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (genre !== "list") lsSet("mr.genre", genre);
  }, [genre]);

  const stats = useMemo(() => {
    const s = {};
    reviews.forEach((r) => { const x = (s[r.movieId] ||= { sum: 0, n: 0 }); x.sum += r.rating; x.n += 1; });
    return s;
  }, [reviews]);

  const list = useMemo(() => {
    const byIndustry = (m) => industry === "all" || m.industry === industry;
    if (genre === "all") return MOVIES.filter(byIndustry);
    if (genre === "list") return wishIds.map((id) => MOVIE_BY_ID[id]).filter(Boolean).filter(byIndustry);
    return MOVIES.filter((m) => m.genres.includes(genre) && byIndustry(m));
  }, [genre, industry, wishIds]);

  // Fetch posters and trailer ids for what is on screen (plus the open film's similar picks).
  const listKey = list.map((m) => m.id).join(",");
  useEffect(() => { if (list.length) load(list.map((m) => m.id)); }, [listKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (openId) load([openId]); }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveReview = useCallback(async (movieId, rating, text) => {
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ movieId, rating, text }) });
      const data = await res.json();
      if (res.status === 401) { setUser(null); return { ok: false, error: "Your session ended. Log in again." }; }
      if (!res.ok) return { ok: false, error: data.error };
      setReviews((rs) => [...rs.filter((r) => !(r.movieId === movieId && r.userId === data.review.userId)), data.review]);
      return { ok: true };
    } catch { return { ok: false, error: "Could not save. Try again." }; }
  }, []);

  const removeReview = useCallback(async (movieId) => {
    try {
      const res = await fetch(`/api/reviews?movieId=${encodeURIComponent(movieId)}`, { method: "DELETE" });
      if (!res.ok) return { ok: false, error: "Could not remove. Try again." };
      setReviews((rs) => rs.filter((r) => !(r.movieId === movieId && r.userId === user?.id)));
      return { ok: true };
    } catch { return { ok: false, error: "Could not remove. Try again." }; }
  }, [user]);

  const toggleWish = useCallback(async (movieId) => {
    if (!user) { setAuthOpen(true); return; }
    const on = wished.has(movieId);
    setWishIds((ids) => (on ? ids.filter((i) => i !== movieId) : [movieId, ...ids]));
    try {
      const res = await fetch(on ? `/api/wishlist?movieId=${encodeURIComponent(movieId)}` : "/api/wishlist", {
        method: on ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: on ? undefined : JSON.stringify({ movieId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setWishIds((ids) => (on ? [movieId, ...ids] : ids.filter((i) => i !== movieId)));
    }
  }, [user, wished]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    if (genre === "list") setGenre("action");
  }

  const open = openId ? MOVIE_BY_ID[openId] : null;
  const title = genre === "all" ? "All films" : genre === "list" ? "My wishlist" : GENRE_BY_ID[genre].label;
  const chip = (active) =>
    `shrink-0 rounded-md border-[1.5px] px-3.5 py-2 text-sm font-semibold transition-colors ${active ? "border-fill bg-fill text-on-fill" : "border-line bg-transparent hover:border-accent"}`;

  return (
    <div className="flex min-h-[100svh] flex-col">
      {/* Top: genres in one row. Scrolls sideways on a phone, spreads out on a wide screen. */}
      <nav aria-label="Genres" className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-black/90 py-2.5 backdrop-blur [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))] [padding-top:max(0.625rem,env(safe-area-inset-top))]">
        <div className="no-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap px-1 md:justify-between">
          <button type="button" className={chip(genre === "all")} aria-pressed={genre === "all"} onClick={() => setGenre("all")}>All</button>
          {GENRES.map((g) => (
            <button key={g.id} type="button" className={chip(genre === g.id)} aria-pressed={genre === g.id} onClick={() => setGenre(g.id)}>{g.label}</button>
          ))}
          <button type="button" className={chip(genre === "list")} aria-pressed={genre === "list"} onClick={() => (user ? setGenre("list") : setAuthOpen(true))}>
            My list{user ? ` (${wishIds.length})` : ""}
          </button>
        </div>
        {user ? (
          <button type="button" onClick={logout} title={`Signed in as ${user.name}`} className="btn-ghost !min-h-0 shrink-0 !py-1.5 text-sm">Log out</button>
        ) : (
          <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary !min-h-0 shrink-0 !py-1.5 text-sm">Log in</button>
        )}
      </nav>

      {/* Second line: industry */}
      <div role="group" aria-label="Film industry" className="no-scrollbar flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-2.5 [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))] md:justify-center">
        {INDUSTRIES.map((i) => (
          <button
            key={i.id}
            type="button"
            aria-pressed={industry === i.id}
            onClick={() => setIndustry(i.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${industry === i.id ? "bg-accent text-black" : "text-muted hover:text-fg"}`}
          >
            {i.label}
          </button>
        ))}
      </div>

      {/* Middle: the scroller sits in the vertical centre of the screen */}
      <main className="flex flex-1 flex-col justify-center py-6">
        <p className="mb-2 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted" aria-live="polite">
          {title} · {list.length} {list.length === 1 ? "film" : "films"}{user ? ` · ${user.name}` : ""}
        </p>
        {list.length ? (
          <CenterRail movies={list} stats={stats} wished={wished} onOpen={(id, trailer) => { setAutoTrailer(Boolean(trailer)); setOpenId(id); }} label={`${title} films`} />
        ) : (
          <p className="mx-auto max-w-[44ch] px-4 py-10 text-center text-muted">
            {genre === "list" && industry === "all"
              ? "Your wishlist is empty. Open a film and choose Add to wishlist."
              : "No films here yet. Try another genre or choose All industries."}
          </p>
        )}
      </main>

      {open && (
        <MovieDetail
          movie={open}
          user={user}
          reviews={reviews.filter((r) => r.movieId === open.id)}
          stats={stats}
          wished={wished}
          autoTrailer={autoTrailer}
          onClose={() => { setOpenId(null); setAutoTrailer(false); }}
          onOpenMovie={(id) => { setAutoTrailer(false); setOpenId(id); }}
          onLogin={() => setAuthOpen(true)}
          onSaveReview={saveReview}
          onRemoveReview={removeReview}
          onToggleWish={toggleWish}
        />
      )}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuthed={(u) => { setUser(u); setAuthOpen(false); }} />}
      <footer className="px-4 pb-4 text-center text-[0.7rem] text-muted [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
        {problem ? <span className="text-danger">Posters and trailers are off: {problem}</span> : configured ? "Posters and trailers from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB." : "Add a TMDB key to show real posters and play trailers here (see README)."}
      </footer>
    </div>
  );
}