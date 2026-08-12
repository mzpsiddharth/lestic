"use client";

import { signIn } from "@/actions/auth";
import { useSearchParams } from "next/navigation";
import { Lock, Laptop } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Laptop className="h-5 w-5" />
          </span>
          <span className="text-2xl font-bold text-slate-900">Lestic Admin</span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">
            Only authorised Lestic administrators can access this area.
          </p>

          {error === "invalid" && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Invalid email or password. Please try again.
            </p>
          )}
          {error === "config" && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Supabase is not configured. Copy <code>.env.example</code> to{" "}
              <code>.env.local</code> and add your Supabase credentials, then
              restart the server.
            </p>
          )}

          <form action={signIn} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="label-lestic">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-lestic"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="label-lestic">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-lestic"
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              <Lock className="h-4 w-4" /> Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
