"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav 
      className="sticky top-0 z-50 border-b border-white/30"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-white font-serif tracking-widest text-xl drop-shadow-md hover:text-stone-200 transition-colors">
              ROYAL GLOW
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-xs text-white font-medium hover:text-stone-200 drop-shadow-md uppercase tracking-[0.15em] transition-colors relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/bookings"
              className="text-xs text-white font-medium hover:text-stone-200 drop-shadow-md uppercase tracking-[0.15em] transition-colors relative group"
            >
              Bookings
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/recolor"
              className="text-xs text-white font-medium hover:text-stone-200 drop-shadow-md uppercase tracking-[0.15em] transition-colors relative group"
            >
              Hair Recolor
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="bg-white/90 backdrop-blur-sm text-black font-semibold text-xs uppercase tracking-[0.15em] px-6 py-2.5 hover:bg-white transition-colors shadow-lg">
              Book Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 text-stone-300 hover:text-white focus:outline-none transition-colors"
              aria-expanded={isOpen}
            >
              <svg
                className={`h-6 w-6 transition-transform duration-300 ${
                  isOpen ? "rotate-90" : ""
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-stone-900 border-t border-white/10">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link
              href="/"
              className="block text-stone-300 px-3 py-3 text-xs uppercase tracking-[0.15em] hover:bg-stone-800 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/bookings"
              className="block text-stone-300 px-3 py-3 text-xs uppercase tracking-[0.15em] hover:bg-stone-800 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Bookings
            </Link>
            <Link
              href="/recolor"
              className="block text-stone-300 px-3 py-3 text-xs uppercase tracking-[0.15em] hover:bg-stone-800 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Hair Recolor
            </Link>
            <button className="w-full text-center bg-white text-black mt-4 py-3 text-xs uppercase tracking-[0.15em] hover:bg-stone-200 transition-colors">
              Book Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
