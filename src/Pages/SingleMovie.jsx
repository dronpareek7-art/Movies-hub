import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FaPlay, FaStar } from "react-icons/fa";
import { BsBookmarkPlus, BsBookmarkCheckFill } from "react-icons/bs";
import { FiExternalLink, FiMapPin, FiShare2 } from "react-icons/fi";
import { MdOutlineMovieFilter } from "react-icons/md";
import { toast } from "react-toastify";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { img, tagType } from "../api/tmdb";
import { useTmdb } from "../hooks/useTmdb";
import { useDocumentTitle } from "../hooks/useMisc";
import { Moviecontext } from "../context/movieContext";
import { formatDate, formatMoney, formatRuntime, pickTrailer, regionName, titleOf, yearOf } from "../utils/format";
import MediaCard from "../Component/MediaCard";
import RatingRing from "../Component/RatingRing";
import TrailerModal from "../Component/TrailerModal";
import { EmptyState, ErrorState } from "../Component/States";
import LocationData from "./LocationData";
import "./SingleMovie.css";

const PROVIDER_GROUPS = [
  { key: "flatrate", label: "Stream" },
  { key: "rent", label: "Rent" },
  { key: "buy", label: "Buy" },
];

function DetailSkeleton() {
  return (
    <div className="detail" aria-busy="true">
      <div className="detail-hero">
        <div className="detail-body">
          <div className="skeleton detail-poster" />
          <div className="detail-info">
            <div className="skeleton" style={{ height: 52, width: "70%" }} />
            <div className="skeleton" style={{ height: 18, width: "40%", marginTop: 18 }} />
            <div className="skeleton" style={{ height: 90, width: "90%", marginTop: 28 }} />
            <div className="skeleton" style={{ height: 46, width: 280, marginTop: 28, borderRadius: 999 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Strip({ title, children, id }) {
  return (
    <section className="strip" aria-labelledby={id}>
      <h2 id={id} className="section-title">{title}</h2>
      {children}
    </section>
  );
}

function TmdbReview({ review }) {
  const [open, setOpen] = useState(false);
  const text = review.content || "";
  const long = text.length > 420;
  const rating = review.author_details?.rating;
  return (
    <article className="review">
      <header>
        <span className="review-avatar">{(review.author || "?").charAt(0).toUpperCase()}</span>
        <div>
          <h4>{review.author}</h4>
          <small>{formatDate(review.created_at?.slice(0, 10))}</small>
        </div>
        {rating && <span className="review-score"><FaStar /> {rating}</span>}
      </header>
      <p className={open ? "" : "clamp"}>{text}</p>
      {long && <button className="link-btn" onClick={() => setOpen(!open)}>{open ? "Show less" : "Read more"}</button>}
    </article>
  );
}

export default function SingleMovie() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const type = pathname.startsWith("/tv") ? "tv" : "movie";
  const { user, isInWatchlist, toggleWatchlist } = useContext(Moviecontext);

  // One request replaces what used to be six: details, credits, videos, reviews,
  // recommendations, similar titles and streaming providers all come back together.
  const { data: item, error, loading, refetch } = useTmdb(`/${type}/${id}`, {
    append_to_response: `${type === "tv" ? "aggregate_credits" : "credits"},videos,reviews,recommendations,similar,watch/providers,external_ids`,
    include_video_language: "en,null",
  });

  const [trailer, setTrailer] = useState(null); // null | { key?: string }
  const [region, setRegion] = useState(null);
  const [providerTab, setProviderTab] = useState("flatrate");
  const [userReviews, setUserReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [posting, setPosting] = useState(false);
  const geo = LocationData();

  useDocumentTitle(item ? `${titleOf(item)}${yearOf(item) ? ` (${yearOf(item)})` : ""}` : "");

  // Community reviews from Firestore, fetched for this title only.
  useEffect(() => {
    let alive = true;
    getDocs(query(collection(db, "reviews"), where("movieId", "==", String(id))))
      .then((snap) => {
        if (!alive) return;
        const rows = snap.docs
          .map((d) => ({ ...d.data(), _id: d.id }))
          .filter((r) => !r.mediaType || r.mediaType === type)
          .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setUserReviews(rows);
      })
      .catch(() => alive && setUserReviews([]));
    return () => {
      alive = false;
    };
  }, [id, type]);

  const providers = item?.["watch/providers"]?.results;
  const regions = useMemo(() => Object.keys(providers || {}).sort((a, b) => regionName(a).localeCompare(regionName(b))), [providers]);
  const activeRegion = region && providers?.[region] ? region : providers?.IN ? "IN" : providers?.US ? "US" : regions[0];
  const regionData = activeRegion ? providers[activeRegion] : null;
  const groups = PROVIDER_GROUPS.filter((g) => regionData?.[g.key]?.length);
  const tab = groups.find((g) => g.key === providerTab) ? providerTab : groups[0]?.key;

  async function submitReview() {
    if (!user) {
      toast.info("Sign in to write a review.");
      navigate(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const text = reviewText.trim();
    if (text.length < 5) {
      toast.error("Write at least a few words before posting.");
      return;
    }
    setPosting(true);
    try {
      const userName = user.displayName || user.email.split("@")[0].replace(/[0-9.]/g, "") || "Movie fan";
      const doc = { movieId: String(id), mediaType: type, userName, review: text, createdAt: new Date() };
      await addDoc(collection(db, "reviews"), doc);
      setUserReviews((rows) => [{ ...doc, createdAt: { toMillis: () => Date.now() } }, ...rows]);
      setReviewText("");
      toast.success("Review posted.");
    } catch (err) {
      console.error(err);
      toast.error("We couldn't post your review. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: titleOf(item), url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard.");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }

  async function findTheatres() {
    try {
      const coords = await geo.getLocation();
      await geo.getNearestTheatres(coords);
    } catch {
      /* the hook already exposes a readable error message */
    }
  }

  if (loading) return <DetailSkeleton />;
  if (error) {
    return (
      <div className="page">
        {error.status === 404 ? (
          <EmptyState title="We couldn't find that title" message="It may have been removed from TMDB." action={<Link className="btn btn-primary" to="/">Back to home</Link>} />
        ) : (
          <ErrorState error={error} onRetry={refetch} />
        )}
      </div>
    );
  }
  if (!item) return null;

  const title = titleOf(item);
  const saved = isInWatchlist(item.id, type);
  const cast = (type === "tv" ? item.aggregate_credits?.cast : item.credits?.cast) || [];
  const crew = item.credits?.crew || [];
  const directors = type === "movie" ? crew.filter((c) => c.job === "Director") : item.created_by || [];
  const writers = type === "movie" ? crew.filter((c) => ["Screenplay", "Writer", "Story"].includes(c.job)).slice(0, 3) : [];
  const videos = (item.videos?.results || []).filter((v) => v.site === "YouTube");
  const mainTrailer = pickTrailer(videos);
  const reviews = item.reviews?.results || [];
  const recs = tagType(item.recommendations?.results, type).filter((i) => i.poster_path);
  const similar = tagType(item.similar?.results, type)
    .filter((i) => i.poster_path && !recs.some((r) => r.id === i.id))
    .slice(0, 18);
  const runtime = type === "movie" ? item.runtime : item.episode_run_time?.[0] || item.last_episode_to_air?.runtime;
  const imdb = item.imdb_id || item.external_ids?.imdb_id;
  const lang = item.spoken_languages?.map((l) => l.english_name).join(", ");

  return (
    <article className="detail">
      <section className="detail-hero">
        {item.backdrop_path && (
          <img className="detail-backdrop" src={img(item.backdrop_path, "w1280")} srcSet={`${img(item.backdrop_path, "w780")} 780w, ${img(item.backdrop_path, "w1280")} 1280w, ${img(item.backdrop_path, "original")} 2000w`} sizes="100vw" alt="" fetchPriority="high" />
        )}
        <div className="detail-shade" />
        <div className="detail-body">
          <div className="detail-poster">
            {item.poster_path ? <img src={img(item.poster_path, "w500")} srcSet={`${img(item.poster_path, "w342")} 342w, ${img(item.poster_path, "w500")} 500w, ${img(item.poster_path, "w780")} 780w`} sizes="(max-width: 760px) 60vw, 320px" alt={`${title} poster`} /> : <div className="poster-empty"><MdOutlineMovieFilter /><span>{title}</span></div>}
          </div>

          <div className="detail-info">
            <h1 className="detail-title">
              {title} {yearOf(item) && <span className="detail-year">({yearOf(item)})</span>}
            </h1>
            {item.tagline && <p className="detail-tagline">{item.tagline}</p>}

            <p className="detail-facts">
              {item.release_date || item.first_air_date ? <span>{formatDate(item.release_date || item.first_air_date)}</span> : null}
              {runtime ? <span>{formatRuntime(runtime)}{type === "tv" ? " / episode" : ""}</span> : null}
              {type === "tv" && item.number_of_seasons ? <span>{item.number_of_seasons} season{item.number_of_seasons > 1 ? "s" : ""}</span> : null}
              <span className="kind-tag">{type === "tv" ? "TV Show" : "Movie"}</span>
            </p>

            {item.genres?.length > 0 && (
              <div className="chip-row">
                {item.genres.map((g) => <Link key={g.id} className="chip" to={`/genre/${g.id}?type=${type}`}>{g.name}</Link>)}
              </div>
            )}

            <div className="detail-score">
              <RatingRing vote={item.vote_average} />
              <div>
                <b>User score</b>
                <small>{item.vote_count ? `${item.vote_count.toLocaleString()} votes on TMDB` : "Not enough votes yet"}</small>
              </div>
            </div>

            <div className="detail-actions">
              <button className="btn btn-primary" onClick={() => setTrailer({ key: mainTrailer?.key })} disabled={!mainTrailer} title={mainTrailer ? "" : "No trailer available"}>
                <FaPlay /> {mainTrailer ? "Watch trailer" : "No trailer"}
              </button>
              <button className={`btn btn-ghost ${saved ? "is-active" : ""}`} aria-pressed={saved} onClick={() => toggleWatchlist(item, type)}>
                {saved ? <BsBookmarkCheckFill /> : <BsBookmarkPlus />} {saved ? "In your watchlist" : "Add to watchlist"}
              </button>
              <button className="btn btn-ghost" onClick={share} aria-label="Share"><FiShare2 /> Share</button>
            </div>

            {item.overview && (
              <div className="detail-overview">
                <h2>Overview</h2>
                <p>{item.overview}</p>
              </div>
            )}

            {(directors.length > 0 || writers.length > 0) && (
              <ul className="credits-line">
                {directors.length > 0 && <li><b>{type === "tv" ? "Created by" : "Director"}</b>{directors.map((d) => d.name).join(", ")}</li>}
                {writers.length > 0 && <li><b>Writing</b>{[...new Set(writers.map((w) => w.name))].join(", ")}</li>}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div className="detail-content">
        <div className="detail-main">
          {cast.length > 0 && (
            <Strip title="Top billed cast" id="cast">
              <div className="h-scroll">
                {cast.slice(0, 20).map((a) => (
                  <Link to={`/person/${a.id}`} className="cast-card" key={a.id}>
                    {a.profile_path ? <img src={img(a.profile_path, "w185")} alt="" loading="lazy" /> : <div className="cast-none" aria-hidden="true">{a.name.charAt(0)}</div>}
                    <b>{a.name}</b>
                    <small>{a.character || a.roles?.[0]?.character || ""}</small>
                  </Link>
                ))}
              </div>
            </Strip>
          )}

          <Strip title="Where to watch" id="providers">
            {regionData && groups.length > 0 ? (
              <div className="providers">
                <div className="providers-bar">
                  <div className="segmented" role="group" aria-label="Availability type">
                    {groups.map((g) => <button key={g.key} aria-pressed={tab === g.key} onClick={() => setProviderTab(g.key)}>{g.label}</button>)}
                  </div>
                  <select className="select" value={activeRegion} aria-label="Country" onChange={(e) => setRegion(e.target.value)}>
                    {regions.map((r) => <option key={r} value={r}>{regionName(r)}</option>)}
                  </select>
                </div>
                <ul className="provider-list">
                  {regionData[tab].map((p) => (
                    <li key={p.provider_id}>
                      <a href={regionData.link} target="_blank" rel="noreferrer" title={`${p.provider_name} (opens TMDB watch page)`}>
                        <img src={img(p.logo_path, "w92")} alt={p.provider_name} />
                      </a>
                    </li>
                  ))}
                </ul>
                <small className="credit">Availability data from JustWatch via TMDB.</small>
              </div>
            ) : (
              <p className="muted">No streaming, rental or purchase options are listed for this title yet.</p>
            )}
          </Strip>

          {videos.length > 0 && (
            <Strip title="Trailers and clips" id="videos">
              <div className="h-scroll">
                {videos.slice(0, 10).map((v) => (
                  <button className="video-card" key={v.key} onClick={() => setTrailer({ key: v.key })}>
                    <span className="video-thumb">
                      <img src={`https://i.ytimg.com/vi/${v.key}/hqdefault.jpg`} alt="" loading="lazy" />
                      <i><FaPlay /></i>
                    </span>
                    <b>{v.name}</b>
                    <small>{v.type}</small>
                  </button>
                ))}
              </div>
            </Strip>
          )}

          {type === "tv" && item.seasons?.filter((s) => s.season_number > 0).length > 0 && (
            <Strip title="Seasons" id="seasons">
              <div className="h-scroll">
                {item.seasons.filter((s) => s.season_number > 0).map((s) => (
                  <div className="season-card" key={s.id}>
                    {s.poster_path ? <img src={img(s.poster_path, "w185")} alt="" loading="lazy" /> : <div className="cast-none">{s.season_number}</div>}
                    <b>{s.name}</b>
                    <small>{s.episode_count} episodes{s.air_date ? ` · ${s.air_date.slice(0, 4)}` : ""}</small>
                  </div>
                ))}
              </div>
            </Strip>
          )}

          <Strip title="Reviews" id="reviews">
            <div className="reviews">
              {userReviews.map((r) => (
                <article className="review is-community" key={r._id || r.review}>
                  <header>
                    <span className="review-avatar">{(r.userName || "?").charAt(0).toUpperCase()}</span>
                    <div><h4>{r.userName}</h4><small>Movie-Hub member</small></div>
                  </header>
                  <p>{r.review}</p>
                </article>
              ))}
              {reviews.slice(0, 5).map((r) => <TmdbReview review={r} key={r.id} />)}
              {userReviews.length === 0 && reviews.length === 0 && <p className="muted">No reviews yet. Be the first to share what you thought.</p>}
            </div>

            <form className="review-form" onSubmit={(e) => { e.preventDefault(); submitReview(); }}>
              <label htmlFor="review-text">Write a review</label>
              <textarea id="review-text" rows={4} maxLength={1200} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder={user ? "What did you think?" : "Sign in to share your thoughts"} />
              <div>
                <small>{reviewText.length}/1200</small>
                <button className="btn btn-primary btn-sm" type="submit" disabled={posting}>{posting ? "Posting…" : "Post review"}</button>
              </div>
            </form>
          </Strip>
        </div>

        <aside className="detail-side" aria-label="Facts">
          <h2 className="section-title">Facts</h2>
          <dl>
            <dt>Status</dt><dd>{item.status || "Unknown"}</dd>
            {item.original_title || item.original_name ? <><dt>Original title</dt><dd>{item.original_title || item.original_name}</dd></> : null}
            {lang && <><dt>Languages</dt><dd>{lang}</dd></>}
            {type === "movie" && <><dt>Budget</dt><dd>{formatMoney(item.budget)}</dd><dt>Revenue</dt><dd>{formatMoney(item.revenue)}</dd></>}
            {type === "tv" && item.networks?.length > 0 && <><dt>Network</dt><dd>{item.networks.map((n) => n.name).join(", ")}</dd></>}
            {type === "tv" && item.number_of_episodes ? <><dt>Episodes</dt><dd>{item.number_of_episodes}</dd></> : null}
            {item.production_companies?.length > 0 && <><dt>Production</dt><dd>{item.production_companies.slice(0, 4).map((c) => c.name).join(", ")}</dd></>}
          </dl>
          <div className="side-links">
            {imdb && <a className="btn btn-ghost btn-sm" href={`https://www.imdb.com/title/${imdb}`} target="_blank" rel="noreferrer"><FiExternalLink /> IMDb</a>}
            {item.homepage && <a className="btn btn-ghost btn-sm" href={item.homepage} target="_blank" rel="noreferrer"><FiExternalLink /> Official site</a>}
            <a className="btn btn-ghost btn-sm" href={`https://www.themoviedb.org/${type}/${item.id}`} target="_blank" rel="noreferrer"><FiExternalLink /> TMDB</a>
          </div>

          {type === "movie" && (
            <div className="theatres">
              <h3>In cinemas near you</h3>
              <button className="btn btn-ghost btn-sm" onClick={findTheatres} disabled={geo.loading || geo.loadingTheatre}>
                <FiMapPin /> {geo.loading || geo.loadingTheatre ? "Finding cinemas…" : "Use my location"}
              </button>
              {geo.city && <p className="muted">Showing cinemas around {geo.city}.</p>}
              {geo.error && <p className="theatre-error" role="alert">{geo.error}</p>}
              <ul>
                {geo.theatres.slice(0, 8).map((t, i) => (
                  <li key={`${t.name}${i}`}>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(`${title} showtimes ${t.name} ${geo.city || ""}`)}`} target="_blank" rel="noreferrer">
                      {t.name} <FiExternalLink />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {recs.length > 0 && (
        <Strip title="Recommended for you" id="recs">
          <div className="h-scroll cards">{recs.slice(0, 18).map((r) => <MediaCard key={r.id} item={r} type={type} />)}</div>
        </Strip>
      )}
      {similar.length > 0 && (
        <Strip title={`Similar ${type === "tv" ? "shows" : "movies"}`} id="similar">
          <div className="h-scroll cards">{similar.map((r) => <MediaCard key={r.id} item={r} type={type} />)}</div>
        </Strip>
      )}

      {trailer && <TrailerModal videos={videos} startKey={trailer.key} onClose={() => setTrailer(null)} />}
    </article>
  );
}
