"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import AdminNavbar from "../../components/AdminNavbar";
import {
    Users, Trash2, Search, Calendar, ChevronRight,
    Mail, Clock, AlertCircle, TrendingUp, Award,
    MapPin, Phone, Star, History
} from "lucide-react";
import Link from "next/link";

interface Booking {
    id: string;
    customer_name: string;
    service: string;
    appointment_date: string;
    created_at: string;
    user_id?: string;
    user_email?: string;
}

interface Customer {
    id: string; // user_id or name if no id
    name: string;
    email: string;
    bookingCount: number;
    bookings: Booking[];
    lastBooking: string;
    preferredService: string;
    totalSpent: number; // Simulated
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from("bookings")
                .select("*")
                .order("appointment_date", { ascending: false });

            if (fetchError) throw fetchError;

            const bookings: Booking[] = data || [];

            const customerMap = new Map<string, Customer>();

            bookings.forEach((booking) => {
                const key = booking.user_id || `name:${booking.customer_name}`;

                if (!customerMap.has(key)) {
                    customerMap.set(key, {
                        id: booking.user_id || booking.customer_name,
                        name: booking.customer_name || "Unknown",
                        email: booking.user_email || "Not registered",
                        bookingCount: 0,
                        bookings: [],
                        lastBooking: booking.appointment_date,
                        preferredService: "None",
                        totalSpent: 0,
                    });
                }

                const customer = customerMap.get(key)!;
                customer.bookings.push(booking);
                customer.bookingCount += 1;

                if (new Date(booking.appointment_date) > new Date(customer.lastBooking)) {
                    customer.lastBooking = booking.appointment_date;
                }

                // Track spending simulation (just for UI)
                const priceMatch = booking.service?.match(/Rs\.\s*(\d+)/);
                if (priceMatch) {
                    customer.totalSpent += parseInt(priceMatch[1]);
                }
            });

            // Determine preferred service
            customerMap.forEach((customer) => {
                const serviceCounts = new Map<string, number>();
                customer.bookings.forEach(b => {
                    serviceCounts.set(b.service, (serviceCounts.get(b.service) || 0) + 1);
                });
                let maxCount = 0;
                let preferred = "None";
                serviceCounts.forEach((count, service) => {
                    if (count > maxCount) {
                        maxCount = count;
                        preferred = service;
                    }
                });
                customer.preferredService = preferred;
            });

