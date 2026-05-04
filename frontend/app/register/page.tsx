"use client";

import { useState } from "react";
import { supabase } from "../../utils/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1 = Registration, 2 = Verify OTP
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Verification code sent! Please check your email for the OTP.");
      setStep(2);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
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
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center px-4">
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      <div className="relative z-10 w-full max-w-md bg-stone-900/80 p-8 rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl">
        <h2 className="text-2xl text-white font-serif mb-6 text-center tracking-widest uppercase">Register</h2>
        
        {message && (
          <div className={`mb-4 p-3 border rounded-md text-sm text-center ${message.includes('successful') || message.includes('sent') ? 'bg-stone-800 border-green-500/50 text-green-400' : 'bg-stone-800 border-red-500/50 text-red-400'}`}>
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-950 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-950 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Create a password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-md text-sm uppercase tracking-widest font-semibold hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">OTP Code</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-stone-950 border border-white/10 rounded-md px-4 py-3 text-white text-center tracking-[0.2em] font-bold focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Enter 6-digit code"
              />
              <p className="text-xs text-stone-500 mt-2 text-center">We sent a verification code to {email}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C69C6D] text-white py-3 rounded-md text-sm uppercase tracking-widest font-semibold hover:bg-[#a67c52] transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full bg-transparent text-stone-400 py-2 rounded-md text-xs uppercase tracking-widest hover:text-white transition-colors"
            >
              Change Email
            </button>
          </form>
        )}

        {step === 1 && (
          <>
            <div className="mt-6 flex items-center justify-center space-x-4">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-stone-500 text-xs uppercase tracking-widest">Or</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-6 w-full flex items-center justify-center bg-stone-800 text-white py-3 rounded-md text-sm font-medium hover:bg-stone-700 transition-colors border border-white/5"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-3" />
              Continue with Google
            </button>
          </>
        )}

        <p className="mt-8 text-center text-stone-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
