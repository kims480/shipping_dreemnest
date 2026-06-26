'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const DEMO_ACCOUNTS = [
  { label: "Admin",    email: "admin@dreemnest.sa",    password: "Admin@123" },
  { label: "DFP",     email: "ahmed@dreemnest.sa",    password: "Ahmed@123" },
  { label: "Merchant",email: "merchant@salla.sa",     password: "Merchant@123" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  }

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple text-lg font-black text-brand-lime shadow-md">
              D
            </span>
            <span className="text-xl font-bold text-brand-purple">Dreem Nest</span>
          </Link>
          <p className="mt-2 text-sm text-foreground/60">Sign in to the operations console</p>
        </div>

        {/* Demo quick-fill */}
        <div className="mb-6 rounded-xl border border-border bg-surface-muted p-4">
          <p className="mb-2 text-xs font-semibold text-foreground/50 uppercase tracking-wide">Demo accounts</p>
          <div className="flex gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.label}
                onClick={() => fillDemo(a)}
                className="flex-1 rounded-lg border border-border bg-white py-1.5 text-xs font-medium text-foreground/70 hover:border-brand-purple hover:text-brand-purple transition-colors"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition"
              placeholder="you@dreemnest.sa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-status-breached/30 bg-status-breached/5 px-4 py-3 text-sm text-status-breached">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full py-2.5" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
