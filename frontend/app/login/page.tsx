"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await loginUser({ email, password });
      setSuccess("Login successful. Redirecting to chat...");
      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to log in.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-black/10 bg-card p-8 shadow-soft">
        <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand/20" />
        <div className="relative space-y-6">
          <div className="space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
              <span className="text-lg font-bold">JC</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Welcome back
            </p>
            <h1 className="text-2xl font-semibold">Log in to Jess Chat</h1>
            <p className="text-sm text-muted">
              Continue your conversations and access your personalized chat
              history.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Email
              </label>
              <input
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-brand/70 focus:ring-4 focus:ring-brand/20"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Password
              </label>
              <input
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-brand/70 focus:ring-4 focus:ring-brand/20"
                placeholder="Enter your password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-black/20" />
                Remember me
              </label>
              <button type="button" className="font-semibold text-brand">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-brand/70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            New here?{" "}
            <a className="font-semibold text-brand" href="/signup">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
