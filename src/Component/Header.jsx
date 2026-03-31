import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { RiMovie2AiFill } from "react-icons/ri";
import { BsBookmarkPlusFill } from "react-icons/bs";
import { TfiSearch } from "react-icons/tfi";
import { useState, useEffect } from "react";

function Header() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      const API_KEY = import.meta.env.VITE_API_KEY;

      const res = await fetch(
        ` https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`,
      );

      const data = await res.json();

      setSuggestions(data.results?.slice(0, 6) || []);
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

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

      <div className="search-bar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search Here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-btn">
            <TfiSearch />
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((item) => (
              <div
                key={item.id}
                className="suggestion-item"
                onClick={() => handleClick(item)}
              >
                {item.title || item.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="nav-links">
        <Link to="/Watchlist">
          Watchlist <BsBookmarkPlusFill size={16} />
        </Link>

        <Link to="/Login" className="login">
          Login
        </Link>
      </nav>
    </header>
  );
}

export default Header;
