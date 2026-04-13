import { useContext } from "react";
import { Moviecontext } from "./Router";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user } = useContext(Moviecontext);
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?next=${location.pathname}`} replace />;
  }

  return children;
}

export default ProtectedRoute;