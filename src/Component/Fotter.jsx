import "./Fotter.css";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { RiMovie2AiFill } from "react-icons/ri";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />

      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon"><RiMovie2AiFill /></span>
            MovieHub
          </div>
          <p className="footer-tagline">
            Discover trending movies, build your watchlist, and explore cinema like never before.
          </p>
          <div className="footer-credit">
            <span className="heart">♥</span> Made by Drona Pareek
          </div>
          <div className="socials">
            <a href="https://github.com/dronpareek7-art" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="https://instagram.com/dron_pareek" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IoLogoInstagram />
            </a>
            <a href="https://www.linkedin.com/in/drona-pareek/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="footer-col">
          <h3 className="footer-heading">
            <span className="heading-line" />
            Quick Links
          </h3>
          <nav className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/Watchlist">Watchlist</Link>
            <Link to="/Login">Login</Link>
          </nav>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">
            <span className="heading-line" />
            Explore
          </h3>
          <nav className="footer-links">
            <Link to="/">Trending</Link>
            <Link to="/">Top Rated</Link>
            <Link to="/">Upcoming</Link>
          </nav>
        </div>

        {/* Newsletter */}
        <div className="footer-col footer-newsletter">
          <h3 className="footer-heading">
            <span className="heading-line" />
            Stay Updated
          </h3>
          <p className="newsletter-desc">Get the latest movie picks in your inbox.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="your@email.com" />
            <button type="button">→</button>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-line" />
        <div className="footer-bottom-content">
          <span>© 2026 MovieHub. All rights reserved.</span>
          <span className="footer-bottom-badge">
            <RiMovie2AiFill /> v2.0
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;