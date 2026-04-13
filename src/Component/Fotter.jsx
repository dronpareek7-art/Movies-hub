import "./Fotter.css";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { RiMovie2AiFill } from "react-icons/ri";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2 className="footer-logo">
            {" "}
            <RiMovie2AiFill /> MovieHub
          </h2>
          <p>
            Discover trending movies, build your watchlist, and explore cinema
            like never before.
          </p>

          <b>
            {" "}
            <span>Made with &hearts; Drona Pareek </span>
          </b>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/Watchlist">Watchlist</Link>
          <Link to="/Login">Login</Link>
        </div>

        <div className="footer-section">
          <h3>Categories</h3>
          <Link to="/">Trending</Link>
          <Link to="/">Top Rated</Link>
          <Link to="/">Upcoming</Link>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="socials">
            <a
              href="https://github.com/dronpareek7-art"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub />
            </a>

            <a
              href="https://instagram.com/dron_pareek"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoInstagram />
            </a>

            <a
              href="https://www.linkedin.com/in/drona-pareek/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">© 2026 MovieHub. All rights reserved.</div>
    </footer>
  );
}

export default Footer;
