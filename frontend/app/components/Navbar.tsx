"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { User } from "@supabase/supabase-js";
import { Menu, X, Scissors } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Services", href: "/services" },
    { name: "Virtual Try-On", href: "/recolor" },
    { name: "Contact Us", href: "/#contact" },
  ];

  if (user) {
    navLinks.push({ name: "Appointments", href: "/bookings" });
  }

  const isSolid = scrolled || pathname !== "/";

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isSolid
        ? "bg-white/80 backdrop-blur-md border-b border-stone-200 py-3 shadow-sm"
        : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4 group z-50">
            {isSolid ? (
              <Image
                src="/black.png"
                alt="Royal Glow Logo"
                width={55}
                height={55}
                className="object-contain"
              />
            ) : (
              <Image
                src="/wite.png"
                alt="Royal Glow Logo"
                width={55}
                height={55}
                className="object-contain"
              />
            )}
            <span className={`font-serif tracking-widest text-base transition-colors hidden sm:block ${isSolid ? "text-stone-900" : "text-white"}`}>
              ROYAL GLOW
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium uppercase tracking-widest transition-colors relative group whitespace-nowrap ${isSolid ? "text-stone-600 hover:text-stone-900" : "text-white/80 hover:text-white"
                  }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${isSolid ? "bg-stone-900" : "bg-white"
                  }`}></span>
              </Link>
            ))}

            <div className="h-4 w-px bg-stone-300/50 mx-6"></div>

            {user ? (
              <>
                <button
                  onClick={handleLogout}
                  className={`text-sm font-medium uppercase tracking-widest transition-colors ${isSolid ? "text-stone-600 hover:text-stone-900" : "text-white/80 hover:text-white"
                    }`}
                >
                  Logout
                </button>
                <Link
                  href="/?book=true"
                  className={`text-xs font-semibold uppercase tracking-widest px-6 py-3 transition-all whitespace-nowrap ${isSolid
                    ? "bg-stone-900 text-white hover:bg-stone-800"
                    : "bg-white text-stone-900 hover:bg-white/90"
                    }`}
                >
                  Book Appointment
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className={`text-sm font-medium uppercase tracking-widest transition-colors ${isSolid ? "text-stone-600 hover:text-stone-900" : "text-white/80 hover:text-white"
                  }`}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden z-50 flex items-center">
            <button
              onClick={toggleMenu}
              className={`p-2 transition-colors ${isSolid || isOpen ? "text-stone-900" : "text-white"}`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col space-y-6 max-h-screen overflow-y-auto"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={toggleMenu}
                className="text-2xl font-serif text-stone-800 border-b border-stone-100 pb-4"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 flex flex-col space-y-4">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="text-lg font-medium text-stone-600 text-left"
                  >
                    Logout
                  </button>
                  <Link
                    href="/?book=true"
                    onClick={toggleMenu}
                    className="bg-stone-900 text-white text-center py-4 text-sm font-semibold uppercase tracking-widest mt-4"
                  >
                    Book Appointment
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={toggleMenu}
                  className="text-lg font-medium text-stone-600"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
