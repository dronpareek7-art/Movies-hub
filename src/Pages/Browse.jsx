import { useSearchParams, useParams } from "react-router-dom";
import { CATEGORY_LABELS, categoryRequest, tagType } from "../api/tmdb";
import { usePaged } from "../hooks/useTmdb";
import { useDocumentTitle } from "../hooks/useMisc";
import MediaGrid from "../Component/MediaGrid";
import Segmented from "../Component/Segmented";
import { EmptyState } from "../Component/States";
import "./Browse.css";

const TYPES = [{ value: "movie", label: "Movies" }, { value: "tv", label: "TV Shows" }];
const WINDOWS = [{ value: "day", label: "Today" }, { value: "week", label: "This week" }];
const CATEGORIES = ["trending", "popular", "top_rated", "upcoming", "people"];

/** "See all" destination for every homepage row. */
export default function Browse() {
  const { category } = useParams();
  const [params, setParams] = useSearchParams();
  const valid = CATEGORIES.includes(category);
  const isPeople = category === "people";
  const type = params.get("type") === "tv" ? "tv" : "movie";
  const windowRange = params.get("window") === "week" ? "week" : "day";

  const [path, query] = categoryRequest(category, type, windowRange);
  const paged = usePaged(valid ? path : null, query);
  const kind = isPeople ? "person" : type;
  const tagged = { ...paged, items: tagType(paged.items, kind) };

  const label = CATEGORY_LABELS[category] || "Browse";
  const heading = isPeople ? label : `${label} ${type === "tv" ? "TV shows" : "movies"}`;
  useDocumentTitle(valid ? heading : "Not found");

  const update = (patch) => setParams({ type, ...(category === "trending" ? { window: windowRange } : {}), ...patch }, { replace: true });

  if (!valid) return <div className="page"><EmptyState title="That list doesn't exist" message="Pick a category from the menu." /></div>;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{heading}</h1>
          <p className="page-sub">
            {category === "trending" && "What everyone is watching right now."}
            {category === "popular" && "The most talked-about titles, updated daily."}
            {category === "top_rated" && "Critically loved and audience approved."}
            {category === "upcoming" && "Releasing in the next six months."}
            {isPeople && "The faces everyone is searching for."}
          </p>
        </div>
        {!isPeople && (
          <div className="browse-filters">
            {category === "trending" && (
              <Segmented label="Time window" value={windowRange} options={WINDOWS} onChange={(v) => update({ window: v })} />
            )}
            <Segmented label="Content type" value={type} options={TYPES} onChange={(v) => update({ type: v })} />
          </div>
        )}
      </div>
      <MediaGrid paged={tagged} type={kind} />
    </div>
  );
}
