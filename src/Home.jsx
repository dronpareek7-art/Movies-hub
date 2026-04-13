import { useContext, useEffect, useState } from "react";
import { baseImageUrl } from "./data";
import "./Home.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BsBookmarkPlusFill, BsBookmarkCheckFill } from "react-icons/bs";
import { Moviecontext } from "./Component/Router";
import { options } from "./data";
import { toast } from "react-toastify";

function Home({ urls, heading, btn1, btn2 }) {
  const [movieData, setMovieData] = useState([]);
  const [showData, setShowData] = useState([urls[0]]);
  const [loading, setLoading] = useState(true);

  let { Addtowatchlist, removeFromWatchlist, isInWatchlist, user } =
    useContext(Moviecontext);

  const navigate = useNavigate();
  const location = useLocation()

  const currentUrl = showData[0];
  const isTV = currentUrl.includes("tv");
  const isPerson = currentUrl.includes("person");

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);

        const responses = await Promise.all(
          showData.map((url) => fetch(url, options)),
        );

        const results = await Promise.all(responses.map((res) => res.json()));

        const combinedData = results.flatMap((r) => r.results || []);

        setMovieData(combinedData);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [showData]);

  function trimContent(content) {
    if (!content) return "";
    return content.length > 20 ? content.slice(0, 20) + "..." : content;
  }

  return (
    <section className="home-section">
      <header className="home-header">
        <h2>{heading}</h2>

        {!isPerson && urls.length > 1 && (
          <div className="toggle-buttons">
            <button
              className={currentUrl === urls[0] ? "active-btn" : ""}
              onClick={() => setShowData([urls[0]])}
            >
              {btn1}
            </button>

            <button
              className={currentUrl === urls[1] ? "active-btn" : ""}
              onClick={() => setShowData([urls[1]])}
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
            <div key={item.id} className="movie-card">
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
                      src={`${baseImageUrl}${
                        item.poster_path || item.profile_path
                      }`}
                      alt={item.title || item.name}
                      loading="lazy"
                    />
                  </Link>
                )}

                <button
                  onClick={async(e) => {
                    e.preventDefault
                    if (!user) {
                      toast.warning("please Login first");
                      navigate(`/login?next=${location.pathname}`,{state:{pendingMovie :item}});
                      return;
                    }

                    if (isInWatchlist(item.id)) {
                     await removeFromWatchlist(item.id);
                      toast.error("Removed from Watchlist ❌");
                    } else {
                    await  Addtowatchlist(item);
                      toast.success("Added to Watchlist ❤️", {
                        toastId: item.id,
                      });
                    }
                  }}
                  className="watchlist-icon"
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
