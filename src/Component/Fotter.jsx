import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { RiMovie2AiFill } from "react-icons/ri";
import "./Fotter.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo"><RiMovie2AiFill /><span>Movie-Hub</span></Link>
          <p>Find what to watch next, keep a watchlist, and dig into the cast behind your favourite films.</p>
          <div className="socials">
            <a href="https://github.com/dronpareek7-art" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
            <a href="https://instagram.com/dron_pareek" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IoLogoInstagram /></a>
            <a href="https://www.linkedin.com/in/drona-pareek/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>

        <nav className="footer-col" aria-label="Discover">
          <h3>Discover</h3>
          <Link to="/browse/trending?type=movie&window=day">Trending</Link>
          <Link to="/browse/popular?type=movie">Popular movies</Link>
          <Link to="/browse/popular?type=tv">Popular TV shows</Link>
          <Link to="/browse/top_rated?type=movie">Top rated</Link>
          <Link to="/browse/upcoming?type=movie">Coming soon</Link>
        </nav>

        <nav className="footer-col" aria-label="Your account">
          <h3>Your account</h3>
          <Link to="/watchlist">Watchlist</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/browse/people">Popular cast</Link>
        </nav>

        <div className="footer-col footer-tmdb">
          <h3>Data</h3>
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">themoviedb.org</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Movie-Hub. Made by Drona Pareek.</span>
      </div>
    </footer>
  );
}
