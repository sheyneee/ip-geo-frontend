import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

const RegisterModal = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!emailOk(email)) return false;
    if (!password || password.length < 8) return false;
    if (password !== confirmPassword) return false;
    return true;
  }, [name, email, password, confirmPassword]);

  const showError = async (message) => {
    await Swal.fire({
      icon: "error",
      title: "Registration failed",
      text: message,
      confirmButtonText: "OK",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      if (!name.trim()) return showError("Full name is required.");
      if (!emailOk(email)) return showError("Please enter a valid email address.");
      if (!password || password.length < 8) return showError("Password must be at least 8 characters.");
      if (password !== confirmPassword) return showError("Passwords do not match.");
      return showError("Please complete all fields correctly.");
    }

    try {
      setLoading(true);

      await onSubmit?.({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      await Swal.fire({
        icon: "success",
        title: "Account created",
        text: "Registration successful. You may now sign in.",
        timer: 1400,
        showConfirmButton: false,
      });

      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";

      await showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        disabled={loading}
      />

      {/* Modal */}
      <div className="relative mx-auto w-full max-w-lg px-4 sm:px-6">
        <div className="mt-10 sm:mt-16 card-glass rounded-3xl p-5 sm:p-8 shadow-xl border border-white/10">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Create account</h2>
              <p className="text-white/70 text-sm mt-1">
                Register to access IP geolocation features.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-white disabled:opacity-60"
              disabled={loading}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Full name
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white outline-none"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
            Password
            </label>
            <input
            type="password"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white outline-none"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            />
        </div>

        <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
            Confirm Password
            </label>
            <input
            type="password"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white outline-none"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            />
        </div>
        </div>

        <p className="text-xs text-white/60 pt-1">
        Password must be at least 8 characters.
        </p>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/15 transition disabled:opacity-60"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                {loading ? "Creating..." : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
