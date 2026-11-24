import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { img } from "../api/tmdb";
import { useTmdb } from "../hooks/useTmdb";
import { useDebounce } from "../hooks/useDebounce";
import { titleOf, typeOf, yearOf } from "../utils/format";

/** Debounced live search with keyboard navigation. Enter opens the full results page. */
export default function SearchBox({ autoFocus = false, onDone, className = "" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef(null);
  const navigate = useNavigate();

  const debounced = useDebounce(query.trim(), 350);
  const enabled = debounced.length >= 2;
  const { data, loading, error } = useTmdb("/search/multi", { query: debounced, include_adult: false }, enabled);
  const results = enabled
    ? (data?.results || []).filter((r) => r.media_type !== "collection" && (r.poster_path || r.profile_path)).slice(0, 6)
    : [];

  useEffect(() => {
    const onDown = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function finish(path) {
    navigate(path);
    setQuery("");
    setOpen(false);
    setActive(-1);
    onDone?.();
  }

  function submit(e) {
    e.preventDefault();
    const q = query.trim();
    if (active >= 0 && results[active]) {
      const r = results[active];
      finish(`/${typeOf(r)}/${r.id}`);
    } else if (q) {
      finish(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      onDone?.();
    }
  }

  const showPanel = open && enabled;

  return (
    <div className={`searchbox ${className}`} ref={box}>
      <form onSubmit={submit} role="search" className="search-field">
        <FiSearch className="search-ico" aria-hidden="true" />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          placeholder="Search movies, TV shows, people"
          aria-label="Search movies, TV shows and people"
          aria-expanded={showPanel}
          aria-controls="search-suggestions"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}>
            <FiX />
          </button>
        )}
      </form>

      {showPanel && (
        <ul className="suggestions" id="search-suggestions" role="listbox">
          {(loading || query.trim() !== debounced) && results.length === 0 && (
            <li className="suggestion-note">Searching…</li>
          )}
          {error && <li className="suggestion-note">Search is unavailable right now.</li>}
          {!loading && !error && query.trim() === debounced && results.length === 0 && (
            <li className="suggestion-note">No matches for “{debounced}”.</li>
          )}
          {results.map((r, i) => {
            const kind = typeOf(r);
            return (
              <li key={`${kind}${r.id}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={`suggestion ${i === active ? "is-active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => finish(`/${kind}/${r.id}`)}
                >
                  <img src={img(r.poster_path || r.profile_path, "w92")} alt="" loading="lazy" />
                  <span>
                    <b>{titleOf(r)}</b>
                    <small>
                      {kind === "person" ? r.known_for_department || "Person" : kind === "tv" ? "TV Show" : "Movie"}
                      {yearOf(r) ? ` · ${yearOf(r)}` : ""}
                    </small>
                  </span>
                </button>
              </li>
            );
          })}
          {results.length > 0 && (
            <li>
              <button type="button" className="suggestion-all" onClick={() => finish(`/search?q=${encodeURIComponent(query.trim())}`)}>
                See all results for “{query.trim()}”
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
