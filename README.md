# Movie-Hub

A movie and TV discovery app built with React, Vite, TMDB and Firebase.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and set `VITE_API_TOKEN` (TMDB "API Read Access Token").
3. `npm run dev`

`.env` is git-ignored. Note that any `VITE_` variable is bundled into the browser build, so treat the TMDB
token as a public, low-privilege, rotatable key (or proxy TMDB through a serverless function for full secrecy).

## Structure

- `src/api/tmdb.js` – the only place that talks to TMDB (Bearer auth, caching, request de-duplication)
- `src/hooks/` – `useTmdb`, `usePaged` (infinite lists), `useDebounce`, shared helpers
- `src/context/` – auth + Firestore watchlist provider (`Moviecontext`)
- `src/Component/` – Header, SearchBox, Hero, Row (sliders), MediaCard, MediaGrid, TrailerModal, states
- `src/Pages/` – Details, Person, Browse ("See all"), Genre, Search, Watchlist, Login, Profile, 404

## Firestore

Unchanged: `watchlists/{uid}/movies-shows/{movie|tv}_{id}`, `users/{uid}`, `reviews` (new reviews also store `mediaType`).
