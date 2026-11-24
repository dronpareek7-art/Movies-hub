import { BiErrorCircle } from "react-icons/bi";
import { MdOutlineMovieFilter } from "react-icons/md";

export function PageLoader({ label = "Loading" }) {
  return (
    <div className="page-loader" role="status">
      <div className="spinner" />
      <span>{label}…</span>
    </div>
  );
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="state">
      <span className="state-icon">{icon || <MdOutlineMovieFilter />}</span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = "Something went wrong" }) {
  return (
    <div className="state" role="alert">
      <span className="state-icon"><BiErrorCircle /></span>
      <h3>{title}</h3>
      <p>{error?.message || "We couldn't load this right now."}</p>
      {onRetry && (
        <button className="btn btn-primary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
