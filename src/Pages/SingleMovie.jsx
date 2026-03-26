import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./SingleMovie.css";

function SingleMovie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  async function fetchMovie() {
    const API_KEY = import.meta.env.VITE_API_KEY;

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
      );
      const data = await res.json();
      setMovie(data);
    } catch (err) {
      console.log(err);
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
        </div>
      </div>
    </div>
  );
}

export default SingleMovie;