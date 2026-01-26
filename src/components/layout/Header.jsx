// src/layouts/Header.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/auth"; // ✅ fixed path

const decodeToken = (token) => {
  try {
    if (!token) return null;
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();

  const token = auth.getToken(); // reads latest on render

  const user = useMemo(() => decodeToken(token), [token]);

  const firstName =
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarLetter = firstName.charAt(0).toUpperCase();

  const handleLogout = () => {
    auth.logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="mb-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-lg text-white/80 mt-2">{subtitle}</p>}
      </div>

      <div className="flex items-center justify-between card-glass rounded-2xl px-6 py-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            aria-label="User avatar"
            title={firstName}
          >
            {avatarLetter}
          </div>

          <div>
            <p className="text-white font-semibold">{firstName}</p>
            <p className="text-white/70 text-sm">{auth.isLoggedIn() ? "Logged in" : "Guest"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2 rounded-xl text-white font-semibold transition"
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
