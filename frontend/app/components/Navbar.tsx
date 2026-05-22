"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { User } from "@supabase/supabase-js";
import { Menu, X, Scissors, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const prevScrollPos = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Check if user is admin
      if (currentUser) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const isUserAdmin = currentUser.user_metadata?.role === 'admin' || currentUser.email === adminEmail;
        setIsAdmin(isUserAdmin);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const isUserAdmin = currentUser.user_metadata?.role === 'admin' || currentUser.email === adminEmail;
        setIsAdmin(isUserAdmin);
      } else {
        setIsAdmin(false);
      }
    });

    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setScrolled(currentScrollPos > 20);

      if (currentScrollPos > prevScrollPos.current && currentScrollPos > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      prevScrollPos.current = currentScrollPos;
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

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isSolid = scrolled || pathname !== "/";

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isSolid
        ? "bg-white/80 backdrop-blur-md border-b border-stone-200 py-3 shadow-sm"
        : "bg-transparent py-5"
        } ${showNavbar ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 lg:space-x-4 group z-50 shrink-0">
            {isSolid ? (
              <Image
                src="/black.png"
                alt="Royal Glow Logo"
                width={55}
                height={55}
                style={{ width: "auto" }}
                className="object-contain"
              />
            ) : (
              <Image
                src="/wite.png"
                alt="Royal Glow Logo"
                width={55}
                height={55}
                style={{ width: "auto" }}
                className="object-contain"
              />
            )}
            <span className={`font-serif tracking-widest text-base transition-colors hidden sm:block whitespace-nowrap ${isSolid ? "text-stone-900" : "text-white"}`}>
              ROYAL GLOW
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-5 xl:space-x-6">
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

            <div className="h-4 w-px bg-stone-300/50 mx-3 lg:mx-4"></div>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium uppercase tracking-widest transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${isSolid ? "text-[#C69C6D] hover:text-[#B8885F]" : "text-[#C69C6D] hover:text-[#B8885F]"
                      }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className={`text-sm font-medium uppercase tracking-widest transition-colors whitespace-nowrap shrink-0 ${isSolid ? "text-stone-600 hover:text-stone-900" : "text-white/80 hover:text-white"
                    }`}
                >
                  Logout
                </button>
                <Link
                  href="/?book=true"
                  className={`text-xs font-semibold uppercase tracking-widest px-4 lg:px-6 py-3 transition-all whitespace-nowrap shrink-0 ${isSolid
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
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={toggleMenu}
                      className="text-lg font-medium text-[#C69C6D] flex items-center gap-2 border-b border-stone-100 pb-4"
                    >
                      <Shield className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  )}
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
