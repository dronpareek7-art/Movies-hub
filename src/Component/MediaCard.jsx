import { memo, useContext } from "react";
import { Link } from "react-router-dom";
import { BsBookmarkPlus, BsBookmarkCheckFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import { MdOutlineMovie } from "react-icons/md";
import { img } from "../api/tmdb";
import { Moviecontext } from "../context/movieContext";
import { linkFor, titleOf, typeOf, yearOf } from "../utils/format";

function Poster({ path, alt }) {
  if (!path) {
    return (
      <div className="poster-empty">
        <MdOutlineMovie />
        <span>{alt}</span>
      </div>
    );
  }
  return (
    <img
      src={img(path, "w342")}
      srcSet={`${img(path, "w185")} 185w, ${img(path, "w342")} 342w, ${img(path, "w500")} 500w`}
      sizes="(max-width: 640px) 40vw, 200px"
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}

function MediaCard({ item, type, hideBookmark = false }) {
  const { isInWatchlist, toggleWatchlist } = useContext(Moviecontext);
  const kind = typeOf(item, type);
  const title = titleOf(item);

  if (kind === "person") {
    return (
      <article className="media-card is-person">
        <Link to={`/person/${item.id}`} className="media-card-link">
          <div className="poster">
            <Poster path={item.profile_path} alt={title} />
          </div>
          <div className="media-meta">
            <h3 className="media-title">{title}</h3>
            <p className="media-sub">{item.known_for_department}</p>
          </div>
        </Link>
      </article>
    );
  }

  const saved = isInWatchlist(item.id, kind);
  const year = yearOf(item);
  return (
    <article className="media-card">
      <Link to={linkFor(item, type)} className="media-card-link" aria-label={`${title}${year ? `, ${year}` : ""}`}>
        <div className="poster">
          <Poster path={item.poster_path} alt={title} />
          {item.vote_average > 0 && (
            <span className="badge-rating">
              <FaStar /> {item.vote_average.toFixed(1)}
            </span>
          )}
          <div className="poster-overlay">
            <span>{kind === "tv" ? "TV Show" : "Movie"}</span>
            {item.overview && <p>{item.overview}</p>}
          </div>
        </div>
        <div className="media-meta">
          <h3 className="media-title">{title}</h3>
          <p className="media-sub">{year || "Release date TBA"}</p>
        </div>
      </Link>
      {!hideBookmark && (
        <button
          type="button"
          className={`bookmark ${saved ? "is-saved" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`}
          onClick={() => toggleWatchlist(item, kind)}
        >
          {saved ? <BsBookmarkCheckFill /> : <BsBookmarkPlus />}
        </button>
      )}
    </article>
  );
}

export default memo(MediaCard);

export function CardSkeleton() {
  return (
    <div className="media-card" aria-hidden="true">
      <div className="skeleton poster" />
      <div className="media-meta">
        <div className="skeleton" style={{ height: 14, width: "85%", marginTop: 2 }} />
        <div className="skeleton" style={{ height: 12, width: "40%", marginTop: 8 }} />
      </div>
    </div>
  );
}
