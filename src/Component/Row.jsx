import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { categoryRequest, tagType } from "../api/tmdb";
import { useTmdb } from "../hooks/useTmdb";
import MediaCard, { CardSkeleton } from "./MediaCard";
import Segmented from "./Segmented";
import { EmptyState, ErrorState } from "./States";

const TYPE_OPTIONS = [
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
];
const WINDOW_OPTIONS = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
];

/**
 * A titled horizontal slider backed by one TMDB category.
 * `showType` adds a Movies/TV toggle, `showWindow` adds Today/This week.
 */
export default function Row({ title, category, type: fixedType, showType = false, showWindow = false, seeAll = true }) {
  const [type, setType] = useState(fixedType || "movie");
  const [windowRange, setWindowRange] = useState("day");
  const [path, params] = categoryRequest(category, type, windowRange);
  const { data, error, loading, refetch } = useTmdb(path, params);

  const items = tagType(data?.results, category === "people" ? "person" : type).filter(
    (i) => i.poster_path || i.profile_path,
  );

  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [measure, items.length, type, windowRange]);

  function scrollBy(direction) {
    const el = track.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  const query = new URLSearchParams({ type, ...(showWindow ? { window: windowRange } : {}) }).toString();

  return (
    <section className="row" aria-label={title}>
      <header className="row-head">
        <h2 className="row-title">{title}</h2>
        <div className="row-controls">
          {showWindow && <Segmented label="Time window" value={windowRange} options={WINDOW_OPTIONS} onChange={setWindowRange} />}
          {showType && <Segmented label="Content type" value={type} options={TYPE_OPTIONS} onChange={setType} />}
          {seeAll && (
            <Link className="row-all" to={`/browse/${category}?${category === "people" ? "" : query}`}>
              See all
            </Link>
          )}
        </div>
      </header>

      <div className="row-body">
        {!edges.start && (
          <button className="row-arrow left" onClick={() => scrollBy(-1)} aria-label={`Scroll ${title} left`}>
            <FiChevronLeft />
          </button>
        )}
        {!edges.end && items.length > 0 && (
          <button className="row-arrow right" onClick={() => scrollBy(1)} aria-label={`Scroll ${title} right`}>
            <FiChevronRight />
          </button>
        )}

        <div className="row-track" ref={track} onScroll={measure}>
          {loading && Array.from({ length: 10 }, (_, i) => <CardSkeleton key={i} />)}
          {!loading && !error && items.map((item) => (
            <MediaCard key={`${type}-${item.id}`} item={item} type={category === "people" ? "person" : type} />
          ))}
        </div>

        {error && <ErrorState error={error} onRetry={refetch} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState title="Nothing here yet" message="Check back soon, or switch to another view." />
        )}
      </div>
    </section>
  );
}
