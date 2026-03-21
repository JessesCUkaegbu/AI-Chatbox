"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupUser } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await signupUser({ name, email, password });
      setSuccess("Account created successfully. Redirecting to chat...");
      setTimeout(() => {
        router.push("/");
      }, 900);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create account.";
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
              Create your account
            </p>
            <h1 className="text-2xl font-semibold">Join Jess Chat</h1>
            <p className="text-sm text-muted">
              Start chatting with the AI assistant built to help you move faster.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Full name
              </label>
              <input
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-brand/70 focus:ring-4 focus:ring-brand/20"
                placeholder="Jess C. Ukaegbu"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

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
                placeholder="Create a password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Confirm password
              </label>
              <input
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-brand/70 focus:ring-4 focus:ring-brand/20"
                placeholder="Confirm your password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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

            <button
              type="submit"
              className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-brand/70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <a className="font-semibold text-brand" href="/login">
              Log in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
