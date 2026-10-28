# Mood Reel

Genres in one line at the top, a scrolling row of films beneath it. Open a film for its summary, reader rating, where to watch and similar films.

- Next.js 14 (App Router), JSX, Tailwind CSS
- Browsing is open to everyone. Rating, reviewing and the wishlist need a login.
- Accounts use scrypt password hashes and a signed, httpOnly cookie.
- Data lives in `data/db.json` (created on first write). Swap `lib/db.js` for a real database before deploying to a host with a temporary filesystem.
- Filter by genre (top row) and by industry: Hollywood (English), Bollywood (Hindi), Tollywood (Telugu), World (everything else).
- Posters and trailers come from TMDB. Trailers play inside the app through YouTube's embedded player.
- "Where to watch" opens live lookups (JustWatch, web search, IMDb) because streaming catalogues differ by country and change often.

## Posters and trailers (needs a free TMDB key)

1. Make a free account at themoviedb.org, then open Settings > API and request a key.
2. Put the "API Read Access Token" in `.env.local` as `TMDB_READ_TOKEN` (or the v3 key as `TMDB_API_KEY`).
3. Restart `npm run dev`.

The first visit looks each film up once and caches the result in `data/db.json`. Without a key the app still works: posters are generated and the trailer button opens a YouTube search instead.
If a film shows the wrong poster or trailer, the TMDB search matched a different title. Rename it in `lib/movies.js` to match TMDB's English title.
Keep the TMDB credit line in the footer, since their terms require it.

## Run

```bash
npm install
cp .env.example .env.local   # set SESSION_SECRET
npm run dev                   # http://localhost:3000
```

## Layout

- `components/MovieApp.jsx` genre line, movie row, wishlist, login state
- `components/MovieDetail.jsx` summary, rating form, where to watch, reviews, more like this
- `components/Rail.jsx` horizontal movie scroller
- `app/api/auth/*`, `app/api/reviews`, `app/api/wishlist`
- `lib/movies.js` genres, films and the similarity ranking (add films here)
