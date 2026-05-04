"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import AdminNavbar from "../../components/AdminNavbar";
import { Calendar, Trash2, Edit2, X, Search, Save } from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string;
  customer_name: string;
  service: string;
  appointment_date: string;
  created_at: string;
  user_id?: string;
  user_email?: string; // might not exist in db, but we try
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Booking>>({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .order("appointment_date", { ascending: false });

      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (booking: Booking) => {
    setEditingId(booking.id);
    setEditFormData({
      customer_name: booking.customer_name,
      service: booking.service,
      appointment_date: booking.appointment_date,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (id: string) => {
    setActionLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          customer_name: editFormData.customer_name,
          service: editFormData.service,
          appointment_date: editFormData.appointment_date,
        })
        .eq("id", id);

      if (updateError) throw updateError;
      
      // Update local state
      setBookings(bookings.map(b => b.id === id ? { ...b, ...editFormData } : b));
      setEditingId(null);
      setEditFormData({});
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert("Failed to update booking: " + errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) {
      return;
    }
    
    setActionLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      
      // Update local state
      setBookings(bookings.filter(b => b.id !== id));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert("Failed to delete booking: " + errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.service?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminNavbar />
      <div className="flex h-screen bg-stone-100 font-sans text-stone-900 pt-16">
        
        {/* Admin Sidebar - Desktop */}
        <aside className="w-64 bg-white border-r border-stone-200 shadow-sm flex-col hidden md:flex h-full">
          <nav className="flex-1 p-4 space-y-2 mt-4">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 rounded-md font-medium text-sm transition">
              Dashboard
            </Link>
            <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 bg-stone-50 text-[#C69C6D] rounded-md font-semibold text-sm transition">
              Bookings
            </Link>
            <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 rounded-md font-medium text-sm transition">
              Customers
            </Link>
            <Link href="/admin/services" className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 rounded-md font-medium text-sm transition">
              Services
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif text-[#3E2723] flex items-center gap-3 mb-2">
                  <Calendar className="w-8 h-8 text-[#C69C6D]" />
                  Manage Appointments
                </h1>
                <p className="text-stone-500 text-sm">
                  View, edit, and delete all customer bookings here.
                </p>
              </div>
              
              {/* Search */}
              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-stone-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search name or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#C69C6D] focus:ring-1 focus:ring-[#C69C6D] transition"
                />
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#C69C6D]"></div>
                  <p className="text-stone-500 mt-4 text-sm font-medium">Loading appointments...</p>
                </div>
              ) : error ? (
                <div className="py-20 text-center text-red-500 px-6">
                  <p>Error loading bookings: {error}</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="py-20 text-center px-6">
                  <p className="text-stone-500 text-lg">No appointments found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-sm font-semibold tracking-wider text-stone-600 uppercase">
                        <th className="p-4 pl-6">Customer</th>
                        <th className="p-4">Service</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Booked On</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-stone-50/50 transition">
                          
                          {/* Customer Name */}
                          <td className="p-4 pl-6 align-middle">
                            {editingId === booking.id ? (
                              <input
                                type="text"
                                value={editFormData.customer_name || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, customer_name: e.target.value })}
                                className="w-full px-3 py-1.5 border border-[#C69C6D] rounded text-sm focus:outline-none"
                              />
                            ) : (
                              <div className="font-medium text-stone-800">{booking.customer_name || "Unknown"}</div>
                            )}
                          </td>
                          
                          {/* Service */}
                          <td className="p-4 align-middle">
                            {editingId === booking.id ? (
                              <input
                                type="text"
                                value={editFormData.service || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, service: e.target.value })}
                                className="w-full px-3 py-1.5 border border-[#C69C6D] rounded text-sm focus:outline-none"
                              />
                            ) : (
                              <div className="text-sm font-medium text-[#C69C6D] bg-[#C69C6D]/10 inline-block px-3 py-1 rounded-full whitespace-nowrap truncate max-w-50">
                                {booking.service || "Not specified"}
                              </div>
                            )}
                          </td>

                          {/* Date & Time */}
                          <td className="p-4 align-middle">
                            {editingId === booking.id ? (
                              <input
                                type="datetime-local"
                                value={editFormData.appointment_date ? new Date(editFormData.appointment_date).toISOString().slice(0, 16) : ""}
                                onChange={(e) => setEditFormData({ ...editFormData, appointment_date: new Date(e.target.value).toISOString() })}
                                className="w-full px-3 py-1.5 border border-[#C69C6D] rounded text-sm focus:outline-none"
                              />
                            ) : (
                              <div className="text-sm text-stone-600">
                                {new Date(booking.appointment_date).toLocaleString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </div>
                            )}
                          </td>

                          {/* Created At */}
                          <td className="p-4 align-middle">
                            <div className="text-xs text-stone-400">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-4 pr-6 text-right align-middle">
                            <div className="flex items-center justify-end gap-2">
                              {editingId === booking.id ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(booking.id)}
                                    disabled={actionLoading}
                                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition"
                                    title="Save"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={actionLoading}
                                    className="p-1.5 bg-stone-100 text-stone-600 rounded hover:bg-stone-200 transition"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditClick(booking)}
                                    disabled={actionLoading}
                                    className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(booking.id)}
                                    disabled={actionLoading}
                                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
          </div>
        </main>
      </div>
    </>
  );
}