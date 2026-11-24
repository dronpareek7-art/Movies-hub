import { useCallback, useEffect, useRef } from "react";
import { useTmdb } from "./useTmdb";

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Movie-Hub` : "Movie-Hub · Discover movies and TV shows";
  }, [title]);
}

/** Calls `onVisible` whenever the returned ref's element scrolls into view. */
export function useSentinel(onVisible, enabled = true) {
  const cb = useRef(onVisible);
  useEffect(() => {
    cb.current = onVisible;
  });
  const observer = useRef(null);
  return useCallback(
    (node) => {
      observer.current?.disconnect();
      if (!node || !enabled) return;
      observer.current = new IntersectionObserver((entries) => entries[0].isIntersecting && cb.current(), {
        rootMargin: "600px",
      });
      observer.current.observe(node);
    },
    [enabled],
  );
}

export function useGenres() {
  const movie = useTmdb("/genre/movie/list");
  const tv = useTmdb("/genre/tv/list");
  const movies = movie.data?.genres || [];
  const shows = tv.data?.genres || [];
  const names = {};
  [...movies, ...shows].forEach((g) => {
    names[g.id] = g.name;
  });
  return { movies, shows, names };
}
