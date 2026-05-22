"use client";
import { useState, useEffect, FormEvent, KeyboardEvent, Suspense, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../utils/supabase";
import Reviews from "./components/Reviews";
import { motion, AnimatePresence } from "framer-motion";

const aboutFeatures = [
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
    title: "Intelligent Concierge",
    description: "Experience effortless scheduling with Bella, our AI concierge designed to curate your perfect visit and style narrative.",
  },
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    title: "Styling Previews",
    description: "Visualize your transformation with our AR-powered virtual try-on, allowing you to explore new hues and cuts with confidence.",
  },
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    title: "Bespoke Scheduling",
    description: "Sophisticated real-time availability tailored to your rhythm. Secure your moment with precision and ease.",
  },
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>),
    title: "Curated Apothecary",
    description: "We utilize an exclusive selection of global professional products, ensuring every treatment is an infusion of health and shine.",
  },
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
    title: "Artisanal Crafters",
    description: "Our professionals are masters of both trend and tradition, dedicated to the meticulous craft of personalized beauty.",
  },
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>),
    title: "Signature Occasions",
    description: "From bridal elegance to gala-ready transformations, we specialize in making your significant moments unforgettable.",
  },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingView, setBookingView] = useState<"none" | "ai" | "manual">("none");
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const heroImages = ["/1.jpg", "/2.jpg", "/3.jpg"];

  // Dynamic Content States
  const [servicesData, setServicesData] = useState<{ id?: number, name: string, category: string, price: string, duration: number }[]>([]);
  const [lookbookData, setLookbookData] = useState<{ id?: number, src: string, alt?: string }[]>([]);

  useEffect(() => {
    async function fetchDynamicData() {
      try {
        const [servRes, lookRes] = await Promise.all([
          fetch("http://localhost:5000/api/services"),
          fetch("http://localhost:5000/api/lookbook")
        ]);
        if (servRes.ok) {
          const sData = await servRes.json();
          if (Array.isArray(sData)) setServicesData(sData);
        }
        if (lookRes.ok) {
          const lData = await lookRes.json();
          if (Array.isArray(lData)) setLookbookData(lData);
        }
      } catch (err) {
        console.error("Error fetching dynamic data:", err);
      }
    }
    fetchDynamicData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Manual booking states
  const [manualForm, setManualForm] = useState({
    name: "",
    category: "men - hair",
    service: "",
    date: "",
    time: "10:00 AM",
  });

  useEffect(() => {
    if (servicesData.length > 0 && !manualForm.service) { // set initial service when loaded
      const initialCatSvc = servicesData.filter(s => s.category?.toLowerCase().trim() === manualForm.category?.toLowerCase().trim())[0];
      if (initialCatSvc) {
        setManualForm(prev => ({ ...prev, service: `${initialCatSvc.name} ${initialCatSvc.duration} min (Rs. ${initialCatSvc.price})` }));
      }
    }
  }, [servicesData, manualForm.category, manualForm.service]);

  const [manualLoading, setManualLoading] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);

  const [bookingsData, setBookingsData] = useState<{ start: number, end: number }[]>([]);

  useEffect(() => {
    async function fetchBookedTimes() {
      if (!manualForm.date) {
        setBookingsData([]);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/booked-slots?date=${manualForm.date}`);
        if (!response.ok) throw new Error("Failed to fetch slots");
        const data = await response.json();

        if (data) {
          const bookingsList = data.map((b: { appointment_date: string, service?: string }) => {
            const date = new Date(b.appointment_date);
            const startMin = date.getHours() * 60 + date.getMinutes();
            const p = b.service ? b.service.match(/(\d+)\s*min/) : null;
            const dur = p ? parseInt(p[1]) : 60;
            return { start: startMin, end: startMin + dur };
          });
          setBookingsData(bookingsList);
        }
      } catch (err) {
        console.error("Error fetching booked times:", err);
      }
    }
    fetchBookedTimes();
  }, [manualForm.date, manualSuccess]);

  const availableTimes: string[] = [];
  if (manualForm.date) {
    const d = new Date(manualForm.date);
    if (d.getDay() !== 0) { // Not Sunday
      const durationMin = parseInt(manualForm.service.match(/(\d+)\s*min/)?.[1] || "60");
      const shopOpenMin = 9 * 60; // 9:00 AM
      const shopCloseMin = 20 * 60; // 8:00 PM

      for (let min = shopOpenMin; min + durationMin <= shopCloseMin; min += 30) {
        const newStart = min;
        const newEnd = min + durationMin;
        const isOverlapping = bookingsData.some(b => Math.max(newStart, b.start) < Math.min(newEnd, b.end));

        if (!isOverlapping) {
          const hours = Math.floor(min / 60);
          const minutes = min % 60;
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const h12 = hours % 12 || 12;
          const minStr = minutes.toString().padStart(2, '0');
          availableTimes.push(`${h12}:${minStr} ${ampm}`);
        }
      }
    }
  }

  const availableTimesJoined = availableTimes.join(',');
  useEffect(() => {
    if (availableTimes.length > 0 && !availableTimes.includes(manualForm.time)) {
      setManualForm(prev => ({ ...prev, time: availableTimes[0] }));
    } else if (availableTimes.length === 0 && manualForm.time !== "") {
      setManualForm(prev => ({ ...prev, time: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTimesJoined]);

  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog, loading]);

  useEffect(() => {
    const bookParam = searchParams.get("book");
    if (bookParam === "true" || bookParam === "manual" || bookParam === "ai") {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setBookingView(bookParam === "ai" ? "ai" : "manual");
        } else {
          router.push("/login");
        }
      };
      checkAuth();
    }
  }, [searchParams, router]);

  const handleBookingAction = async (view: "ai" | "manual") => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setBookingView(view);
    setManualSuccess(false); // Reset success state when opening the form
  };

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    setManualSuccess(false);

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      alert("Please login first");
      setManualLoading(false);
      return;
    }

    // Combine date and time
    const convertTimeToLocalTimeStr = (timeStr: string) => {
      if (!timeStr) return "12:00:00";
      const [time, modifier] = timeStr.split(' ');
      let hours = time.split(':')[0];
      const minutes = time.split(':')[1];
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
      return `${hours.padStart(2, '0')}:${minutes}:00`;
    };
    const dateTimeString = `${manualForm.date}T${convertTimeToLocalTimeStr(manualForm.time)}`;

    try {
      const appointmentDate = new Date(dateTimeString).toISOString();

      const response = await fetch("http://localhost:5000/api/book-manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: manualForm.name,
          service: manualForm.service,
          date: appointmentDate,
          userId: session.user.id,
          userEmail: session.user.email,
          accessToken: session.access_token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      setManualSuccess(true);
      setManualForm({ ...manualForm, name: "" }); // Reset some fields
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Booking error:", errorMessage);
      alert(`Booking failed: ${errorMessage}`);
    } finally {
      setManualLoading(false);
    }
  };

  const sendMessage = async (textToSubmit?: string | React.MouseEvent) => {
    const text = typeof textToSubmit === 'string' ? textToSubmit : input;
    if (!text.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      setChatLog((prev) => [...prev, { role: "bella", text: "Please login first to book an appointment." }]);
      return;
    }

    const userMsg = { role: "user", text: text };
    setChatLog([...chatLog, userMsg]);
    if (typeof textToSubmit !== 'string') setInput("");
    else setInput(""); // Clear input either way
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: chatLog,
          userId: session.user.id,
          userEmail: session.user.email,
          accessToken: session.access_token,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const serverMsg = (errorData.error || "Failed to get response").replace(/^Error:\s*/i, "");
        setChatLog((prev) => [...prev, { role: "bella", text: serverMsg }]);
        return;
      }

      const data = await response.json();

      if (data.text) {
        setChatLog((prev) => [...prev, { role: "bella", text: data.text }]);
      } else if (data.error) {
        setChatLog((prev) => [...prev, { role: "bella", text: data.error }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setChatLog((prev) => [...prev, {
        role: "bella",
        text: "Sorry, I encountered an error. Please make sure your API key is configured."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Close booking modal on Escape for convenience
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setBookingView("none");
        if (searchParams.get("book") === "true") router.replace("/");
      }
    };
    if (bookingView !== "none") window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookingView, searchParams, router]);

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans text-[#3E2723]">

      {/* Booking Modal - Complete Redesign */}
      {bookingView !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-backdrop"
          style={{ background: 'rgba(26, 18, 16, 0.6)', backdropFilter: 'blur(20px)' }}
        >
          <div className="w-full max-w-6xl h-[92vh] md:h-[85vh] overflow-hidden flex flex-col md:flex-row rounded-[28px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] animate-modal-slide-up border border-white/10">

            {/* Left: Cinematic Image Panel */}
            <div className="hidden md:flex w-[45%] relative overflow-hidden">
              <Image src="/salon-interior.png" alt="Royal Glow Salon" fill className="object-cover" />
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-[1]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[1]" />
              {/* Decorative blob */}
              <div className="absolute top-20 -left-10 w-40 h-40 bg-[#C69C6D]/20 rounded-full blur-[80px] z-[2] animate-blob" />

              {/* Content overlay */}
              <div className="absolute inset-0 z-[3] flex flex-col justify-between p-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C69C6D] animate-pulse" />
                    <span className="text-[10px] tracking-[0.25em] uppercase text-white/80 font-semibold">Now Booking</span>
                  </div>
                  <h2 className="text-4xl font-serif text-white leading-tight mb-4">
                    Reserve Your<br /><span className="gradient-text italic">Transformation</span>
                  </h2>
                  <p className="text-white/50 text-sm font-light leading-relaxed max-w-[280px]">
                    Choose AI-powered scheduling or book manually — your luxury experience starts here.
                  </p>
                </div>

                {/* Info badges */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Duration</p>
                      <p className="text-white/80 text-sm">30 – 180 Minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Location</p>
                      <p className="text-white/80 text-sm">Beach Road, Matara</p>
                    </div>
                  </div>
                  <div className="pt-5 border-t border-white/10">
                    <p className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-bold">Need Help? <span className="text-[#C69C6D]">+94 41 123 4567</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form/Chat Panel */}
            <div className="flex-1 flex flex-col bg-[#FDFBF7] relative overflow-hidden">
              {/* Close Button */}
              <button
                onClick={() => {
                  setBookingView("none");
                  if (searchParams.get("book") === "true" || searchParams.get("book") === "ai") router.replace("/");
                }}
                className="absolute top-5 right-5 z-30 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-stone-200 flex items-center justify-center text-stone-400 hover:text-[#3E2723] hover:border-[#C69C6D] hover:shadow-lg transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              {/* Floating Pill Tabs */}
              <div className="px-6 md:px-10 pt-6 pb-2">
                <div className="inline-flex p-1.5 rounded-full bg-white border border-stone-200/80 shadow-sm">
                  <button onClick={() => setBookingView("manual")}
                    className={`px-6 py-3 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 flex items-center gap-2 ${bookingView === "manual" ? "bg-[#3E2723] text-white shadow-lg" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Book Manually
                  </button>
                  <button onClick={() => setBookingView("ai")}
                    className={`px-6 py-3 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 flex items-center gap-2 ${bookingView === "ai" ? "bg-[#3E2723] text-white shadow-lg" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    <span className="text-sm">✨</span>
                    AI Assistant
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {/* === MANUAL BOOKING VIEW === */}
                {bookingView === "manual" && (
                  <div className="p-6 md:p-10 animate-fadeIn">
                    {manualSuccess ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16 animate-scale-in">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(52,211,153,0.3)] animate-success-check">
                          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-3xl font-serif text-[#3E2723] mb-3">Reservation <span className="gradient-text">Confirmed</span></h3>
                        <p className="text-stone-400 text-sm max-w-sm mb-10 leading-relaxed">
                          Your appointment has been booked. We&apos;ve sent a confirmation to your email.
                        </p>
                        <button onClick={() => { setBookingView("none"); if (searchParams.get("book") === "true") router.replace("/"); }}
                          className="bg-[#3E2723] text-white px-10 py-4 rounded-full uppercase tracking-[0.2em] text-xs font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >Return Home</button>
                      </div>
                    ) : (
                      <form onSubmit={handleManualSubmit} className="max-w-xl mx-auto space-y-6 animate-slide-in-right">
                        {/* Form header */}
                        <div className="mb-8">
                          <h3 className="text-2xl font-serif text-[#3E2723] mb-2">Schedule Your <span className="gradient-text">Visit</span></h3>
                          <p className="text-stone-400 text-sm">Fill in your details and we&apos;ll secure your perfect time slot.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold flex items-center gap-2">
                              <svg className="w-3 h-3 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              Full Name
                            </label>
                            <input type="text" required value={manualForm.name}
                              onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                              className="booking-input font-serif" placeholder="Your full name" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold flex items-center gap-2">
                              <svg className="w-3 h-3 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                              Category
                            </label>
                            <div className="relative">
                              <select value={manualForm.category}
                                onChange={(e) => {
                                  const cat = e.target.value;
                                  const firstSvc = servicesData.filter(s => s.category?.toLowerCase() === cat.toLowerCase())[0];
                                  setManualForm({ ...manualForm, category: cat, service: firstSvc ? `${firstSvc.name} ${firstSvc.duration} min (Rs. ${firstSvc.price})` : '' });
                                }}
                                className="booking-input font-serif appearance-none cursor-pointer pr-12"
                              >
                                <optgroup label="Men's Grooming">
                                  <option value="men - face">Face</option>
                                  <option value="men - hair">Hair</option>
                                  <option value="men - bridal full">Bridal Full</option>
                                  <option value="men">Other / General</option>
                                </optgroup>
                                <optgroup label="Women's Styling">
                                  <option value="women - face">Face</option>
                                  <option value="women - hair">Hair</option>
                                  <option value="women - nails">Nails</option>
                                  <option value="women - bridal full">Bridal Full</option>
                                  <option value="women">Other / General</option>
                                </optgroup>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#C69C6D]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold flex items-center gap-2">
                            <svg className="w-3 h-3 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            Select Treatment
                          </label>
                          <div className="relative">
                            <select value={manualForm.service}
                              onChange={(e) => setManualForm({ ...manualForm, service: e.target.value })}
                              className="booking-input font-serif appearance-none cursor-pointer pr-12"
                            >
                              {servicesData.filter(s => s.category?.toLowerCase().trim() === manualForm.category?.toLowerCase().trim()).map(s => (
                                <option key={s.id} value={`${s.name} ${s.duration} min (Rs. ${s.price})`}>
                                  {s.name} — {s.duration} min (Rs. {s.price})
                                </option>
                              ))}
                              {servicesData.filter(s => s.category?.toLowerCase().trim() === manualForm.category?.toLowerCase().trim()).length === 0 && (
                                <option disabled>{servicesData.length === 0 ? "Loading services from server..." : "No services available"}</option>
                              )}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#C69C6D]">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold flex items-center gap-2">
                              <svg className="w-3 h-3 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              Date
                            </label>
                            <input type="date" min={new Date().toLocaleDateString('en-CA')} required
                              value={manualForm.date} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                              className="booking-input font-serif" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold flex items-center gap-2">
                              <svg className="w-3 h-3 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Preferred Time
                            </label>
                            <div className="relative">
                              <select value={manualForm.time}
                                onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })}
                                className="booking-input font-serif appearance-none cursor-pointer pr-12"
                              >
                                {availableTimes.length > 0 ? (
                                  availableTimes.map(time => (<option key={time} value={time}>{time}</option>))
                                ) : (
                                  <option value="" disabled>No slots available</option>
                                )}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#C69C6D]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button type="submit" disabled={manualLoading || !manualForm.time}
                          className="w-full mt-4 bg-gradient-to-r from-[#C69C6D] to-[#B38759] text-white py-5 rounded-2xl uppercase tracking-[0.25em] text-xs font-black transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_50px_rgba(198,156,109,0.35)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                          {manualLoading ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                          ) : !manualForm.time ? "No Slots Available" : (
                            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Confirm Reservation</>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* === AI CHAT VIEW === */}
                {bookingView === "ai" && (
                  <div className="h-full flex flex-col overflow-hidden animate-fadeIn">
                    {/* Mobile header */}
                    <div className="md:hidden p-4 bg-gradient-to-r from-[#1A1210] to-[#2A1E1A] text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C69C6D] to-[#A0735B] rounded-2xl flex items-center justify-center text-lg shadow-lg">✨</div>
                      <div>
                        <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#C69C6D]">AI Concierge</p>
                        <p className="text-sm font-serif">Bella</p>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth bg-gradient-to-b from-[#FDFBF7] to-white">
                      {chatLog.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-8 animate-scale-in">
                          {/* Bella avatar */}
                          <div className="relative mb-8">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C69C6D] to-[#A0735B] flex items-center justify-center text-3xl shadow-[0_0_40px_rgba(198,156,109,0.25)] rotate-3">✨</div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-[#FDFBF7] animate-pulse" />
                          </div>
                          <h3 className="text-2xl font-serif text-[#3E2723] mb-2">Hello, I&apos;m <span className="gradient-text">Bella</span></h3>
                          <p className="text-stone-400 text-sm max-w-xs leading-relaxed mb-10">
                            Your luxury concierge. I can book visits, recommend styles, or answer questions.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                            {[
                              { label: "Quick Booking", text: "Book a haircut for tomorrow morning", icon: "📅" },
                              { label: "Explore Services", text: "What services do you offer for women?", icon: "💇" },
                            ].map((item, idx) => (
                              <button key={idx} onClick={() => sendMessage(item.text)}
                                className="p-5 text-left bg-white rounded-2xl border border-stone-100 hover:border-[#C69C6D]/30 hover:shadow-lg transition-all duration-300 group card-3d"
                              >
                                <div className="text-xl mb-3">{item.icon}</div>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#C69C6D] font-bold mb-1">{item.label}</p>
                                <p className="text-xs text-stone-500 font-serif group-hover:text-[#3E2723] transition-colors leading-relaxed">&quot;{item.text}&quot;</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        chatLog.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-chat-bubble`} style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                              {msg.role === "bella" && (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C69C6D] to-[#A0735B] flex items-center justify-center text-white text-xs shrink-0 mt-1 shadow-md">✨</div>
                              )}
                              <div className={`px-5 py-4 text-sm whitespace-pre-wrap leading-relaxed ${msg.role === "user"
                                ? "bg-gradient-to-br from-[#3E2723] to-[#2A1E1A] text-white rounded-[20px] rounded-tr-md shadow-lg"
                                : "bg-white text-[#3E2723] rounded-[20px] rounded-tl-md border border-stone-100 shadow-sm"
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {loading && (
                        <div className="flex justify-start animate-chat-bubble">
                          <div className="flex gap-3 max-w-[80%]">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C69C6D] to-[#A0735B] flex items-center justify-center text-white text-xs shrink-0 mt-1 shadow-md animate-pulse">✨</div>
                            <div className="bg-white px-5 py-4 rounded-[20px] rounded-tl-md border border-stone-100 shadow-sm">
                              <div className="flex gap-1.5 items-center h-5">
                                <div className="w-2 h-2 bg-[#C69C6D] rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-[#C69C6D] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-[#C69C6D] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-5 md:p-6 bg-white/80 backdrop-blur-xl border-t border-stone-100">
                      <div className="max-w-2xl mx-auto flex items-center gap-3 bg-[#FDFBF7] border border-stone-200 rounded-2xl p-2 pl-5 focus-within:border-[#C69C6D] focus-within:shadow-[0_0_0_4px_rgba(198,156,109,0.1)] transition-all duration-300">
                        <input className="flex-1 bg-transparent border-none focus:outline-none py-3 text-stone-800 placeholder-stone-400 text-sm font-serif"
                          value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress}
                          placeholder="Tell Bella what you're looking for..." disabled={loading}
                        />
                        <button onClick={sendMessage} disabled={loading || !input.trim()}
                          className="bg-gradient-to-r from-[#C69C6D] to-[#A0735B] disabled:from-stone-300 disabled:to-stone-300 text-white rounded-xl p-3.5 transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center shrink-0"
                          aria-label="Send message"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                      </div>
                      <p className="text-center text-[9px] text-stone-400 mt-3 uppercase tracking-[0.12em]">Bella AI can schedule, reschedule and answer questions about Royal Glow Salon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}



      {/* Hero Section */}
      <section className="relative text-white min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            {heroImages.map((src, idx) => (
              idx === currentHeroSlide && (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, scale: 1.15 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image src={src} alt={`Luxury Salon ${idx + 1}`} fill priority sizes="100vw" className="object-cover object-center" />
                </motion.div>
              )
            ))}
          </AnimatePresence>
          {/* Gradient overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
          {/* Accent gradient blobs */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#C69C6D]/10 rounded-full blur-[120px] z-10 animate-blob" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-[#C69C6D]/8 rounded-full blur-[100px] z-10 animate-blob" style={{ animationDelay: "4s" }} />
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroImages.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentHeroSlide(idx)} className={`h-1 rounded-full transition-all duration-500 ${idx === currentHeroSlide ? 'w-10 bg-[#C69C6D]' : 'w-4 bg-white/30 hover:bg-white/50'}`} />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-5xl mx-auto text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-[#C69C6D] animate-pulse" />
            <span className="text-[11px] tracking-[0.3em] uppercase font-medium text-stone-300">Matara&apos;s Finest Destination</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif mb-8 leading-[0.9] tracking-tight"
          >
            Refining <br />
            <span className="italic gradient-text">Elegance</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}
            className="text-stone-300 max-w-lg mx-auto mb-14 text-sm md:text-base font-light leading-relaxed"
          >
            A sanctuary of sophisticated beauty. Timeless artistry meets modern innovation to redefine your unique essence.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button onClick={() => handleBookingAction("manual")}
              className="relative px-10 py-5 bg-[#C69C6D] text-white tracking-[0.2em] uppercase text-xs font-bold rounded-full hover:shadow-[0_0_40px_rgba(198,156,109,0.4)] transition-all duration-500 hover:scale-105 active:scale-95"
            >
              Reserve Your Visit
            </button>
            <button onClick={() => handleBookingAction("ai")}
              className="group px-10 py-5 tracking-[0.2em] uppercase text-xs font-bold rounded-full border border-white/20 backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-500 flex items-center gap-3"
            >
              <span className="text-white">Consult Bella AI</span>
              <svg className="w-4 h-4 text-[#C69C6D] group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative bg-[#1A1210] py-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C69C6D]/5 via-transparent to-[#C69C6D]/5" />
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 relative">
          {[
            { number: "5+", label: "Years Experience", icon: "✦" },
            { number: "2000+", label: "Happy Clients", icon: "♡" },
            { number: "15+", label: "Expert Stylists", icon: "★" },
            { number: "50+", label: "Services Offered", icon: "◆" },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group py-10 px-6 text-center relative hover:bg-white/[0.03] transition-colors duration-500"
            >
              {idx > 0 && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gradient-to-b from-transparent via-[#C69C6D]/30 to-transparent hidden md:block" />}
              <p className="text-xs text-[#C69C6D]/60 mb-2">{stat.icon}</p>
              <p className="text-3xl md:text-4xl font-serif gradient-text mb-2 group-hover:scale-110 transition-transform duration-500">{stat.number}</p>
              <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>



      {/* Story Section */}
      <section id="about" className="py-24 md:py-32 px-6 md:px-12 bg-[#FDFBF7] overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C69C6D]/10 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C69C6D] animate-pulse" />
              <span className="text-[#C69C6D] tracking-[0.25em] uppercase text-[10px] font-bold">The Royal Philosophy</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-serif mb-10 leading-[1.1] text-[#3E2723]">
              The Intersection of <br />
              <span className="gradient-text italic">Artistry & Wellness</span>
            </h2>

            <div className="space-y-6 text-stone-500 leading-relaxed font-light text-base md:text-lg max-w-xl">
              <p>
                Founded in <strong className="text-[#3E2723] font-medium">2018</strong>, Royal Glow Salon was envisioned as more than just a place for grooming. It was designed as a sanctuary where the hustle of Matara fades into the background, and your transformation takes center stage.
              </p>
              <p>
                Our philosophy is simple: <span className="italic font-serif text-[#3E2723]">True beauty is an expression of inner confidence.</span> We combine centuries-old techniques with modern innovation, ensuring that every visit is a bespoke experience tailored to your unique narrative.
              </p>
            </div>

            <div className="mt-12 pt-10 border-t border-stone-200/60 flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-4">Founder & Creative Director</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-stone-200 overflow-hidden relative shadow-inner">
                    <Image src="/customers/1778774396808-672056452.jpg" alt="Director" fill sizes="56px" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-lg font-serif text-[#3E2723]">Sarah Jenkins</p>
                    <p className="text-xs text-[#C69C6D] font-medium">Master Hair Stylist</p>
                  </div>
                </div>
              </div>

              <div className="h-12 w-px bg-stone-200 hidden sm:block" />

              <div>
                <p className="text-[11px] text-stone-400 font-medium">Trusted by <span className="text-[#3E2723] font-bold">2,500+</span> individuals in Matara</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[600px] md:h-[700px] group"
          >
            {/* Background elements */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#C69C6D]/10 rounded-full blur-[80px] animate-blob" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#3E2723]/5 rounded-full blur-[60px] animate-blob" style={{ animationDelay: '2s' }} />

            {/* Main Image Container */}
            <div className="absolute inset-0 rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-stone-100">
              <Image
                src="/about_bg.png"
                alt="Royal Glow Salon Interior"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            </div>

            {/* Overlapping Floating Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-10 -left-6 md:-left-12 bg-white/90 backdrop-blur-2xl p-8 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-white max-w-[280px]"
            >
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-4 h-4 fill-[#C69C6D]" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-[#3E2723] font-serif text-lg leading-snug mb-3">
                &quot;The atmosphere is unmatched. Truly the best salon experience I&apos;ve had.&quot;
              </p>
              <div>
                <div>
                  <p className="text-[10px] font-bold text-[#3E2723] uppercase tracking-wider">Elena Rodriguez</p>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest">Verified Client</p>
                </div>
              </div>
            </motion.div>

            {/* Accent Border */}
            <div className="absolute inset-0 border-[1.5px] border-[#C69C6D]/30 -translate-x-6 translate-y-6 -z-10 rounded-[40px] group-hover:translate-x-[-12px] group-hover:translate-y-[12px] transition-transform duration-1000" />
          </motion.div>
        </div>
      </section>


      {/* Merged Services & Features Section - Light Redesign */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#FDFBF7] relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C69C6D]/[0.05] rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C69C6D]/[0.03] rounded-full blur-[100px] translate-y-1/3" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-24">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C69C6D]/20 bg-[#C69C6D]/10 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C69C6D] animate-pulse" />
              <span className="text-[#C69C6D] tracking-[0.2em] uppercase text-[10px] font-bold">Menu of Services</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 text-[#3E2723] leading-tight"
            >
              Elevated Salon <span className="gradient-text italic">Experience</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-stone-600 max-w-2xl mx-auto leading-relaxed font-light"
            >
              We combine world-class styling techniques with modern technology and premium care to deliver unparalleled results.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Services Columns */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-12">
              <div className="grid md:grid-cols-2 gap-10">
                {["Men", "Women"].map((catName, idx) => {
                  const catItems = servicesData.filter(s => s.category.startsWith(catName));
                  if (catItems.length === 0) return null;
                  return (
                    <motion.div
                      key={catName}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.2 }}
                      className="flex-1"
                    >
                      <div className="mb-8 flex items-center gap-4 border-b border-stone-200 pb-4">
                        <span className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-stone-100 shadow-sm">
                          {catName === "Men" ? (
                            <svg className="w-6 h-6 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
                          ) : (
                            <svg className="w-6 h-6 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                          )}
                        </span>
                        <h3 className="text-2xl font-serif text-[#3E2723] uppercase tracking-widest">{catName}</h3>
                      </div>

                      <ul className="space-y-1">
                        {catItems.map((item, i) => (
                          <li key={item.id} className="group flex flex-col py-3 border-b border-stone-100 hover:border-[#C69C6D]/30 transition-colors duration-300 cursor-default">
                            <div className="flex items-center justify-between gap-4 w-full">
                              <span className="text-stone-600 font-medium group-hover:text-[#3E2723] transition-colors text-base">{item.name}</span>
                              <div className="flex-1 border-b border-dashed border-stone-200 group-hover:border-[#C69C6D]/50 mx-4 transition-colors"></div>
                              <span className="text-[#C69C6D] font-serif text-lg tracking-wide whitespace-nowrap">Rs. {item.price}</span>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 mt-1">{item.duration} Min</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )
                })}
              </div>

              <div className="pt-4 text-center md:text-left">
                <Link href="/services" className="inline-flex items-center gap-3 text-white bg-gradient-to-r from-[#C69C6D] to-[#B38759] hover:from-[#B38759] hover:to-[#9B7047] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 group shadow-md hover:shadow-xl">
                  Explore Full Menu
                  <svg className="w-4 h-4 text-white group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            </div>

            {/* Premium Features Sidebar */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="lg:col-span-5 xl:col-span-4"
            >
              <div className="bg-white p-8 md:p-10 border border-stone-100 rounded-[32px] h-full flex flex-col justify-center relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C69C6D]/10 rounded-full blur-[50px]" />

                <div className="relative z-10 mb-10 border-b border-stone-100 pb-8">
                  <p className="text-[#C69C6D] tracking-[0.25em] uppercase text-[10px] mb-2 font-bold">The Royal Standard</p>
                  <h3 className="text-3xl font-serif text-[#3E2723] leading-tight">Expertise & <br /><span className="italic gradient-text">Innovation</span></h3>
                </div>

                <div className="space-y-8 relative z-10">
                  {aboutFeatures.slice(2, 5).map((feature, idx) => (
                    <div key={idx} className="flex gap-5 group">
                      <div className="text-[#C69C6D] shrink-0 w-12 h-12 rounded-2xl bg-[#FDFBF7] border border-stone-100 flex items-center justify-center group-hover:bg-[#C69C6D]/10 group-hover:scale-110 transition-all duration-500 shadow-sm">
                        {feature.icon}
                      </div>
                      <div>
                        <h5 className="text-[#3E2723] font-serif text-lg mb-1">{feature.title}</h5>
                        <p className="text-stone-500 text-xs leading-relaxed font-light">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Reviews />

      {/* Look Book Section */}
      {/* Look Book Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C69C6D]/[0.03] rounded-full blur-[80px]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C69C6D]/10 mb-6"
            >
              <span className="text-[#C69C6D] tracking-[0.2em] uppercase text-[10px] font-bold">The Portfolio</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif mb-6 text-[#3E2723]"
            >The Look <span className="gradient-text">Book</span></motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-stone-500 max-w-xl mx-auto font-light leading-relaxed"
            >Witness the power of transformation. A curated gallery of our recent work and style inspirations.</motion.p>
          </div>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
            {lookbookData.map((img, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="break-inside-avoid group relative overflow-hidden rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <Image src={img.src} alt={img.alt || "Lookbook Image"} width={600} height={400}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Immersive Redesign */}
      <section id="contact" className="relative py-32 md:py-40 flex items-center justify-center overflow-hidden min-h-[800px]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image src="/salon-contact.png" alt="Royal Glow Salon" fill className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1210]/95 via-[#1A1210]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full flex flex-col lg:flex-row justify-between items-center gap-16">

          {/* Left: Heading & Intro */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="max-w-xl">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-[#C69C6D] animate-pulse" />
              <span className="text-white tracking-[0.25em] uppercase text-[10px] font-bold">Connect With Us</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif text-white leading-[1.1] mb-6">
              Plan Your <br /><span className="italic gradient-text">Transformation</span>
            </h2>
            <p className="text-stone-300 text-base md:text-lg font-light leading-relaxed mb-12 max-w-md">
              Whether you need a consultation or are ready to book your next visit, our concierge team is at your service to curate your luxury salon experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/?book=true" className="group inline-flex justify-center items-center gap-4 bg-[#C69C6D] text-white px-9 py-5 rounded-full tracking-[0.2em] uppercase text-xs font-bold hover:bg-white hover:text-[#1A1210] transition-colors duration-500 shadow-xl">
                Book Appointment
                <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </motion.div>

          {/* Right: Glassmorphism Contact Cards */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="w-full max-w-md space-y-5"
          >
            {[
              { title: "Reservations", value: "+94 41 222 3456", sub: "Available Daily 9 AM - 8 PM", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /> },
              { title: "General Inquiries", value: "concierge@royalglow.com", sub: "Replies within 24 business hours", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
              { title: "Flagship Location", value: "Beach Road, Matara", sub: "Sri Lanka", icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></> }
            ].map((item, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 flex items-start gap-6 hover:bg-white/10 hover:border-white/20 transition-all duration-500 cursor-default shadow-2xl">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#C69C6D]/20 rounded-full blur-[40px] group-hover:bg-[#C69C6D]/40 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#C69C6D] group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon}</svg>
                </div>
                <div className="relative z-10 pt-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-2">{item.title}</p>
                  <p className="text-white font-serif text-xl tracking-wide mb-1 group-hover:text-[#C69C6D] transition-colors">{item.value}</p>
                  <p className="text-stone-400 text-xs font-light leading-relaxed">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Map Section - Redesigned */}
      <section className="mx-6 md:mx-12 mb-10 relative">
        <div className="rounded-3xl overflow-hidden relative" style={{ height: '420px' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63542.03706908!2d80.498!3d5.9489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae138d151937cd9%3A0x1d711f45fa81947d!2sMatara!5e0!3m2!1sen!2slk!4v1696000000000"
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            title="Royal Glow Salon Location – Matara"
            className="grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
          />
          {/* Overlay badge */}
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-xl rounded-2xl px-5 py-3 border border-stone-100 shadow-lg flex items-center gap-3 z-10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C69C6D] to-[#A0735B] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#C69C6D] font-bold">Royal Glow Salon</p>
              <p className="text-stone-600 text-xs font-serif">Beach Road, Matara</p>
            </div>
          </div>
        </div>
      </section>

    </main >
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
