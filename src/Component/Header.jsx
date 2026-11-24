import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { RiMovie2AiFill } from "react-icons/ri";
import { FiChevronDown, FiLogOut, FiMenu, FiSearch, FiUser, FiX } from "react-icons/fi";
import { BsBookmarkHeart } from "react-icons/bs";
import { Moviecontext } from "../context/movieContext";
import { useGenres } from "../hooks/useMisc";
import SearchBox from "./SearchBox";
import "./Header.css";

export default function Header() {
  const { user, handleLogout, Watchlist } = useContext(Moviecontext);
  const { movies, shows } = useGenres();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [menu, setMenu] = useState(null); // "genres" | "user" | null
  const [genreTab, setGenreTab] = useState("movie");
  const nav = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close every popover when the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawer(false);
    setMobileSearch(false);
    setMenu(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onDown = (e) => nav.current && !nav.current.contains(e.target) && setMenu(null);
    const onKey = (e) => e.key === "Escape" && setMenu(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const genreList = genreTab === "movie" ? movies : shows;
  const initial = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();
  const count = Watchlist.length;

  const signOut = () => {
    handleLogout();
    setMenu(null);
    setDrawer(false);
    if (["/watchlist", "/profile"].includes(location.pathname.toLowerCase())) navigate("/");
  };

  return (
    <>
      <header className={`header ${scrolled || drawer ? "is-solid" : ""}`}>
        <div className="header-inner" ref={nav}>
          <Link to="/" className="logo" aria-label="Movie-Hub home">
            <RiMovie2AiFill />
            <span>Movie-Hub</span>
          </Link>

          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/browse/popular?type=movie">Movies</NavLink>
            <NavLink to="/browse/popular?type=tv">TV Shows</NavLink>
            <div className="nav-menu">
              <button
                className={`nav-trigger ${menu === "genres" ? "is-open" : ""}`}
                aria-expanded={menu === "genres"}
                aria-haspopup="true"
                onClick={() => setMenu(menu === "genres" ? null : "genres")}
              >
                Genres <FiChevronDown />
              </button>
              {menu === "genres" && (
                <div className="popover genre-pop">
                  <div className="segmented" role="group" aria-label="Genre type">
                    <button aria-pressed={genreTab === "movie"} onClick={() => setGenreTab("movie")}>Movies</button>
                    <button aria-pressed={genreTab === "tv"} onClick={() => setGenreTab("tv")}>TV Shows</button>
                  </div>
                  <ul>
                    {genreList.map((g) => (
                      <li key={g.id}>
                        <Link to={`/genre/${g.id}?type=${genreTab}`}>{g.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </nav>

          <SearchBox className="header-search" />

          <div className="header-actions">
            <button className="icon-btn search-toggle" aria-label="Open search" onClick={() => { setMobileSearch((v) => !v); setDrawer(false); }}>
              {mobileSearch ? <FiX /> : <FiSearch />}
            </button>

            <NavLink to="/watchlist" className="watch-link" aria-label={`Watchlist, ${count} saved`}>
              <BsBookmarkHeart />
              <span className="watch-label">Watchlist</span>
              {count > 0 && <em>{count > 99 ? "99+" : count}</em>}
            </NavLink>

            {user ? (
              <div className="nav-menu">
                <button className="avatar" aria-label="Account menu" aria-expanded={menu === "user"} onClick={() => setMenu(menu === "user" ? null : "user")}>
                  {initial}
                </button>
                {menu === "user" && (
                  <div className="popover user-pop">
                    <p className="user-mail">{user.email}</p>
                    <Link to="/profile"><FiUser /> Profile</Link>
                    <Link to="/watchlist"><BsBookmarkHeart /> Watchlist</Link>
                    <button onClick={signOut}><FiLogOut /> Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to={`/login?next=${encodeURIComponent(location.pathname)}`} className="btn btn-primary btn-sm signin">Sign in</Link>
            )}

            <button className="icon-btn menu-toggle" aria-label={drawer ? "Close menu" : "Open menu"} aria-expanded={drawer} onClick={() => { setDrawer((v) => !v); setMobileSearch(false); }}>
              {drawer ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {mobileSearch && (
          <div className="mobile-search">
            <SearchBox autoFocus onDone={() => setMobileSearch(false)} />
          </div>
        )}
      </header>

      <div className={`drawer ${drawer ? "is-open" : ""}`} aria-hidden={!drawer}>
        <nav aria-label="Mobile">
          <Link to="/">Home</Link>
          <Link to="/browse/popular?type=movie">Movies</Link>
          <Link to="/browse/popular?type=tv">TV Shows</Link>
          <Link to="/browse/trending?type=movie&window=day">Trending</Link>
          <Link to="/browse/upcoming?type=movie">Coming soon</Link>
          <Link to="/browse/people">Popular cast</Link>
          <Link to="/watchlist">Watchlist {count > 0 && <em>{count}</em>}</Link>
          {user && <Link to="/profile">Profile</Link>}
          <h3>Genres</h3>
          <div className="chip-row">
            {movies.map((g) => <Link key={g.id} className="chip" to={`/genre/${g.id}`}>{g.name}</Link>)}
          </div>
          {user ? (
            <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
          ) : (
            <Link className="btn btn-primary" to="/login">Sign in</Link>
          )}
        </nav>
      </div>
    </>
  );
}
