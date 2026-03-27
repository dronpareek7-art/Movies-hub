import React from 'react'
import { baseImageUrl } from '../data';
import { Moviecontext } from '../Component/Router';
import { Link } from 'react-router-dom';
import { useContext } from 'react';

const WatchList = () => {

  const { Watchlist } = useContext(Moviecontext);

  function trimContent(content) {
    if (!content) return "";
    return content.length > 20 ? content.slice(0, 20) + "..." : content;
  }

  return (
    <div className="home-section">

      <h2>Your WatchList</h2>

      <div className="movie-grid">

        {Watchlist.length > 0 ? (Watchlist.map((item) => (

            <div key={item.id} className="movie-card">

              {item.poster_path && (
                <Link to={`/movie/${item.id}`}>
                  <img
                    src={`${baseImageUrl}${item.poster_path}`}
                    alt={item.title}
                  />
                </Link>
              )}

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
          <p>No movies in WatchList 😢</p>
        )}

      </div>

    </div>
  );
};

export default WatchList