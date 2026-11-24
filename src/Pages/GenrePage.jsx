import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { tagType } from "../api/tmdb";
import { usePaged } from "../hooks/useTmdb";
import { useDocumentTitle, useGenres } from "../hooks/useMisc";
import MediaGrid from "../Component/MediaGrid";
import Segmented from "../Component/Segmented";
import "./Browse.css";

const TYPES = [{ value: "movie", label: "Movies" }, { value: "tv", label: "TV Shows" }];
const SORTS = [
  { value: "popularity.desc", label: "Most popular" },
  { value: "vote_average.desc", label: "Highest rated" },
  { value: "date.desc", label: "Newest first" },
  { value: "date.asc", label: "Oldest first" },
];

export default function GenrePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const type = params.get("type") === "tv" ? "tv" : "movie";
  const sort = SORTS.some((s) => s.value === params.get("sort")) ? params.get("sort") : "popularity.desc";
  const { movies, shows } = useGenres();
  const list = type === "tv" ? shows : movies;
  const current = list.find((g) => String(g.id) === id);

  const dateField = type === "tv" ? "first_air_date" : "primary_release_date";
  const sortBy = sort.startsWith("date") ? `${dateField}.${sort.split(".")[1]}` : sort;
  const today = new Date().toISOString().slice(0, 10);

  const paged = usePaged(`/discover/${type}`, {
    with_genres: id,
    sort_by: sortBy,
    include_adult: false,
    // Rating sort needs a vote floor, otherwise one-vote 10/10 titles float to the top.
    ...(sort === "vote_average.desc" ? { "vote_count.gte": 300 } : {}),
    // "Newest first" shouldn't start with unreleased titles.
    ...(sort === "date.desc" ? { [`${dateField}.lte`]: today, "vote_count.gte": 5 } : {}),
  });
  const tagged = { ...paged, items: tagType(paged.items, type) };

  const name = current?.name || "Genre";
  useDocumentTitle(`${name} ${type === "tv" ? "TV shows" : "movies"}`);

  function switchType(next) {
    // Movie and TV genre ids differ for a few genres, so map by name when possible.
    const other = (next === "tv" ? shows : movies).find((g) => g.name === current?.name);
    const target = other?.id ?? id;
    navigate(`/genre/${target}?type=${next}&sort=${sort}`, { replace: true });
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{name} {type === "tv" ? "TV shows" : "movies"}</h1>
          <p className="page-sub">Sorted by {SORTS.find((s) => s.value === sort).label.toLowerCase()}.</p>
        </div>
        <div className="browse-filters">
          <Segmented label="Content type" value={type} options={TYPES} onChange={switchType} />
          <select
            className="select"
            aria-label="Sort by"
            value={sort}
            onChange={(e) => setParams({ type, sort: e.target.value }, { replace: true })}
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="chip-scroll genre-chips">
        {list.map((g) => (
          <Link key={g.id} className={`chip ${String(g.id) === id ? "is-active" : ""}`} to={`/genre/${g.id}?type=${type}&sort=${sort}`}>
            {g.name}
          </Link>
        ))}
      </div>

      <MediaGrid paged={tagged} type={type} />
    </div>
  );
}
