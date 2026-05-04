import Link from "next/link";
import { LogOut, LayoutDashboard, Users, Calendar, Settings } from "lucide-react";
import { supabase } from "../../utils/supabase";

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-stone-100 font-sans text-stone-900 pt-20">
      
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 shadow-sm flex flex-col hidden md:flex">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-serif text-[#C69C6D] uppercase tracking-widest">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-stone-50 text-[#C69C6D] rounded-md font-semibold text-sm">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 rounded-md font-medium text-sm transition">
            <Calendar className="w-4 h-4" />
            Bookings
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 rounded-md font-medium text-sm transition">
            <Users className="w-4 h-4" />
            Customers
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 rounded-md font-medium text-sm transition">
            <Settings className="w-4 h-4" />
            Services
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto mt-10">
          <div className="bg-white p-10 rounded-xl shadow-lg border border-stone-200 text-center">
            
            <div className="w-20 h-20 bg-[#C69C6D]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="w-10 h-10 text-[#C69C6D]" />
            </div>
            
            <h1 className="text-4xl font-serif text-[#3E2723] mb-4">Hello Admin!</h1>
            <p className="text-stone-500 max-w-lg mx-auto mb-8 leading-relaxed">
              Your secure middleware authentication is working perfectly. 
              Only authorized administrators can see this page.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="p-6 border border-stone-200 rounded-lg hover:border-[#C69C6D] transition cursor-pointer">
                <h3 className="font-bold text-stone-800 mb-1">Manage Bookings</h3>
                <p className="text-xs text-stone-400">View and approve appointments</p>
              </div>
              <div className="p-6 border border-stone-200 rounded-lg hover:border-[#C69C6D] transition cursor-pointer">
                <h3 className="font-bold text-stone-800 mb-1">Update Services</h3>
                <p className="text-xs text-stone-400">Change prices and pictures</p>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
