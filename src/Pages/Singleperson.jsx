import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { baseImageUrl } from "../data";
import "./SinglePerson.css";

function SinglePerson() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [movies, setMovies] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMovies, setLoadingMovies] = useState(true);

  useEffect(() => {
    async function fetchPerson() {
      const API_KEY = import.meta.env.VITE_API_KEY;

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}`,
        );
        const data = await res.json();
        setPerson(data);

        setLoadingMovies(true);

        const movieRes = await fetch(
          `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${API_KEY}`,
        );
        const movieData = await movieRes.json();

        setMovies(movieData.cast || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingMovies(false);
      }
    }

    fetchPerson();
  }, [id]);

  if (!person)
    return (
      <div className="sp-container">
        <div className="sp-header">
          <div className="skeleton sp-image-skeleton"></div>

          <div className="sp-details">
            <div className="skeleton sp-title"></div>
            <div className="skeleton sp-text"></div>
            <div className="skeleton sp-text"></div>
            <div className="skeleton sp-text"></div>
            <div className="skeleton sp-text long"></div>
            <div className="skeleton sp-text long"></div>
          </div>
        </div>

        <div className="sp-movies-section">
          <h2>Movies</h2>

          <div className="sp-movies-grid">  
            {[...Array(8)].map((_, i) => (
              <div key={i} className="sp-movie-card">
                <div className="skeleton sp-movie-img-skeleton"></div>
                <div className="skeleton sp-movie-title-skeleton"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  return (
    <div className="sp-container">
      <div className="sp-header">
        {person.profile_path && (
          <img
            className="sp-image"
            src={`${baseImageUrl}${person.profile_path}`}
            alt={person.name}
          />
        )}

        <div className="sp-details">
          <h1>{person.name}</h1>

          <p>
            <b className="sp-detail">Known For:</b>{" "}
            {person.known_for_department}
          </p>
          <p>
            <b className="sp-detail">Birthday:</b>{" "}
            {person.birthday
              ? new Date(person.birthday).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })
              : ""}
          </p>
          <p>
            <b className="sp-detail">Place of Birth: </b>
            {person.place_of_birth}
          </p>

          <p>
            <b className="sp-detail">Biography:</b>{" "}
            {person.biography
              ? person.biography.slice(0, 800) + "..."
              : "No Biography Available"}
          </p>
        </div>
      </div>

      <div className="sp-movies-section">
        <h2>Movies</h2>

        <div className="sp-movies-grid">
          {loadingMovies ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="sp-movie-card">
                <div className="skeleton sp-movie-img-skeleton"></div>
                <div className="skeleton sp-movie-title-skeleton"></div>
              </div>
            ))
          ) : movies.length > 0 ? (
            movies
              .sort((a, b) => b.popularity - a.popularity)
              .slice(0, visibleCount)
              .map((movie) => (
                <div key={movie.id} className="sp-movie-card">
                  {movie.poster_path && (
                    <Link to={`/movie/${movie.id}`}>
                      <img
                        className="sp-movie-img"
                        src={`${baseImageUrl}${movie.poster_path}`}
                        alt={movie.title}
                      />
                    </Link>
                  )}
                  <p className="sp-movie-title">{movie.title}</p>
                </div>
              ))
          ) : (
            <p>No movies found</p>
          )}
        </div>
        {visibleCount < movies.length && (
          <button
            className="load-more"
            onClick={() => setVisibleCount((prev) => prev + 12)}
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}

export default SinglePerson;
