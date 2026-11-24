import { Link } from "react-router-dom";
import Hero from "./Component/Hero";
import Row from "./Component/Row";
import { useGenres, useDocumentTitle } from "./hooks/useMisc";
import "./Home.css";

export default function Home() {
  useDocumentTitle("");
  const { movies } = useGenres();

  return (
    <>
      <Hero />
      <div className="home">
        <nav className="genre-strip" aria-label="Browse by genre">
          <div className="chip-scroll">
            <Link className="chip is-active" to="/">All</Link>
            {movies.map((g) => (
              <Link key={g.id} className="chip" to={`/genre/${g.id}`}>{g.name}</Link>
            ))}
          </div>
        </nav>

        <Row title="Trending" category="trending" showWindow showType />
        <Row title="Popular movies" category="popular" type="movie" />
        <Row title="Popular TV shows" category="popular" type="tv" />
        <Row title="Top rated" category="top_rated" showType />
        <Row title="Coming soon" category="upcoming" showType />
        <Row title="Popular cast" category="people" />
      </div>
    </>
  );
}
