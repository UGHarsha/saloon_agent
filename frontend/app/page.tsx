"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../utils/supabase";

export default function Home() {
  const [bookingView, setBookingView] = useState("none");
  const [manualForm, setManualForm] = useState({ name: "", service: "Haircut & Styling", date: "", time: "10:00 AM" });
  const [manualLoading, setManualLoading] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);

  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    setTimeout(() => {
      setManualLoading(false);
      setManualSuccess(true);
    }, 1500);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setChatLog((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        { role: "bella", text: "I can help with that! Let me check the schedule." }
      ]);
      setLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans text-[#3E2723]">
      
      {/* Booking Modal */}
      {bookingView !== "none" && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl bg-white shadow-2xl flex flex-col h-[90vh] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 bg-white shrink-0">
              <div>
                <h1 className="text-2xl font-serif text-[#3E2723] tracking-wide">Book Your Visit</h1>
                <p className="text-stone-500 text-xs mt-1 tracking-wide uppercase">Select an option below</p>
              </div>
              <button
                onClick={() => setBookingView("none")}
                className="text-xs uppercase tracking-widest text-[#C69C6D] hover:text-[#3E2723] transition-colors self-start sm:self-auto border border-[#C69C6D] hover:border-[#3E2723] px-4 py-2 rounded-full"
              >
                Close
              </button>
            </div>

            {/* Booking View Tabs */}
            <div className="flex bg-stone-50/50 p-2 gap-2 border-b border-stone-100 shrink-0">
              <button
                onClick={() => setBookingView("manual")}
                className={`flex-1 py-3 text-xs font-semibold tracking-widest uppercase transition-all rounded-sm ${
                  bookingView === "manual" 
                    ? "bg-[#C69C6D] text-white shadow-md mx-1" 
                    : "bg-transparent text-stone-500 hover:text-stone-800 hover:bg-white"
                }`}
              >
                Manual Booking
              </button>
              <button
                onClick={() => setBookingView("ai")}
                className={`flex-1 py-3 text-xs font-semibold tracking-widest uppercase transition-all rounded-sm ${
                  bookingView === "ai" 
                    ? "bg-[#C69C6D] text-white shadow-md mx-1" 
                    : "bg-transparent text-stone-500 hover:text-stone-800 hover:bg-white"
                }`}
              >
                AI Assistant
              </button>
            </div>

            {bookingView === "manual" && (
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                {manualSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn">
                    <h2 className="text-2xl font-serif text-[#3E2723] mb-2">Booking Confirmed</h2>
                    <p className="text-stone-500 text-sm max-w-sm mb-8">
                      Your appointment has been successfully scheduled. We look forward to seeing you.
                    </p>
                    <button
                      onClick={() => {
                        setManualSuccess(false);
                        setBookingView("none");
                      }}
                      className="bg-[#C69C6D] text-white px-8 py-3 tracking-widest uppercase text-sm font-medium hover:bg-[#B38759] transition-colors"
                    >
                      Return Home
                    </button>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto">
                    <form onSubmit={handleManualSubmit} className="space-y-8 bg-white p-8 md:p-12 shadow-sm border border-stone-100 relative">
                      {/* Name input */}
                      <div>
                        <label className="block text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">Full Name</label>
                        <input type="text" required value={manualForm.name} onChange={(e) => setManualForm({...manualForm, name: e.target.value})} className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-3 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors font-serif placeholder-stone-300" placeholder="Jane Doe"/>
                      </div>
                      
                      {/* Service select */}
                      <div>
                        <label className="block text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">Service</label>
                        <select value={manualForm.service} onChange={(e) => setManualForm({...manualForm, service: e.target.value})} className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-3 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors font-serif appearance-none">
                          <option>Haircut & Styling</option>
                          <option>Coloring</option>
                        </select>
                      </div>

                      <button type="submit" disabled={manualLoading} className="w-full bg-[#C69C6D] text-white py-4 mt-8 uppercase tracking-widest text-sm font-semibold hover:bg-[#B38759] transition-colors disabled:opacity-50">
                        {manualLoading ? "Processing..." : "Confirm Booking"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
            
            {bookingView === "ai" && (
              <div className="flex-1 flex flex-col h-full bg-stone-50 relative">
                <div className="flex-1 p-6">AI Assistant Coming Soon...</div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative text-white py-32 md:py-48 flex items-center justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/salon.jpg"
            alt="Luxury Salon Interior"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
          <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-6 font-semibold">Discover Luxury</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-tight tracking-tight">
            Refined <br/> Elegance
          </h1>
          <p className="text-stone-50 max-w-2xl mx-auto mb-12 text-base md:text-lg font-light leading-relaxed">
            Experience the pinnacle of modern styling and personalized beauty at our salon, inspired by the excellence of noelines.com.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setBookingView("manual")}
              className="bg-[#C69C6D] text-white px-8 py-4 tracking-[0.15em] uppercase text-sm font-medium hover:bg-[#B38759] transition-all duration-300 shadow-lg"
            >
              Book Appointment
            </button>
            <button
              onClick={() => setBookingView("ai")}
              className="text-white px-8 py-4 tracking-[0.15em] uppercase text-sm font-medium border border-white/50 backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              Consult AI
            </button>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-[#FDFBF7] py-24 px-6 md:px-12 text-center text-[#3E2723]">
         <h2 className="text-3xl font-serif mb-6">Our Philosophy</h2>
         <p className="max-w-3xl mx-auto mb-10 leading-relaxed text-stone-600">
           We believe that every individual has a unique essence. Our goal is to bring that forth through precise techniques, premium products, and an environment that exudes serenity. Inspired by the best in the industry, we infuse a touch of gold and warmth into every aspect of your visit.
         </p>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#3E2723] text-stone-400 py-12 px-6">
        <div className="max-w-6xl mx-auto border-t border-stone-800 pt-8 text-center text-xs">
          <p>© {new Date().getFullYear()} Our Salon. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
