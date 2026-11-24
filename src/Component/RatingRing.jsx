import { percent } from "../utils/format";

export default function RatingRing({ vote }) {
  const pct = percent(vote);
  const r = 24;
  const c = 2 * Math.PI * r;
  const color = pct >= 70 ? "var(--good)" : pct >= 50 ? "var(--gold)" : "var(--accent)";
  return (
    <div className="ring" role="img" aria-label={pct ? `User score ${pct} percent` : "Not rated yet"}>
      <svg viewBox="0 0 56 56">
        <circle className="track" cx="28" cy="28" r={r} />
        {pct > 0 && (
          <circle className="value" cx="28" cy="28" r={r} stroke={color} strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
        )}
      </svg>
      <b>{pct ? <>{pct}<small>%</small></> : "NR"}</b>
    </div>
  );
}
