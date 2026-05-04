"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Users, Calendar, Settings, Menu, X } from "lucide-react";
import { supabase } from "../../utils/supabase";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Services", href: "/admin/services", icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <AdminNavbar />
      <div className="flex h-screen bg-stone-100 font-sans text-stone-900 pt-16">
      
      {/* Admin Sidebar - Desktop */}
        <aside className="w-64 bg-white border-r border-stone-200 shadow-sm flex-col hidden md:flex">
          <div className="p-6 border-b border-stone-100">
            <h2 className="text-xl font-serif text-[#C69C6D] uppercase tracking-widest">Admin Panel</h2>
          </div>
        
          <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm transition ${
                  active
                    ? "bg-stone-50 text-[#C69C6D] font-semibold"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-stone-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-md font-medium text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <div className="fixed top-20 right-4 z-40 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-md shadow-md border border-stone-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-stone-600" />
          ) : (
            <Menu className="w-5 h-5 text-stone-600" />
          )}
        </button>
      </div>

      {/* Admin Sidebar - Mobile */}
      {isMobileMenuOpen && (
        <aside className="fixed inset-0 top-20 z-30 md:hidden bg-white border-r border-stone-200 shadow-lg w-64">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm transition ${
                    active
                      ? "bg-stone-50 text-[#C69C6D] font-semibold"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-stone-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-md font-medium text-sm transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 md:ml-0">
        <div className="max-w-4xl mx-auto">
          {/* User Info Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif text-[#3E2723] mb-1">Dashboard</h1>
              <p className="text-stone-500 text-sm">
                {user ? `Welcome, ${user.email}` : "Loading..."}
              </p>
            </div>
          </div>

          {/* Welcome Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-stone-200 text-center mb-8">
            <div className="w-20 h-20 bg-[#C69C6D]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="w-10 h-10 text-[#C69C6D]" />
            </div>
            
            <h2 className="text-3xl font-serif text-[#3E2723] mb-2">Hello Admin!</h2>
            <p className="text-stone-500 max-w-lg mx-auto mb-6 leading-relaxed">
              Your secure middleware authentication is working perfectly. 
              Only authorized administrators can see this page.
            </p>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/admin/bookings"
              className="p-6 border border-stone-200 rounded-lg hover:border-[#C69C6D] hover:shadow-md transition cursor-pointer bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C69C6D]/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#C69C6D]" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 mb-1">Manage Bookings</h3>
                  <p className="text-xs text-stone-400">View and approve appointments</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/services"
              className="p-6 border border-stone-200 rounded-lg hover:border-[#C69C6D] hover:shadow-md transition cursor-pointer bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C69C6D]/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-[#C69C6D]" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 mb-1">Update Services</h3>
                  <p className="text-xs text-stone-400">Change prices and descriptions</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/customers"
              className="p-6 border border-stone-200 rounded-lg hover:border-[#C69C6D] hover:shadow-md transition cursor-pointer bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C69C6D]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#C69C6D]" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 mb-1">Manage Customers</h3>
                  <p className="text-xs text-stone-400">View customer profiles and history</p>
                </div>
              </div>
            </Link>

            <div className="p-6 border border-stone-200 rounded-lg hover:border-[#C69C6D] hover:shadow-md transition bg-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C69C6D]/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-[#C69C6D]" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 mb-1">Settings</h3>
                  <p className="text-xs text-stone-400">Configure admin preferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  );
}
