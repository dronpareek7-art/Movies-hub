import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Moviecontext } from "../context/movieContext";
import { PageLoader } from "./States";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(Moviecontext);
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session" />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}
