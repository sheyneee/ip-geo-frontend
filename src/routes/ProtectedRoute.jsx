import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../services/auth";

export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!auth.isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
