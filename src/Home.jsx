import { useContext, useEffect, useState} from "react";
import { baseImageUrl } from "./data";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { BsBookmarkPlusFill } from "react-icons/bs";
import { Moviecontext } from "./Component/Router";

function Home({ urls, heading, btn1, btn2 }) {
  const [movieData, setMovieData] = useState([]);
  const [showData, setShowData] = useState(urls[0]);
  const [loading, setLoading] = useState(true);
  let { Addtowatchlist } = useContext(Moviecontext);
  const navigate = useNavigate();

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
      </header>

     
      <div className="movie-slider" >
        {loading ? (
          <p>Loading....</p>
        ) : movieData.length > 0 ? (
          movieData.map((item) => (
            <div key={item.id} className="movie-card">
              <div className="poster-wrapper">
                {item.poster_path && (
                  <img
                    src={`${baseImageUrl}${item.poster_path}`}
                    alt={item.title || item.name}
                    loading="lazy"
                    onClick={() => navigate(`/movie/${item.id}`)}
                  />
                )}
                <button
                  onClick={() => Addtowatchlist(item)}
                  className="watchlist-icon"
                >
                  {" "}
                  <BsBookmarkPlusFill />{" "}
                </button>
              </div>

              <div className="content">
                <h3>{trimContent(item.title || item.name)}</h3>

                <p>
                  {item.release_date
                    ? new Date(item.release_date).toLocaleDateString("en-US", {
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
