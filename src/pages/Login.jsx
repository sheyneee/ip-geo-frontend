import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { auth } from "../services/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setToast("");
    setLoading(true);

    try {
      const res = await api.post("/login", { email, password });

      const token = res.data?.token || res.data?.access_token;
      if (!token) throw new Error("Login succeeded but token is missing in response.");

      if (remember) auth.setToken(token);
      else sessionStorage.setItem("token", token);

      setToast("✓ Login successful");
      setTimeout(() => navigate("/home", { replace: true }), 350);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full gradient-bg overflow-auto min-h-screen">
      <main className="h-full w-full flex items-center justify-center p-6">
        <div className="glass-morphism rounded-3xl p-8 md:p-12 w-full max-w-md animate-fade-in">
          <div className="flex justify-center mb-8">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#2d3748" }}>
              Welcome Back
            </h1>
            <p className="text-base" style={{ color: "#718096" }}>
              Sign in to continue to your account
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {toast && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {toast}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: "#2d3748" }}>
                Email Address
              </label>
              <div className="relative">
                <div className="icon-wrapper absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5" style={{ color: "#667eea" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  className="input-field w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none text-base"
                  style={{ borderColor: "#e2e8f0", color: "#2d3748" }}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: "#2d3748" }}>
                Password
              </label>
              <div className="relative">
                <div className="icon-wrapper absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5" style={{ color: "#667eea" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  className="input-field w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none text-base"
                  style={{ borderColor: "#e2e8f0", color: "#2d3748" }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "#667eea" }}
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                />
                <span className="ml-2 text-sm" style={{ color: "#4a5568" }}>
                  Remember me
                </span>
              </label>

              <button
                type="button"
                className="text-sm font-semibold"
                style={{ color: "#667eea" }}
                onClick={() => setToast("Forgot password is not implemented.")}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-btn w-full py-3 rounded-xl text-white font-semibold text-base disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: "#e2e8f0" }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white" style={{ color: "#718096" }}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social buttons UI only */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center py-3 px-4 rounded-xl border-2 transition-all hover:border-gray-400"
                style={{ borderColor: "#e2e8f0" }}
                onClick={() => setToast("Google login is UI only.")}
              >
                <span className="text-sm font-medium" style={{ color: "#4a5568" }}>
                  Google
                </span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center py-3 px-4 rounded-xl border-2 transition-all hover:border-gray-400"
                style={{ borderColor: "#e2e8f0" }}
                onClick={() => setToast("Facebook login is UI only.")}
              >
                <span className="text-sm font-medium" style={{ color: "#4a5568" }}>
                  Facebook
                </span>
              </button>
            </div>
          </form>

          <div className="text-center mt-8">
            <p className="text-sm" style={{ color: "#718096" }}>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-semibold"
                style={{ color: "#667eea" }}
                onClick={() => setToast("Registration screen not implemented.")}
              >
                Sign up now
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
