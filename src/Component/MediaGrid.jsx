import MediaCard, { CardSkeleton } from "./MediaCard";
import { EmptyState, ErrorState } from "./States";
import { useSentinel } from "../hooks/useMisc";

/** Responsive grid with infinite scroll plus a manual "Load more" fallback. */
export default function MediaGrid({ paged, type, empty }) {
  const { items, loading, loadingMore, error, hasMore, loadMore } = paged;
  const sentinel = useSentinel(loadMore, hasMore && !loadingMore);

  if (loading) {
    return (
      <div className="media-grid">
        {Array.from({ length: 18 }, (_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }
  if (error && items.length === 0) return <ErrorState error={error} />;
  if (items.length === 0) return empty || <EmptyState title="Nothing to show" message="Try changing your filters." />;

  const seen = new Set();
  const unique = items.filter((i) => {
    const key = `${i.media_type || type}${i.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return i.poster_path || i.profile_path || i.title || i.name;
  });

  return (
    <>
      <div className="media-grid">
        {unique.map((item) => <MediaCard key={`${item.media_type || type}-${item.id}`} item={item} type={type} />)}
        {loadingMore && Array.from({ length: 6 }, (_, i) => <CardSkeleton key={`s${i}`} />)}
      </div>
      <div className="load-more-wrap" ref={sentinel}>
        {error && <ErrorState error={error} onRetry={loadMore} title="Couldn't load more" />}
        {!error && hasMore && !loadingMore && (
          <button className="btn btn-ghost" onClick={loadMore}>Load more</button>
        )}
        {!hasMore && !error && <p style={{ color: "var(--text-faint)" }}>You've reached the end.</p>}
      </div>
    </>
  );
}
