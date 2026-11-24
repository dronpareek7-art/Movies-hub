import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BsBookmarkHeart, BsTrash3 } from "react-icons/bs";
import { toast } from "react-toastify";
import MediaCard from "../Component/MediaCard";
import Segmented from "../Component/Segmented";
import { EmptyState } from "../Component/States";
import { Moviecontext } from "../context/movieContext";
import { useDocumentTitle } from "../hooks/useMisc";
import { dateOf, titleOf, typeOf } from "../utils/format";
import "./Browse.css";
import "./Watchlist.css";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
];
const SORTS = {
  added: "Recently added",
  rating: "Highest rated",
  release: "Release date",
  title: "Title A–Z",
};

export default function WatchList() {
  useDocumentTitle("Your watchlist");
  const { Watchlist, removeFromWatchlist, Addtowatchlist } = useContext(Moviecontext);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("added");

  const items = useMemo(() => {
    const filtered = Watchlist.filter((i) => filter === "all" || typeOf(i) === filter);
    const sorted = [...filtered];
    if (sort === "rating") sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    if (sort === "release") sorted.sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
    if (sort === "title") sorted.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
    return sorted;
  }, [Watchlist, filter, sort]);

  const counts = {
    movie: Watchlist.filter((i) => typeOf(i) === "movie").length,
    tv: Watchlist.filter((i) => typeOf(i) === "tv").length,
  };

  async function remove(item) {
    const type = typeOf(item);
    try {
      await removeFromWatchlist(item.id, type);
      toast(
        ({ closeToast }) => (
          <span className="undo-toast">
            Removed “{titleOf(item)}”
            <button
              onClick={async () => {
                await Addtowatchlist(item, type);
                closeToast();
              }}
            >
              Undo
            </button>
          </span>
        ),
        { autoClose: 5000 },
      );
    } catch {
      toast.error("Couldn't remove that title. Please try again.");
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Your watchlist</h1>
          <p className="page-sub">
            {Watchlist.length
              ? `${counts.movie} movie${counts.movie === 1 ? "" : "s"} and ${counts.tv} TV show${counts.tv === 1 ? "" : "s"} saved.`
              : "Titles you save show up here, on every device you sign in to."}
          </p>
        </div>
        {Watchlist.length > 0 && (
          <div className="browse-filters">
            <Segmented label="Filter" value={filter} options={FILTERS} onChange={setFilter} />
            <select className="select" aria-label="Sort watchlist" value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        )}
      </div>

      {Watchlist.length === 0 ? (
        <EmptyState
          icon={<BsBookmarkHeart />}
          title="Your watchlist is empty"
          message="Tap the bookmark on any movie or show to save it for later."
          action={<Link className="btn btn-primary" to="/browse/trending?type=movie">Find something to watch</Link>}
        />
      ) : items.length === 0 ? (
        <EmptyState title="Nothing in this view" message="You haven't saved any titles of this type yet." />
      ) : (
        <div className="media-grid">
          {items.map((item) => (
            <div className="wl-item" key={item.docId || `${typeOf(item)}${item.id}`}>
              <MediaCard item={item} type={typeOf(item)} hideBookmark />
              <button className="wl-remove" onClick={() => remove(item)} aria-label={`Remove ${titleOf(item)} from watchlist`}>
                <BsTrash3 /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
