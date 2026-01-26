import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { auth } from "./services/auth";
import RequireAuth from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={auth.isLoggedIn() ? "/home" : "/login"} replace />} />

      <Route
        path="/login"
        element={auth.isLoggedIn() ? <Navigate to="/home" replace /> : <Login />}
      />

      <Route
        path="/home"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
