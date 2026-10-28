"use client";
import { useEffect, useRef, useState } from "react";

export default function AuthModal({ onClose, onAuthed }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const first = useRef(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      onAuthed(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/65 p-3"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="my-auto grid w-full max-w-sm gap-3 rounded-xl bg-surface p-6 shadow-2xl"
      >
        <h2 id="auth-title" className="font-display text-2xl font-bold tracking-tight">
          {mode === "login" ? "Log in" : "Create account"}
        </h2>
        <p className="text-sm text-muted">
          Browsing needs no account. Log in to rate films, write reviews and keep a wishlist.
        </p>
        {mode === "signup" && (
          <div>
            <label htmlFor="auth-name" className="text-sm font-semibold">Name</label>
            <input id="auth-name" ref={first} className="field w-full" value={form.name} onChange={set("name")} maxLength={40} autoComplete="name" required />
          </div>
        )}
        <div>
          <label htmlFor="auth-email" className="text-sm font-semibold">Email</label>
          <input id="auth-email" ref={mode === "login" ? first : null} type="email" className="field w-full" value={form.email} onChange={set("email")} autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="auth-pass" className="text-sm font-semibold">Password</label>
          <input id="auth-pass" type="password" className="field w-full" value={form.password} onChange={set("password")} minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
        </div>
        <p className="min-h-[1.3em] text-sm font-semibold text-danger" aria-live="polite">{error}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="btn-primary" disabled={busy}>{mode === "login" ? "Log in" : "Sign up"}</button>
          <button type="button" className="btn-ghost" onClick={onClose}>Keep browsing</button>
        </div>
        <button
          type="button"
          className="justify-self-start text-sm font-semibold text-accent underline underline-offset-2"
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
        >
          {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
