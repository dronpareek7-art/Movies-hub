import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import { img, tagType } from "../api/tmdb";
import { useTmdb } from "../hooks/useTmdb";
import { useDocumentTitle } from "../hooks/useMisc";
import { ageFrom, formatDate } from "../utils/format";
import MediaCard from "../Component/MediaCard";
import Segmented from "../Component/Segmented";
import { EmptyState, ErrorState } from "../Component/States";
import "./SinglePerson.css";

const PAGE = 18;
const GENDER = { 1: "Female", 2: "Male", 3: "Non-binary" };

export default function SinglePerson() {
  const { id } = useParams();
  const { data: person, error, loading, refetch } = useTmdb(`/person/${id}`, {
    append_to_response: "combined_credits,external_ids",
  });
  const [filter, setFilter] = useState("movie");
  const [shown, setShown] = useState(PAGE);
  const [fullBio, setFullBio] = useState(false);

  useDocumentTitle(person?.name);

  const credits = useMemo(() => {
    const cast = person?.combined_credits?.cast || [];
    const seen = new Set();
    return cast
      .filter((c) => c.poster_path && (c.media_type === "movie" || c.media_type === "tv"))
      .filter((c) => {
        const key = `${c.media_type}${c.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [person]);

  const knownFor = useMemo(
    () => [...credits].sort((a, b) => (b.vote_count || 0) * (b.vote_average || 0) - (a.vote_count || 0) * (a.vote_average || 0)).slice(0, 14),
    [credits],
  );
  const filmography = useMemo(
    () =>
      credits
        .filter((c) => c.media_type === filter)
        .sort((a, b) => (b.release_date || b.first_air_date || "").localeCompare(a.release_date || a.first_air_date || "")),
    [credits, filter],
  );

  if (loading) {
    return (
      <div className="page sp" aria-busy="true">
        <div className="sp-grid">
          <div className="skeleton" style={{ aspectRatio: "2/3", borderRadius: 16 }} />
          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <div className="skeleton" style={{ height: 50, width: "60%" }} />
            <div className="skeleton" style={{ height: 160 }} />
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div className="page">{error.status === 404 ? <EmptyState title="Person not found" action={<Link className="btn btn-primary" to="/">Back to home</Link>} /> : <ErrorState error={error} onRetry={refetch} />}</div>;
  if (!person) return null;

  const age = ageFrom(person.birthday, person.deathday);
  const bio = person.biography?.trim();
  const long = bio && bio.length > 700;
  const imdb = person.imdb_id || person.external_ids?.imdb_id;
  const social = person.external_ids || {};

  return (
    <div className="page sp">
      <div className="sp-grid">
        <aside className="sp-side">
          <div className="sp-photo">
            {person.profile_path ? <img src={img(person.profile_path, "w500")} alt={person.name} /> : <span>{person.name.charAt(0)}</span>}
          </div>
          <dl>
            <dt>Known for</dt><dd>{person.known_for_department || "—"}</dd>
            {GENDER[person.gender] && <><dt>Gender</dt><dd>{GENDER[person.gender]}</dd></>}
            {person.birthday && <><dt>Born</dt><dd>{formatDate(person.birthday)}{!person.deathday && age !== null ? ` (${age} years old)` : ""}</dd></>}
            {person.deathday && <><dt>Died</dt><dd>{formatDate(person.deathday)}{age !== null ? ` (aged ${age})` : ""}</dd></>}
            {person.place_of_birth && <><dt>Place of birth</dt><dd>{person.place_of_birth}</dd></>}
            {person.also_known_as?.length > 0 && <><dt>Also known as</dt><dd>{person.also_known_as.slice(0, 4).join(", ")}</dd></>}
          </dl>
          <div className="side-links">
            {imdb && <a className="btn btn-ghost btn-sm" href={`https://www.imdb.com/name/${imdb}`} target="_blank" rel="noreferrer"><FiExternalLink /> IMDb</a>}
            {social.instagram_id && <a className="btn btn-ghost btn-sm" href={`https://instagram.com/${social.instagram_id}`} target="_blank" rel="noreferrer"><FiExternalLink /> Instagram</a>}
            {social.twitter_id && <a className="btn btn-ghost btn-sm" href={`https://x.com/${social.twitter_id}`} target="_blank" rel="noreferrer"><FiExternalLink /> X</a>}
          </div>
        </aside>

        <div className="sp-main">
          <h1 className="page-title">{person.name}</h1>
          <section>
            <h2 className="section-title">Biography</h2>
            {bio ? (
              <>
                <p className={`sp-bio ${long && !fullBio ? "clamp" : ""}`}>{bio}</p>
                {long && <button className="link-btn" onClick={() => setFullBio(!fullBio)}>{fullBio ? "Show less" : "Read full biography"}</button>}
              </>
            ) : (
              <p className="muted">We don't have a biography for {person.name} yet.</p>
            )}
          </section>

          {knownFor.length > 0 && (
            <section>
              <h2 className="section-title">Known for</h2>
              <div className="h-scroll cards">{knownFor.map((c) => <MediaCard key={`${c.media_type}${c.id}`} item={c} type={c.media_type} />)}</div>
            </section>
          )}

          <section>
            <div className="sp-filmhead">
              <h2 className="section-title">Filmography</h2>
              <Segmented
                label="Credit type"
                value={filter}
                options={[
                  { value: "movie", label: `Movies (${credits.filter((c) => c.media_type === "movie").length})` },
                  { value: "tv", label: `TV (${credits.filter((c) => c.media_type === "tv").length})` },
                ]}
                onChange={(v) => { setFilter(v); setShown(PAGE); }}
              />
            </div>
            {filmography.length === 0 ? (
              <EmptyState title="No credits listed" message="TMDB has no acting credits of this type for this person." />
            ) : (
              <>
                <div className="media-grid">
                  {tagType(filmography.slice(0, shown), filter).map((c) => <MediaCard key={`${c.media_type}${c.id}${c.credit_id}`} item={c} type={filter} />)}
                </div>
                {shown < filmography.length && (
                  <div className="load-more-wrap">
                    <button className="btn btn-ghost" onClick={() => setShown((n) => n + PAGE)}>Show more ({filmography.length - shown} left)</button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
