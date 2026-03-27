import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./SingleMovie.css";
import { BsBookmarkPlusFill } from "react-icons/bs";
import { useContext } from "react";
import { Moviecontext } from "../Component/Router";
function SingleMovie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerkey] = useState(null);
  const [Showtrailer, setShowTrailer] = useState(false);

  const { Addtowatchlist } = useContext(Moviecontext);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  async function fetchMovie() {
    const API_KEY = import.meta.env.VITE_API_KEY;

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`,
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
      setShowTrailer(false); // close
      return;
    }

    const API_KEY = import.meta.env.VITE_API_KEY;

    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`,
    );

    const data = await res.json();

    const trailer = data.results.find(
      (vid) => vid.type === "Trailer" && vid.site === "YouTube",
    );

    if (trailer) {
      setTrailerkey(trailer.key);
      setShowTrailer(true); // open
    }
  }

  if (!movie) return <h2 className="loading">Loading Movie... 🎬</h2>;

  return (
    <div className="single-movie">
      <div className="movie-container">
        <img
          className="movie-poster"
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />

        <div className="movie-details">
          <h1 className="movie-title">{movie.title}</h1>

          <p className="movie-overview">{movie.overview}</p>

          <p className="movie-info">⭐ Rating: {movie.vote_average}</p>
          <p className="movie-info">📅 Release: {movie.release_date}</p>
          <p className="movie-info">
            Language : {movie.spoken_languages[0].name}
          </p>
          <button onClick={handleTrailer} className="trailer-btn">
            {Showtrailer ? "Close Trailer" : "Watch Trailer"}
          </button>
          <button
            className="watchlist-btn"
            onClick={() => Addtowatchlist(movie)}
          >
            {" "}
            <BsBookmarkPlusFill size={16} />
            Add to watchlist
          </button>
          {Showtrailer && trailerKey && (
            <div className="trailer-box">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="Trailer"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SingleMovie;
