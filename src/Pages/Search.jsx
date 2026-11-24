import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { tagType } from "../api/tmdb";
import { usePaged } from "../hooks/useTmdb";
import { useDebounce } from "../hooks/useDebounce";
import { useDocumentTitle } from "../hooks/useMisc";
import MediaGrid from "../Component/MediaGrid";
import Segmented from "../Component/Segmented";
import Row from "../Component/Row";
import { EmptyState } from "../Component/States";
import "./Browse.css";
import "./Search.css";

const SCOPES = [
  { value: "multi", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
  { value: "person", label: "People" },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get("q") || "";
  const scope = SCOPES.some((s) => s.value === params.get("type")) ? params.get("type") : "multi";
  const [text, setText] = useState(urlQuery);
  const debounced = useDebounce(text.trim(), 450);

  // Typing updates the URL (debounced) so results are shareable and survive refresh.
  useEffect(() => {
    if (debounced !== urlQuery) {
      const next = new URLSearchParams(params);
      if (debounced) next.set("q", debounced);
      else next.delete("q");
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Keep the field in sync when the header search navigates here.
  useEffect(() => {
    setText(urlQuery);
  }, [urlQuery]);

  const active = urlQuery.trim();
  const paged = usePaged(active ? `/search/${scope}` : null, { query: active, include_adult: false });
  const items = tagType(paged.items, scope === "multi" ? undefined : scope).filter(
    (i) => i.media_type !== "collection" && (i.poster_path || i.profile_path),
  );

  useDocumentTitle(active ? `Search: ${active}` : "Search");

  function setScope(value) {
    const next = new URLSearchParams(params);
    next.set("type", value);
    setParams(next, { replace: true });
  }

  return (
    <div className="page">
      <h1 className="page-title">Search</h1>
      <div className="search-hero">
        <FiSearch aria-hidden="true" />
        <input
          type="search"
          value={text}
          autoFocus={!urlQuery}
          placeholder="Search movies, TV shows and people"
          aria-label="Search"
          onChange={(e) => setText(e.target.value)}
        />
        {text && (
          <button aria-label="Clear search" onClick={() => setText("")}><FiX /></button>
        )}
      </div>

      {active ? (
        <>
          <div className="filters-bar">
            <Segmented label="Result type" value={scope} options={SCOPES} onChange={setScope} />
            {!paged.loading && <span className="result-count">{items.length}{paged.hasMore ? "+" : ""} results for “{active}”</span>}
          </div>
          <MediaGrid
            paged={{ ...paged, items }}
            type={scope === "multi" ? "movie" : scope}
            empty={
              <EmptyState
                icon={<FiSearch />}
                title={`No results for “${active}”`}
                message="Check the spelling, try a shorter title, or switch the result type."
              />
            }
          />
        </>
      ) : (
        <div className="search-idle">
          <p className="page-sub">Start typing to search. Here's what people are watching today.</p>
          <div className="search-idle-row">
            <Row title="Trending today" category="trending" type="movie" seeAll={false} />
          </div>
        </div>
      )}
    </div>
  );
}
