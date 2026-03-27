import { Link } from "react-router-dom";
import "./Header.css";
import { RiMovie2AiFill } from "react-icons/ri";
import { BsBookmarkPlusFill } from "react-icons/bs";
import { TfiSearch } from "react-icons/tfi";

function Header() {
  
  return (
    <header className="header">
      <Link to="/" className="logo">
        <RiMovie2AiFill /> Movie-Hub
      </Link>
      <div className="search-bar">
        <input type="text" placeholder="Search Here..." />
        <button className="search-btn">
          <TfiSearch  />
        </button>
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
