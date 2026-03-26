import "./Fotter.css";
import { IoLogoInstagram } from "react-icons/io5";
import { FaFacebook } from "react-icons/fa6";
import { FaTwitter } from "react-icons/fa";
import { RiMovie2AiFill } from "react-icons/ri";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2 className="footer-logo"> <RiMovie2AiFill /> MovieHub</h2>
          <p>
            Discover trending movies, build your watchlist, and explore cinema
            like never before.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/Watchlist">Watchlist</a>
          <a href="/Login">Login</a>
        </div>

        <div className="footer-section">
          <h3>Categories</h3>
          <a href="#">Trending</a>
          <a href="#">Top Rated</a>
          <a href="#">Upcoming</a>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="socials">
            <IoLogoInstagram />
            <FaFacebook />
           <FaTwitter />
          </div>
        </div>
      </div>

      <div className="footer-bottom">© 2026 MovieHub. All rights reserved.</div>
    </footer>
  );
}

export default Footer;
