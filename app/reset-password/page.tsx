"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Supabase puts the session in the URL hash on redirect — this picks it up
  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center font-black text-white text-xl">R</div>
            <span className="text-white text-2xl font-bold">RestaurantIQ</span>
          </div>
          <p className="text-gray-400">Set a new password</p>
        </div>

        <div className="bg-navy2 border border-brd rounded-2xl p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✅</div>
              <div className="text-white font-bold mb-2">Password updated!</div>
              <p className="text-gray-400 text-sm">Redirecting you to the dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-coral/10 border border-coral/30 text-coral rounded-lg px-4 py-3 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-navy3 border border-brd rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange transition-colors"
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
