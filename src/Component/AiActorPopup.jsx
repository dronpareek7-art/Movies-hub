import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { img, tmdb } from "../api/tmdb";
import { Moviecontext } from "../context/movieContext";
import "./AiActorPopup.css";

// First-login welcome: pick a favourite actor and read a short note about them.
// Actors and biographies now come straight from TMDB, so no third-party AI key
// needs to ship inside the browser bundle.
function firstSentences(text, count = 2) {
  const parts = (text || "").replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g) || [];
  return parts.slice(0, count).join(" ").trim();
}

export default function OnboardingPopup() {
  const { user } = useContext(Moviecontext);
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState(null);
  const [actors, setActors] = useState({ male: [], female: [] });
  const [loadingActors, setLoadingActors] = useState(false);
  const [actor, setActor] = useState(null);
  const [fact, setFact] = useState("");
  const [loadingFact, setLoadingFact] = useState(false);

  const key = user ? `onboardingCompleted_${user.uid}` : null;
  const show = Boolean(user) && !dismissed && !localStorage.getItem(key);

  useEffect(() => {
    if (!show) return undefined;
    let alive = true;
    setLoadingActors(true);
    Promise.all([tmdb("/person/popular", { page: 1 }), tmdb("/person/popular", { page: 2 })])
      .then(([a, b]) => {
        if (!alive) return;
        const all = [...(a.results || []), ...(b.results || [])].filter((p) => p.profile_path && p.known_for_department === "Acting");
        setActors({
          male: all.filter((p) => p.gender === 2).slice(0, 6),
          female: all.filter((p) => p.gender === 1).slice(0, 6),
        });
      })
      .catch(() => {})
      .finally(() => alive && setLoadingActors(false));
    return () => {
      alive = false;
    };
  }, [show]);

  useEffect(() => {
    if (!show) return undefined;
    const onKey = (e) => e.key === "Escape" && finish();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  function finish() {
    if (key) localStorage.setItem(key, "true");
    setDismissed(true);
  }

  async function choose(person) {
    setActor(person);
    setStep(3);
    setLoadingFact(true);
    try {
      const full = await tmdb(`/person/${person.id}`);
      setFact(firstSentences(full.biography) || `${person.name} is one of the most searched actors on Movie-Hub right now.`);
    } catch {
      setFact(`${person.name} is one of the most searched actors on Movie-Hub right now.`);
    } finally {
      setLoadingFact(false);
    }
  }

  if (!show) return null;
  const list = gender ? actors[gender] : [];

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && finish()}>
      <div className="modal onboarding" role="dialog" aria-modal="true" aria-labelledby="onb-title">
        <button className="modal-close" onClick={finish} aria-label="Skip personalisation"><FiX /></button>
        <div className="onb-body">
          <h2 id="onb-title">Welcome to Movie-Hub</h2>

          {step === 1 && (
            <>
              <p className="muted">Tell us whose films you enjoy and we'll introduce you to them.</p>
              <div className="onb-choices">
                <button className="btn btn-ghost" disabled={loadingActors} onClick={() => { setGender("male"); setStep(2); }}>Actors</button>
                <button className="btn btn-ghost" disabled={loadingActors} onClick={() => { setGender("female"); setStep(2); }}>Actresses</button>
              </div>
              {loadingActors && <p className="muted">Finding popular names…</p>}
              <button className="link-btn" onClick={finish}>Skip for now</button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="muted">Pick a favourite.</p>
              {list.length === 0 ? (
                <p className="muted">We couldn't load names right now.</p>
              ) : (
                <div className="onb-actors">
                  {list.map((p) => (
                    <button key={p.id} onClick={() => choose(p)}>
                      <img src={img(p.profile_path, "w185")} alt="" />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <button className="link-btn" onClick={() => setStep(1)}>Back</button>
            </>
          )}

          {step === 3 && actor && (
            <>
              <div className="onb-fact">
                <img src={img(actor.profile_path, "w185")} alt="" />
                <div>
                  <h3>{actor.name}</h3>
                  {loadingFact ? <div className="skeleton" style={{ height: 64, width: "100%" }} /> : <p>{fact}</p>}
                </div>
              </div>
              <div className="onb-choices">
                <Link className="btn btn-ghost" to={`/person/${actor.id}`} onClick={finish}>See their films</Link>
                <button className="btn btn-primary" onClick={finish} disabled={loadingFact}>Start exploring</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
