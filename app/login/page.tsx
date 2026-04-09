"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center font-black text-white text-xl">R</div>
            <span className="text-white text-2xl font-bold">RestaurantIQ</span>
          </div>
          <p className="text-gray-400">
            {mode === "login" ? "Sign in to your account" : "Reset your password"}
          </p>
        </div>

        <div className="bg-navy2 border border-brd rounded-2xl p-8">

          {/* ── Forgot password mode ── */}
          {mode === "reset" ? (
            resetSent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">📬</div>
                <div className="text-white font-bold mb-2">Check your inbox</div>
                <p className="text-gray-400 text-sm mb-6">
                  We sent a password reset link to <span className="text-orange">{email}</span>.
                  Click the link in the email to set a new password.
                </p>
                <button onClick={() => { setMode("login"); setResetSent(false); }}
                  className="text-orange hover:underline text-sm">
                  ← Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                {error && (
                  <div className="bg-coral/10 border border-coral/30 text-coral rounded-lg px-4 py-3 text-sm">{error}</div>
                )}
                <p className="text-gray-400 text-sm">Enter your email and we'll send you a reset link.</p>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-navy3 border border-brd rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <button type="button" onClick={() => { setMode("login"); setError(""); }}
                  className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors">
                  ← Back to Sign In
                </button>
              </form>
            )
          ) : (

          /* ── Login mode ── */
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-coral/10 border border-coral/30 text-coral rounded-lg px-4 py-3 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-navy3 border border-brd rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm text-gray-400">Password</label>
                  <button type="button" onClick={() => { setMode("reset"); setError(""); }}
                    className="text-xs text-orange hover:underline">
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-navy3 border border-brd rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {mode === "login" && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-brd" />
                <span className="text-gray-600 text-sm">or</span>
                <div className="flex-1 h-px bg-brd" />
              </div>

              <button
                onClick={handleGoogle}
                className="w-full bg-navy3 border border-brd hover:border-gray-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-gray-500 text-sm mt-5">
                Don't have an account?{" "}
                <Link href="/signup" className="text-orange hover:underline">Sign up</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
