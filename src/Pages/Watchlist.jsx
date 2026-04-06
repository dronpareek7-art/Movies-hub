import React, { useContext } from "react";
import { baseImageUrl } from "../data";
import { Moviecontext } from "../Component/Router";
import { Link } from "react-router-dom";
import "./Watchlist.css";
import { TbCancel } from "react-icons/tb";
import { toast } from "react-toastify";
const WatchList = () => {
  const { Watchlist, removeFromWatchlist } = useContext(Moviecontext);

  function trimContent(content) {
    if (!content) return "";
    return content.length > 20 ? content.slice(0, 20) + "... " : content;
  }

  return (
    <div className="watchlist-section">
      <h2 className="watchlist-heading">Your WatchList</h2>

      <div className="watchlist-grid">
        {Watchlist.length > 0 ? (
          Watchlist.map((item) => {
            const isTV = item.name !== undefined;
            const isPerson = item.profile_path !== undefined;

            return (
              <div key={item.id} className="watchlist-card">
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
                      className="watchlist-img"
                    />
                  </Link>
                )}

                <div className="watchlist-content">
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

                  <TbCancel
                    onClick={() => {
                      removeFromWatchlist(item.id);
                      toast.error("Removed from watchlist");
                    }}  
                    className="removeicon"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="empty-msg">No movies in WatchList 😢</p>
        )}
      </div>
    </div>
  );
};

export default WatchList;