            setCustomers(Array.from(customerMap.values()));
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setError(errorMsg);
            console.error("Error fetching customers:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCustomer = async (customer: Customer) => {
        if (!window.confirm(`Are you sure you want to remove ${customer.name} and ALL their ${customer.bookingCount} records? This action is irreversible.`)) {
            return;
        }

        setActionLoading(true);
        try {
            let query = supabase.from("bookings").delete();

            if (typeof customer.id === 'string' && customer.id.startsWith("name:")) {
                query = query.eq("customer_name", customer.name);
            } else if (customer.id === customer.name) {
                query = query.eq("customer_name", customer.name);
            } else {
                query = query.eq("user_id", customer.id);
            }

            const { error: deleteError } = await query;

            if (deleteError) throw deleteError;

            setCustomers(customers.filter(c => c.id !== customer.id));
            if (selectedCustomer?.id === customer.id) {
                setSelectedCustomer(null);
            }
            alert(`Customer repository for ${customer.name} has been cleared.`);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            alert("Failed to delete customer: " + errorMsg);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <AdminNavbar />
            <div className="flex h-screen bg-[#FDFCFB] font-sans text-stone-900 pt-16">

                {/* Admin Sidebar - Desktop */}
                <aside className="w-64 bg-white border-r border-stone-200 shadow-sm flex-col hidden md:flex h-full">
                    <div className="p-6 border-b border-stone-50">
                        <div className="flex items-center gap-2 text-[#C69C6D]">
                            <Award className="w-5 h-5" />
                            <span className="font-serif uppercase tracking-widest text-xs font-bold">Royal Glow Admin</span>
                        </div>
                    </div>
                    <nav className="flex-1 p-4 space-y-2 mt-4">
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 rounded-md font-medium text-sm transition">
                            Dashboard
                        </Link>
                        <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 rounded-md font-medium text-sm transition">
                            Bookings
                        </Link>
                        <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-3 bg-[#FAF7F2] text-[#C69C6D] rounded-md font-semibold text-sm transition">
                            Customers
                        </Link>
                        <Link href="/admin/services" className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 rounded-md font-medium text-sm transition">
                            Services
                        </Link>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">

                        {/* Header */}
                        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-serif text-[#3E2723] flex items-center gap-3 mb-2">
                                    <Users className="w-8 h-8 text-[#C69C6D]" />
                                    Customers
                                </h1>
                                <p className="text-stone-500 text-sm italic">
                                    Cultivating relationships and history for Royal Glow Salon.
                                </p>
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-80">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-stone-300" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/20 focus:border-[#C69C6D] transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-220px)]">

                            {/* Customer List Column */}
                            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full">
                                <div className="p-4 border-b border-stone-100 bg-[#FAF7F2]/50 flex items-center justify-between">
                                    <h3 className="font-bold text-[#3E2723] text-xs uppercase tracking-widest">Directory</h3>
                                    <span className="text-[10px] bg-[#C69C6D] text-white px-2 py-0.5 rounded-full font-bold">{filteredCustomers.length}</span>
                                </div>

                                <div className="overflow-y-auto flex-1 custom-scrollbar">
                                    {loading ? (
                                        <div className="py-20 text-center">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#C69C6D]"></div>
                                        </div>
                                    ) : filteredCustomers.length === 0 ? (
                                        <div className="py-20 text-center px-4">
                                            <p className="text-stone-300 text-sm">No clients match your search.</p>
                                        </div>
                                    ) : (
                                        <div className="">
                                            {filteredCustomers.map((customer) => (
                                                <button
                                                    key={customer.id}
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className={`w-full p-4 text-left border-b border-stone-50 hover:bg-[#FAF7F2]/30 transition flex items-center justify-between group ${selectedCustomer?.id === customer.id ? 'bg-[#FAF7F2] border-l-4 border-l-[#C69C6D]' : 'border-l-4 border-l-transparent'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${selectedCustomer?.id === customer.id ? 'bg-[#C69C6D] text-white' : 'bg-stone-50 text-[#C69C6D] border border-stone-100'}`}>
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-stone-800 text-sm truncate">{customer.name}</div>
                                                            <div className="text-[10px] text-stone-400 uppercase tracking-tighter">
                                                                {customer.bookingCount} Visit{customer.bookingCount !== 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detail View Column */}
                            <div className="lg:col-span-3 h-full">
                                {selectedCustomer ? (
                                    <div className="h-full flex flex-col gap-6">
                                        {/* Hero Profile Card */}
                                        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 relative overflow-hidden shrink-0">
                                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C69C6D]/5 rounded-full blur-3xl"></div>

                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 h-24 rounded-3xl bg-stone-900 shadow-2xl flex items-center justify-center text-[#C69C6D] text-4xl font-serif relative">
                                                        {selectedCustomer.name.charAt(0).toUpperCase()}
                                                        <div className="absolute -bottom-2 -right-2 bg-[#C69C6D] p-1.5 rounded-xl border-4 border-white">
                                                            <Award className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h2 className="text-3xl font-serif text-[#3E2723]">{selectedCustomer.name}</h2>
                                                            <span className="bg-stone-100 text-stone-600 text-[10px] font-bold uppercase py-0.5 px-2 rounded tracking-widest">Client</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 text-stone-400 text-sm">
                                                            <p className="flex items-center gap-1.5">
                                                                <Mail className="w-4 h-4 text-[#C69C6D]" /> {selectedCustomer.email}
                                                            </p>
                                                            <p className="flex items-center gap-1.5">
                                                                <TrendingUp className="w-4 h-4 text-[#C69C6D]" /> Member since {new Date(selectedCustomer.bookings[selectedCustomer.bookings.length - 1].created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleDeleteCustomer(selectedCustomer)}
                                                        disabled={actionLoading}
                                                        className="group flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-sm font-bold transition-all duration-300 border border-red-100"
                                                    >
                                                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition" />
                                                        Clear Data
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                                                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-100">
                                                    <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-1 font-bold">Total Visits</div>
                                                    <div className="text-2xl font-serif text-[#3E2723]">{selectedCustomer.bookingCount}</div>
                                                </div>
                                                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-100">
                                                    <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-1 font-bold">Category</div>
                                                    <div className="text-2xl font-serif text-[#C69C6D]">{selectedCustomer.bookingCount > 5 ? 'Elite' : selectedCustomer.bookingCount > 2 ? 'Premier' : 'Standard'}</div>
                                                </div>
                                                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-100">
                                                    <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-1 font-bold">Preferred Service</div>
                                                    <div className="text-sm font-bold text-stone-800 line-clamp-1">{selectedCustomer.preferredService.split(' min')[0]}</div>
                                                </div>
                                                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-100">
                                                    <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-1 font-bold">Est. Revenue</div>
                                                    <div className="text-2xl font-serif text-stone-800">Rs. {selectedCustomer.totalSpent.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking History Table */}
                                        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 flex-1 flex flex-col overflow-hidden min-h-0">
                                            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-stone-900 p-2 rounded-lg">
                                                        <History className="w-5 h-5 text-[#C69C6D]" />
                                                    </div>
                                                    <h3 className="font-serif text-lg text-[#3E2723]">Appointment Chronology</h3>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                                <div className="p-0">
                                                    {selectedCustomer.bookings.map((booking, idx) => (
                                                        <div
                                                            key={booking.id}
                                                            className={`group p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2]/20 transition-all duration-300 ${idx !== selectedCustomer.bookings.length - 1 ? 'border-b border-stone-50' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-6">
                                                                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-stone-100 shadow-sm group-hover:border-[#C69C6D]/30 transition group-hover:scale-105 duration-500">
                                                                    <span className="text-[10px] uppercase font-black text-[#C69C6D] tracking-tighter">
                                                                        {new Date(booking.appointment_date).toLocaleString('en-US', { month: 'short' })}
                                                                    </span>
                                                                    <span className="text-xl font-serif text-stone-900 leading-none">
                                                                        {new Date(booking.appointment_date).getDate()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-stone-800 mb-1 group-hover:text-[#C69C6D] transition">{booking.service}</h4>
                                                                    <div className="flex items-center gap-3 text-xs text-stone-400 font-medium tracking-wide">
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" /> {new Date(booking.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                        <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                                                                        <span>Ref: {String(booking.id || "").slice(0, 8).toUpperCase()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-[0.1em] border shadow-sm ${new Date(booking.appointment_date) > new Date() ? 'bg-green-50 text-green-700 border-green-100' : 'bg-stone-50 text-stone-400 border-stone-100'}`}>
                                                                    {new Date(booking.appointment_date) > new Date() ? 'Reserved' : 'Archived'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-12 text-center h-full flex flex-col items-center justify-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-full h-full bg-[#FAF7F2]/30 opacity-50 z-0"></div>
                                        <div className="relative z-10">
                                            <div className="w-24 h-24 bg-white shadow-xl rounded-full flex items-center justify-center mx-auto mb-8 border border-stone-50">
                                                <Users className="w-10 h-10 text-stone-200 animate-pulse" />
                                            </div>
                                            <h3 className="text-3xl font-serif text-[#3E2723] mb-4">Select a Client</h3>
                                            <p className="text-stone-400 text-sm max-w-xs mx-auto leading-relaxed italic">
                                                "Elegance is the only beauty that never fades." — Select a client to review their personal journey with Royal Glow.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>
                </main>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E1DA;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C69C6D;
        }
      `}</style>
        </>
    );
}
