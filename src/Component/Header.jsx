import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { RiMovie2AiFill } from "react-icons/ri";
import { BsBookmarkPlusFill } from "react-icons/bs";
import { TfiSearch } from "react-icons/tfi";
import { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { Moviecontext } from "./Router";

function Header() {
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();
  const { handleLogout, user, Watchlist } = useContext(Moviecontext);
  const dummyPerson = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const dummyPoster = "https://via.placeholder.com/92x138?text=No+Image";

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      const API_KEY = import.meta.env.VITE_API_KEY;

      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`,
      );

      const data = await res.json();

      setSuggestions(data.results?.slice(0, 6) || []);
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    async function fetchGenres() {
      const API_KEY = import.meta.env.VITE_API_KEY;

      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`,
      );

      const data = await res.json();
      setGenres(data.genres || []);
    }

    fetchGenres();
  }, []);

  function handleClick(item) {
    const type = item.media_type;
    navigate(`/${type}/${item.id}`);
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
          <select className="genre-select"
            onChange={(e) => {
              if (e.target.value) {
                navigate(`/genre/${e.target.value}`);
              } else {
                navigate("/");
              }
            }}
          >
            <option value="">All</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
           <span className="arrow">▼</span>
          <div className="divider"></div>
          <input
            type="text"
            placeholder="Search Here..."
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
          Watchlist
          <BsBookmarkPlusFill size={16} />
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
      </nav>
    </header>
  );
}

export default Header;
