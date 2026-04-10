import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { baseImageUrl } from "../data";
import "./GenrePage.css";
import { Moviecontext } from "../Component/Router";
import { BsBookmarkPlusFill, BsBookmarkCheckFill } from "react-icons/bs";
import { toast } from "react-toastify";

const GenrePage = () => {
  const { id } = useParams();

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef(null);
  const navigate = useNavigate();

  let { Addtowatchlist, removeFromWatchlist, isInWatchlist, user } =
    useContext(Moviecontext);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);

        const API_KEY = import.meta.env.VITE_API_KEY;

        const res = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${id}&page=${page}`
        );

        const data = await res.json();

        if (!data.results || data.results.length === 0) {
          setHasMore(false);
          return;
        }

        setMovies((prev) => {
          const newMovies = data.results;

          const uniqueMovies = newMovies.filter(
            (newMovie) => !prev.some((old) => old.id === newMovie.id)
          );

          return [...prev, ...uniqueMovies];
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (hasMore) fetchMovies();
  }, [id, page]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [id]);

  const lastMovieRef = (node) => {
    if (loading || !hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.current.disconnect(); 
          setPage((prev) => prev + 1);
        }
      },
      {
        rootMargin: "200px",
      }
    );

    if (node) observer.current.observe(node);
  };

  return (
    <div className="genre-section">
      <header className="genre-header">
        <h2>Movies</h2>
      </header>

      <div className="genre-grid">
        {loading && page === 1 &&
          Array(12)
            .fill(0)
            .map((_, i) => (
              <div className="genre-card" key={i}>
                <div className="skeleton skeleton-img"></div>
                <div className="film-info">
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text small"></div>
                </div>
              </div>
            ))}

        {movies.map((movie, index) => {
          const isLast = index === movies.length - 1;

          return (
            <div
              className="genre-card"
              key={movie.id}
              ref={isLast ? lastMovieRef : null}
            >
              <div className="genre-wrapper">
                <Link to={`/movie/${movie.id}`}>
                  <img
                    src={
                      movie.poster_path
                        ? `${baseImageUrl}${movie.poster_path}`
                        : "https://via.placeholder.com/300x450?text=No+Image"
                    }
                    alt={movie.title}
                    loading="lazy"
                  />
                </Link>

                <button
                  onClick={() => {
                    if (!user) {
                      toast.warning("please Login first");
                      navigate("/login");
                      return;
                    }

                    if (isInWatchlist(movie.id)) {
                      removeFromWatchlist(movie.id);
                      toast.error("Removed from Watchlist ❌");
                    } else {
                      Addtowatchlist(movie);
                      toast.success("Added to Watchlist ❤️", {
                        toastId: movie.id,
                      });
                    }
                  }}
                  className="watchlist-icon"
                >
                  {isInWatchlist(movie.id) ? (
                    <BsBookmarkCheckFill />
                  ) : (
                    <BsBookmarkPlusFill />
                  )}
                </button>

                <div className="genre-content">
                  <h3>{movie.title || movie.name}</h3>

                  <p>
                    {movie.release_date || movie.first_air_date
                      ? new Date(
                          movie.release_date || movie.first_air_date
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && page > 1 && (
        <p style={{ textAlign: "center", padding: "20px" }}>
          Loading more...
        </p>
      )}

      {!hasMore && (
        <p style={{ textAlign: "center", padding: "20px" }}>
          No more movies 🎬
        </p>
      )}
    </div>
  );
};

export default GenrePage;