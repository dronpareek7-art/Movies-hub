import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useMisc";
import SearchBox from "../Component/SearchBox";
import "./NotFound.css";

export default function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <div className="notfound">
      <p className="nf-code" aria-hidden="true">404</p>
      <h1>This reel is missing</h1>
      <p className="muted">The page you're looking for doesn't exist or has moved. Try searching for a title instead.</p>
      <div className="nf-search"><SearchBox /></div>
      <div className="nf-actions">
        <Link className="btn btn-primary" to="/">Go to home</Link>
        <Link className="btn btn-ghost" to="/browse/trending?type=movie">See what's trending</Link>
      </div>
    </div>
  );
}
