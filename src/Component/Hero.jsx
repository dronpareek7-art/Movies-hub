import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaStar } from "react-icons/fa";
import { BsBookmarkPlus, BsBookmarkCheckFill } from "react-icons/bs";
import { img, tagType } from "../api/tmdb";
import { useTmdb } from "../hooks/useTmdb";
import { useGenres } from "../hooks/useMisc";
import { Moviecontext } from "../context/movieContext";
import { titleOf, yearOf } from "../utils/format";
import TrailerModal from "./TrailerModal";
import { ErrorState } from "./States";

const SLIDES = 6;

export default function Hero() {
  const { data, error, refetch } = useTmdb("/trending/movie/week");
  const { names } = useGenres();
  const { isInWatchlist, toggleWatchlist } = useContext(Moviecontext);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailer, setTrailer] = useState(null);

  const slides = tagType(data?.results, "movie").filter((m) => m.backdrop_path).slice(0, SLIDES);
  const count = slides.length;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!count || paused || trailer || reduce) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 8000);
    return () => clearInterval(id);
  }, [count, paused, trailer, index]);

  if (error) {
    return (
      <div className="hero hero-error">
        <ErrorState error={error} onRetry={refetch} title="We couldn't load featured movies" />
      </div>
    );
  }

  if (!count) {
    return (
      <div className="hero" aria-busy="true">
        <div className="hero-copy">
          <div className="skeleton" style={{ height: 56, width: "min(520px, 80%)" }} />
          <div className="skeleton" style={{ height: 18, width: 260, marginTop: 18 }} />
          <div className="skeleton" style={{ height: 70, width: "min(560px, 100%)", marginTop: 18 }} />
        </div>
      </div>
    );
  }

  const current = slides[index];
  const saved = isInWatchlist(current.id, "movie");

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured movies"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((m, i) => (
        <img
          key={m.id}
          className={`hero-bg ${i === index ? "is-on" : ""}`}
          src={img(m.backdrop_path, "w1280")}
          srcSet={`${img(m.backdrop_path, "w780")} 780w, ${img(m.backdrop_path, "w1280")} 1280w, ${img(m.backdrop_path, "original")} 2000w`}
          sizes="100vw"
          alt=""
          fetchPriority={i === 0 ? "high" : "low"}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="hero-shade" />

      <div className="hero-copy" key={current.id} aria-live="polite">
        <p className="hero-kicker">Trending this week</p>
        <h1 className="hero-title">{titleOf(current)}</h1>
        <p className="hero-facts">
          <span className="hero-score"><FaStar /> {current.vote_average?.toFixed(1)}</span>
          <span>{yearOf(current)}</span>
          <span>{(current.genre_ids || []).slice(0, 3).map((g) => names[g]).filter(Boolean).join(", ")}</span>
        </p>
        <p className="hero-overview">{current.overview}</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setTrailer(current)}>
            <FaPlay /> Watch trailer
          </button>
          <Link className="btn btn-ghost" to={`/movie/${current.id}`}>More details</Link>
          <button
            className={`btn btn-ghost ${saved ? "is-active" : ""}`}
            aria-pressed={saved}
            onClick={() => toggleWatchlist(current, "movie")}
          >
            {saved ? <BsBookmarkCheckFill /> : <BsBookmarkPlus />} {saved ? "Saved" : "Watchlist"}
          </button>
        </div>
      </div>

      <div className="filmstrip" role="tablist" aria-label="Choose featured movie">
        {slides.map((m, i) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={i === index}
            aria-label={titleOf(m)}
            className={i === index ? "is-on" : ""}
            onClick={() => setIndex(i)}
          >
            <img src={img(m.poster_path, "w154")} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      {trailer && <TrailerModal type="movie" id={trailer.id} onClose={() => setTrailer(null)} />}
    </section>
  );
}
