"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { User } from "@supabase/supabase-js";
import { LogOut, ArrowLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo and Admin Title */}
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-2 text-stone-500 hover:text-stone-900 transition"
              title="Return to main website"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-serif tracking-widest text-sm">Back to Website</span>
              <span className="sm:hidden font-serif text-sm">Back</span>
            </Link>
            <div className="h-8 w-px bg-stone-200"></div>
            <h1 className="font-serif text-[#C69C6D] uppercase tracking-widest font-semibold">Admin Panel</h1>
          </div>

          {/* Right: User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* User Email */}
            <div className="hidden md:block text-right">
              <p className="text-stone-700 text-sm font-medium">{user?.email || "Loading..."}</p>
              <p className="text-stone-400 text-xs">Administrator</p>
            </div>

            {/* User Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition text-stone-700"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Menu</span>
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden z-50">
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-stone-700 hover:bg-stone-50 text-sm font-medium border-b border-stone-100"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
