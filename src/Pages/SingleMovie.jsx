import { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import "./SingleMovie.css";
import { useContext } from "react";
import { Moviecontext } from "../Component/Router";
import { FaPlay } from "react-icons/fa";
import { baseImageUrl, options } from "../data";
import LocationData from "./LocationData";
import { BsBookmarkPlusFill, BsBookmarkCheckFill } from "react-icons/bs";
import { toast } from "react-toastify";

import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function SingleMovie() {
  const { id } = useParams();
  const Location = useLocation();

  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerkey] = useState(null);
  const [Showtrailer, setShowTrailer] = useState(false);
  const [cast, setCast] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [userReview, setUserReview] = useState("");
  const [customReviews, setCustomReviews] = useState([]);
  const [providers, setProviders] = useState([]);
  const [providerLink, setProviderLink] = useState("");

  const isTV = Location.pathname.includes("/tv");

  let { Addtowatchlist, removeFromWatchlist, isInWatchlist, user } =
    useContext(Moviecontext);

  const navigate = useNavigate();

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
    fetchCustomReviews();
  }, [id, isTV]);

  async function fetchCustomReviews() {
    const snapshot = await getDocs(collection(db, "reviews"));

    const data = snapshot.docs
      .map((doc) => doc.data())
      .filter((r) => r.movieId === id);

    setCustomReviews(data);
  }

  async function fetchMovie() {
    try {
      const type = isTV ? "tv" : "movie";

      const [movieRes, castRes, reviewRes, providerRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/${type}/${id}`, options),
        fetch(`https://api.themoviedb.org/3/${type}/${id}/credits`, options),
        fetch(`https://api.themoviedb.org/3/${type}/${id}/reviews`, options),
        fetch(
          `https://api.themoviedb.org/3/${type}/${id}/watch/providers`,
          options,
        ),
      ]);

      const movieData = await movieRes.json();
      const castData = await castRes.json();
      const reviewData = await reviewRes.json();

      const providerData = await providerRes.json();
      const indiaProviders = providerData.results?.IN;

      if (indiaProviders) {
        setProviderLink(indiaProviders.link);

        if (indiaProviders.flatrate) {
          setProviders(indiaProviders.flatrate);
        }
      }

      setMovie(movieData);
      setCast(castData.cast || []);
      setReviews((reviewData.results || []).slice(0, 5));
    } catch (err) {
      console.log(err);
    }
  }

  async function handleTrailer() {
    if (Showtrailer) {
      setShowTrailer(false);
      return;
    }

    const type = isTV ? "tv" : "movie";

    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}/videos`,
      options,
    );

    const data = await res.json();

    const trailer = (data.results || []).find(
      (vid) => vid.type === "Trailer" && vid.site === "YouTube",
    );

    if (trailer) {
      setTrailerkey(trailer.key);
      setShowTrailer(true);
    }
  }

  async function handleSubmitReview() {
    if (!user) {
      toast.info("Login required first");
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        movieId: id,
        userName: user.email.split("@")[0].replace(/[0-9.]/g, ""),
        review: userReview,
        createdAt: new Date(),
      });

      setUserReview("");
      fetchCustomReviews();
    } catch (err) {
      console.log(err);
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
      <>
        <div className="single-movie">
          <div className="movie-container">
            <div className="skeleton poster"></div>

            <div className="movie-details">
              <div className="skeleton title"></div>

              <div className="skeleton text"></div>
              <div className="skeleton text"></div>
              <div className="skeleton text"></div>

              <div className="skeleton text small"></div>
              <div className="skeleton text small"></div>

              <div className="btn-group">
                <div className="skeleton btn"></div>
                <div className="skeleton btn"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="cast-wrapper">
          <h2 className="cast-heading">Cast</h2>

          <div className="cast-container">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="cast-card" key={i}>
                <div className="skeleton cast-img"></div>
                <div className="skeleton cast-text"></div>
                <div className="skeleton cast-text small"></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  return (
    <>
      <div
        className="single-movie"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(${baseImageUrl}${movie.backdrop_path})`
            : `url(${baseImageUrl}${movie.poster_path})`,
        }}
      >
        <div className="movie-container">
          <img
            className="movie-poster"
            src={`${baseImageUrl}${movie.poster_path}`}
            alt={movie.title || movie.name}
          />

          <div className="movie-details">
            <h1 className="movie-title">{movie.title || movie.name}</h1>

            <p className="movie-overview">
              <span className="details-heading">Description:</span>
              {movie.overview}
            </p>

            <p className="movie-info">
              <span className="details-heading">Rating:</span> ⭐{" "}
              {movie.vote_average}
            </p>

            <p className="movie-info">
              <span className="details-heading">Release Date:</span>
              {movie.release_date || movie.first_air_date
                ? new Date(
                    movie.release_date || movie.first_air_date,
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </p>
            <p className="movie-info">
              <span className="details-heading">Language:</span>{" "}
              {(movie.spoken_languages || [])
                .map((s) => s.english_name)
                .join(", ")}
            </p>

            <p className="movie-info">
              <span className="details-heading">Genres:</span>{" "}
              {(movie.genres || []).map((g) => g.name).join(", ")}
            </p>
            <div className="provider-section">
              <h2>Available On</h2>

              {providers.length > 0 ? (
                <div className="provider-list">
                  {providers.map((p) => (
                    <a
                      key={p.provider_id}
                      href={providerLink}
                      target="_blank"
                      rel="noreferrer"
                      className="provider-item"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w200${p.logo_path}`}
                        alt={p.provider_name}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="no-provider">Not on streaming yet 🍿</p>
              )}
            </div>

            <div className="btn-group">
              <button onClick={handleTrailer} className="trailer-btn">
                <FaPlay />
                {Showtrailer ? " Close Trailer" : " Watch Trailer"}
              </button>

              <button
                className="watchlist-btn"
                onClick={async () => {
                  if (!user) {
                    navigate(`/login?next=${Location.pathname}`, {
                      state: { pendingMovie: movie },
                    });

                    return;
                  }
                  isInWatchlist(movie.id)
                    ? await removeFromWatchlist(movie.id)
                    : await Addtowatchlist(movie);
                }}
              >
                {isInWatchlist(movie.id) ? (
                  <>
                    <BsBookmarkCheckFill /> Remove From Watchlist
                  </>
                ) : (
                  <>
                    <BsBookmarkPlusFill /> Add To Watchlist
                  </>
                )}
              </button>
            </div>

            <div className="location-box">
              <button
                className="location-btn"
                onClick={async () => {
                  const coords = await getLocation();
                  await getNearestTheatres(coords);
                }}
              >
                Show Nearest Theater
              </button>

              {loading && (
                <p style={{ color: "white" }}>Fetching your Location...</p>
              )}
              {error && <p style={{ color: "white" }}>{error}</p>}
              {city && <p style={{ color: "white" }}>📍 {city}</p>}

              {loadingTheatre ? (
                <p style={{ color: "white" }}>Loading theatres...</p>
              ) : (
                <div className="theatre-list">
                  {theatres.map((t, i) => (
                    <div
                      key={i}
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

      <div className="cast-wrapper">
        <h2 className="cast-heading">Cast</h2>

        <div className="cast-container">
          {(cast || []).slice(0, 12).map((actor) => (
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
      <div className="reviews-wrapper">
        <h2 className="reviews-heading">Reviews</h2>

        <div className="reviews-container">
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews available 😢</p>
          ) : (
            reviews.slice(0, 5).map((review) => (
              <div className="review-card" key={review.id}>
                <h4>{review.author}</h4>
                <p>⭐ {review.author_details?.rating || "N/A"}</p>
                <p className="review-content">
                  {(review.content || "").slice(0, 150)}...
                </p>
              </div>
            ))
          )}
        </div>

        <div className="custom-reviews-list">
          <h2 className="reviews-heading">User Reviews</h2>

          {customReviews.length === 0 ? (
            <p className="no-reviews">No user reviews yet 😢</p>
          ) : (
            <div className="reviews-container">
              {customReviews.map((r, i) => (
                <div key={i} className="review-card">
                  <h4 className="review-author">{r.userName}</h4>
                  <p className="review-content">{r.review}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="custom-review-section">
        <h2 className="reviews-heading">Post Your Review</h2>

        <textarea
          className="review-textarea"
          placeholder="Write your review..."
          value={userReview}
          onChange={(e) => setUserReview(e.target.value)}
        />

        <button className="submit-review-btn" onClick={handleSubmitReview}>
          Submit Review
        </button>
      </div>
    </>
  );
}

export default SingleMovie;
