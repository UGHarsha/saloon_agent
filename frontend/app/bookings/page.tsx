"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";

interface Booking {
  id: string;
  customer_name: string;
  service: string;
  appointment_date: string;
  created_at: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      fetchBookings(supabase);
    };
    
    checkAuthAndFetchInfo();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const fetchBookings = async (supabase: SupabaseClient) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .order("appointment_date", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setBookings(data || []);
      }
    } catch (err) {
      setError("Failed to fetch bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#3E2723] pt-32 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">Your Itinerary</p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#3E2723] mb-6">Appointments</h1>
          <div className="w-16 h-px bg-stone-300 mx-auto"></div>
        </div>

        {loading && (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#C69C6D]"></div>
            <p className="text-stone-500 mt-4 text-sm tracking-widest uppercase">Loading schedule...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50/50 border border-red-100 text-red-800 px-6 py-4 text-center text-sm tracking-widest uppercase">
            {error}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-20 border border-stone-200 bg-white shadow-sm">
            <div className="text-4xl mb-6 opacity-50">�</div>
            <p className="text-stone-500 text-sm tracking-widest uppercase mb-6">No appointments yet</p>
            <Link
              href="/"
              className="inline-block border border-[#C69C6D] text-[#C69C6D] hover:bg-[#C69C6D] hover:text-white px-8 py-3 tracking-widest uppercase text-xs font-semibold transition-colors"
            >
              Book Now
            </Link>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white shadow-sm p-8 border border-stone-100 relative group hover:border-[#C69C6D] transition-colors"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C69C6D] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div>
                    <h3 className="text-2xl font-serif text-[#3E2723] mb-1">
                      {booking.customer_name}
                    </h3>
                    <p className="text-[#C69C6D] font-semibold text-sm tracking-widest uppercase">
                      {booking.service}
                    </p>
                  </div>

                  <div className="flex gap-8 text-sm md:text-right border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-8">
                    <div>
                      <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em] mb-1 font-semibold">Date</p>
                      <p className="text-[#3E2723] font-serif text-lg whitespace-nowrap">
                        {new Date(booking.appointment_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em] mb-1 font-semibold">
                        Booked At
                      </p>
                      <p className="text-[#3E2723] font-serif text-lg whitespace-nowrap">
                        {new Date(booking.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-block text-[#3E2723] text-xs tracking-widest uppercase hover:text-[#C69C6D] transition-colors border-b border-[#3E2723] hover:border-[#C69C6D] pb-1"
          >
            ← Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
