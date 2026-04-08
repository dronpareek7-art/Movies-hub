import { useContext, useEffect, useState } from "react";
import { baseImageUrl } from "./data";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import { BsBookmarkPlusFill, BsBookmarkCheckFill } from "react-icons/bs";
import { Moviecontext } from "./Component/Router";
import { toast } from "react-toastify";

function Home({ urls, heading, btn1, btn2 }) {
  const [movieData, setMovieData] = useState([]);
  const [showData, setShowData] = useState(urls[0]);
  const [loading, setLoading] = useState(true);
  let { Addtowatchlist, removeFromWatchlist, isInWatchlist, user } =
    useContext(Moviecontext);
  const navigate = useNavigate();
  const isTV = showData.includes("tv");
  const isPerson = showData.includes("person");
  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch(showData);
        const result = await response.json();
        setMovieData(result.results || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [showData]);

  function trimContent(content) {
    if (content.length > 20) {
      return content.slice(0, 20) + "...";
    }
    return content;
  }

  return (
    <section className="home-section">
      <header className="home-header">
        <h2>{heading}</h2>
        {!isPerson && (
          <div className="toggle-buttons">
            <button
              className={showData === urls[0] ? "active-btn" : ""}
              onClick={() => setShowData(urls[0])}
            >
              {btn1}
            </button>

            <button
              className={showData === urls[1] ? "active-btn" : ""}
              onClick={() => setShowData(urls[1])}
            >
              {btn2}
            </button>
          </div>
        )}
      </header>

      <div className="movie-slider">
        {loading ? (
          <div className="movie-slider">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="movie-card">
                <div className="poster-wrapper">
                  <div className="skeleton home-poster"></div>
                </div>

                <div className="content">
                  <div className="skeleton home-title"></div>
                  <div className="skeleton home-date"></div>
                </div>
              </div>
            ))}
          </div>
        ) : movieData.length > 0 ? (
          movieData.map((item) => (
            <div
              key={item.id}
              className="movie-card"
            >
              <div className="poster-wrapper">
                {(item.poster_path || item.profile_path) && (
                  <Link
                    to={
                      isPerson
                        ? `/person/${item.id}`
                        : `/${isTV ? "tv" : "movie"}/${item.id}`
                    }
                  >
                    <img
                      src={`${baseImageUrl}${item.poster_path || item.profile_path}`}
                      alt={item.title || item.name}
                      loading="lazy"
                    />
                  </Link>
                )}
                <button
                  onClick={() => {
                    if (!user) {
                      toast.warning("please Login first");
                      navigate("/login");
                      return;
                    }
                    if (isInWatchlist(item.id)) {
                      removeFromWatchlist(item.id);
                      toast.error("Removed from Watchlist ❌");
                    } else {
                      Addtowatchlist(item);
                      toast.success("Added to Watchlist ❤️", {
                        toastId: item.id,
                      });
                    }
                  }}
                  className="watchlist-icon"
                  title="Add to watchlist"
                >
                  {isInWatchlist(item.id) ? (
                    <BsBookmarkCheckFill />
                  ) : (
                    <BsBookmarkPlusFill />
                  )}
                </button>
              </div>

              <div className="content">
                <h3>{trimContent(item.title || item.name)}</h3>

                <p>
                  {item.release_date || item.first_air_date
                    ? new Date(
                        item.release_date || item.first_air_date,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })
                    : ""}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No Data To Show Yet!</p>
        )}
      </div>
    </section>
  );
}

export default Home;
