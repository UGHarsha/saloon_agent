"use client";

import { useState } from "react";
import { supabase } from "../../utils/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      // Check if there's a redirect target, or check if admin
      const searchParams = new URLSearchParams(window.location.search);
      const nextParam = searchParams.get("next") || "/";
      
      const user = data.user;
      // Uses NEXT_PUBLIC_ADMIN_EMAIL environment variable to avoid hardcoding your real email
      const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      
      if (isAdmin && nextParam === "/") {
        window.location.href = "/admin";
      } else {
        window.location.href = nextParam;
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative">
      <div className="absolute inset-0 bg-slate-950/40 z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/80 p-8 rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl">
        <h2 className="text-2xl text-blue-50 font-serif mb-6 text-center tracking-widest uppercase">
          Welcome Back
        </h2>

        {message && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-md text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-blue-300 text-xs uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-md px-4 py-3 text-blue-50 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-blue-300 text-xs uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-md px-4 py-3 text-blue-50 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-zinc-900 py-3 rounded-md text-sm uppercase tracking-widest font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-slate-400 text-xs uppercase tracking-widest">
            Or
          </span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="mt-6 w-full flex items-center justify-center bg-slate-800 text-blue-50 py-3 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors border border-white/5"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-3" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-blue-300 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-50 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
