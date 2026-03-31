import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./SingleMovie.css";
import { useContext } from "react";
import { Moviecontext } from "../Component/Router";
import { FaPlay } from "react-icons/fa";

function SingleMovie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerkey] = useState(null);
  const [Showtrailer, setShowTrailer] = useState(false);
  const location = useLocation();
  const isTV = location.pathname.includes("/tv");

  let { Addtowatchlist, Watchlist, removeFromWatchlist, isInWatchlist } =
    useContext(Moviecontext);

  useEffect(() => {
    fetchMovie();
  }, [id, isTV]);

  async function fetchMovie() {
    const API_KEY = import.meta.env.VITE_API_KEY;
    const type = isTV ? "tv" : "movie";

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}`,
      );
      const data = await res.json();
      setMovie(data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }
  async function handleTrailer() {
    if (Showtrailer) {
      setShowTrailer(false);
      return;
    }

    const API_KEY = import.meta.env.VITE_API_KEY;
    const type = isTV ? "tv" : "movie";

    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${API_KEY}`,
    );

    const data = await res.json();

    const trailer = data.results.find(
      (vid) => vid.type === "Trailer" && vid.site === "YouTube",
    );

    if (trailer) {
      setTrailerkey(trailer.key);
      setShowTrailer(true);
      console.log(trailer);
    }
  }

  if (!movie) return <h2 className="loading">Loading Movie... 🎬</h2>;

  return (
    <div
      className="single-movie"
      style={{
        backgroundImage: movie.backdrop_path
          ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
          : `url(https://image.tmdb.org/t/p/w500${movie.poster_path})`,
      }}
    >
      <div className="movie-container">
        <img
          className="movie-poster"
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title || movie.name}
        />

        <div className="movie-details">
          <h1 className="movie-title">{movie.title || movie.name}</h1>

          <p className="movie-overview">
            <span className="details-heading">Description:</span>
            {movie.overview}
          </p>

          <p className="movie-info">
            ⭐ <span className="details-heading">Rating: </span>{" "}
            {movie.vote_average}
          </p>
          <p className="movie-info">
            📅 <span className="details-heading">Release Date: </span>
            {movie.release_date || movie.first_air_date}
          </p>
          <p className="movie-info">
            <span className="details-heading">Movie Language: </span>{" "}
            {movie.spoken_languages[0].name || "N/A"}
          </p>
          <p className="movie-info">
            {" "}
            <span className="details-heading"> Genres:</span>
            {movie.genres.map((g) => g.name).join(", ") || "N/A"}
          </p>

          <button onClick={handleTrailer} className="trailer-btn">
            <FaPlay /> {""}
            {Showtrailer ? "Close Trailer" : "Watch Trailer"}
          </button>
          <button
            className="watchlist-btn"
            onClick={() =>
              isInWatchlist(movie.id)
                ? removeFromWatchlist(movie.id)
                : Addtowatchlist(movie)
            }
          >
            {" "}
            {isInWatchlist(movie.id)
              ? `  Remove from watchlist`
              : " Add to watchlist"}
          </button>
          {Showtrailer && trailerKey && (
            <div className="trailer-modal">
              <div className="trailer-content">
                <button
                  className="close-btn"
                  onClick={() => setShowTrailer(false)}
                >
                  {" "}
                  ✖
                </button>

                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  title="Trailer"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SingleMovie;
