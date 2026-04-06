import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import "./SingleMovie.css";
import { useContext } from "react";
import { Moviecontext } from "../Component/Router";
import { FaPlay } from "react-icons/fa";
import { baseImageUrl } from "../data";
import LocationData from "./LocationData";
function SingleMovie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerkey] = useState(null);
  const [Showtrailer, setShowTrailer] = useState(false);
  const [cast, setCast] = useState([]);
  const Location = useLocation();
  const isTV = Location.pathname.includes("/tv");
  let { Addtowatchlist, Watchlist, removeFromWatchlist, isInWatchlist } =
    useContext(Moviecontext);
  const {
    location,
    city,
    error,
    loading,
    getLocation,
    getNearestTheatres,
    theatres,
    loadingTheatre,
  } = LocationData();

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
    const creditRes = await fetch(
      ` https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${API_KEY}`,
    );
    const creditData = await creditRes.json();

    setCast(creditData.cast || []);
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
  function handleBooking(movie, city) {
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(
        movie + " showtimes " + city,
      )}`,
      "_blank",
    );
  }

  if (!movie)
    return (
      <div className="single-movie">
        <div className="movie-container">
          <div className="skeleton poster"></div>

          <div className="movie-details">
            <div className="skeleton title"></div>
            <div className="skeleton text"></div>
            <div className="skeleton text"></div>
            <div className="skeleton text small"></div>
            <div className="skeleton text small"></div>
            <div className="skeleton btn"></div>
            <div className="skeleton btn"></div>
          </div>
        </div>
      </div>
    );
  return (
    <>
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
              {movie.spoken_languages.map((s) => s.english_name).join(",") ||
                "N/A"}
            </p>

            <p className="movie-info">
              {" "}
              <span className="details-heading"> Genres:</span>
              {movie.genres.map((g) => g.name).join(", ") || "N/A"}
            </p>
            <div className="btn-group">

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
            </div>

            <div className="location-box">
              <button
                className="location-btn"
                onClick={async () => {
                  await getLocation();
                  setTimeout(() => {
                    getNearestTheatres();
                  }, 1000);
                }}
              >
                Show Nearest Theater
              </button>

              {loading && (
                <p className="location-text"> Fetching your Location...</p>
              )}
              {error && <p className="location-text">{error}</p>}

              {city && <p className="location-text">📍 {city}</p>}
              {loadingTheatre ? (
                <p className="location-text">Loading theatres... 🎬</p>
              ) : (
                <div className="theatre-list">
                  {theatres.slice(0, 5).map((t, i) => (
                    <div
                      className="theatre-card"
                      onClick={() =>
                        handleBooking(movie.title || movie.name, city)
                      }
                    >
                      <h4>{t.name}</h4>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1`}
                    title="Trailer"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="cast-wrapper">
        <h2 className="cast-heading">Cast</h2>

        <div className="cast-container">
          {cast.slice(0, 12).map((actor) => (
            <Link to={`/person/${actor.id}`} key={actor.id}>
              <div className="cast-card">
                {actor.profile_path ? (
                  <img
                    src={`${baseImageUrl}${actor.profile_path}`}
                    alt={actor.name}
                  />
                ) : (
                  <div className="no-image"></div>
                )}

                <p>{actor.name}</p>
                <p>as {actor.character}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default SingleMovie;
