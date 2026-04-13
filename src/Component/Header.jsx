import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { RiMovie2AiFill } from "react-icons/ri";
import { BsBookmarkPlusFill } from "react-icons/bs";
import { TfiSearch } from "react-icons/tfi";
import { useState, useEffect, useRef, useContext } from "react";
import { Moviecontext } from "./Router";
import { FiUser } from "react-icons/fi";
import { options } from "../data";

function Header() {
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const genreId = location.pathname.startsWith("/genre/")
    ? location.pathname.split("/")[2]
    : "";
  const { handleLogout, user } = useContext(Moviecontext);

  const dummyPerson = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const dummyPoster = "https://via.placeholder.com/92x138?text=No+Image";

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?query=${query}`,
          options,
        );

        const data = await res.json();
        setSuggestions(data.results?.slice(0, 6) || []);
      } catch (err) {
        console.log(err);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list`,
          options,
        );
        const data = await res.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.log(err);
      }
    }

    fetchGenres();
  }, []);

  function handleClick(item) {
    if (!item.media_type) return;

    navigate(`/${item.media_type}/${item.id}`);
    setQuery("");
    setSuggestions([]);
  }

  return (
    <header className="header">
      <Link to="/" className="logo">
        <RiMovie2AiFill /> Movie-Hub
      </Link>

      <div className="search-bar" ref={searchRef}>
        <div className="search-wrapper">
          <select
            value={genreId}
            className="genre-select"
            onChange={(e) => {
              if (e.target.value) {
                navigate(`/genre/${e.target.value}`);
              } else {
                navigate("/");
              }
            }}
          >
            <option value="">All ▼</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <div className="divider"></div>

          <input
            type="text"
            placeholder="Search Movies / Series / Celebrities"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button className="search-btn">
            <TfiSearch />
          </button>

          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="suggestion-item"
                  onClick={() => handleClick(item)}
                >
                  <img
                    src={
                      item.media_type === "person"
                        ? item.profile_path
                          ? `https://image.tmdb.org/t/p/w92${item.profile_path}`
                          : dummyPerson
                        : item.poster_path
                          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                          : dummyPoster
                    }
                    alt={item.title || item.name}
                  />

                  <div>
                    <p>{item.title || item.name}</p>
                    <span>{item.media_type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="nav-links">
        <Link to="/Watchlist">
          Watchlist <BsBookmarkPlusFill size={16} />
        </Link>

        {user ? (
          <button onClick={handleLogout} className="login-btn">
            Log out
          </button>
        ) : (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        )}

        <Link to="/profile" className="profile-icon">
          <FiUser size={22} /> Profile
        </Link>
      </nav>
    </header>
  );
}

export default Header;
