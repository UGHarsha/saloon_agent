"use client";
import { useState, useEffect, FormEvent, KeyboardEvent, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../utils/supabase";
import Reviews from "./components/Reviews";
import { motion, AnimatePresence } from "framer-motion";

const lookBookImages = [
  { src: "/customers/client-doing-hair-cut-barber-shop-salon_1303-20710.jpg", alt: "Barber shop styling" },
  { src: "/customers/female-hairdresser.jpg", alt: "Beauty salon look" },
  { src: "/customers/female-hairdresser-making-hairstyle-blonde-woman-beauty-salon_176420-4458.jpg", alt: "Blonde hairstyle" },
  { src: "/customers/female-hairdresser-making-hairstyle-redhead-woman-beauty-salon_176420-4476.jpg", alt: "Redhead hairstyle" },
  { src: "/customers/female-hairdresser-making-hairstyle-redhead-woman-beauty-salon_176420-4482.jpg", alt: "Elegant redhead styling" },
  { src: "/customers/female-hairdresser-using-hairbrush-hair-dryer_329181-1929.jpg", alt: "Professional blow dry" },
  { src: "/customers/pretty-cute-young.jpg", alt: "Happy client" },
  { src: "/customers/professional-girl-hairdresser-makes-client-haircut-girl-is-sitting-mask-beauty-salon_343596-4444.jpg", alt: "Professional haircut" },
  { src: "/customers/woman-washing-head-hairsalon_1157-27179.jpg", alt: "Hair wash treatment" },
  { src: "/customers/young-beautiful-bride-is-standing-summer-park-with-bouquet-flowers.jpg", alt: "Bridal styling" },
  { src: "/customers/young-man-barbershop-trimming.jpg", alt: "Men's grooming" },
  { src: "/1.jpg", alt: "Master Artistry" },
];

const aboutFeatures = [
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
    title: "AI-Powered Booking",
    description: "Chat with our AI assistant Bella to book appointments effortlessly, get style recommendations, and more.",
  },
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    title: "Virtual Try-On",
    description: "Experiment with different hair colors and styles using our AR-powered virtual try-on before you commit.",
  },
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    title: "Flexible Scheduling",
    description: "Real-time availability with 30-minute time slots. Book manually or let AI find the best time for you.",
  },
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>),
    title: "Premium Products",
    description: "We use only top-tier professional products for all our treatments, ensuring the best results for your hair.",
  },
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
    title: "Expert Stylists",
    description: "Our team of experienced professionals is trained in the latest trends and classic techniques alike.",
  },
  {
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>),
    title: "Bridal Packages",
    description: "Complete bridal styling packages including trial sessions, on-the-day styling, and stunning makeovers.",
  },
];

const aboutServices = [
  { category: "Men", items: ["Adult Buzz Cut", "Gent Hair Cut", "Beard & Neck Trim", "Color & Highlights", "Consultation"] },
  { category: "Women", items: ["Women's Haircut", "Color & Highlights", "Keratin Treatment", "Bridal Package", "Consultation"] },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingView, setBookingView] = useState<"none" | "ai" | "manual">("none");
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const heroImages = ["/1.jpg", "/2.jpg", "/3.jpg"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Manual booking states
  const [manualForm, setManualForm] = useState({
    name: "",
    category: "men",
    service: "Adult Buzz Cut 60 min (Rs. 5000+)",
    date: "",
    time: "10:00 AM",
  });
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
          const bookingsList = data.map((b: any) => {
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

  let availableTimes: string[] = [];
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
      let [hours, minutes] = time.split(':');
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

  const sendMessage = async () => {
    if (!input.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      setChatLog((prev) => [...prev, { role: "bella", text: "Please login first to book an appointment." }]);
      return;
    }

    const userMsg = { role: "user", text: input };
    setChatLog([...chatLog, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: chatLog,
          userId: session.user.id,
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

      {/* Booking Modal */}
      {bookingView !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E2723]/40 backdrop-blur-md p-4">
          <div className="bg-white max-w-5xl w-full h-[90vh] md:h-[80vh] overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-2xl border border-stone-100">

            {/* Sidebar / Info Panel (Desktop) */}
            <div className="hidden md:flex w-1/3 bg-[#3E2723] p-10 flex-col justify-between text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C69C6D]/10 rounded-bl-full"></div>
              <div>
                <h2 className="text-3xl font-serif mb-6 leading-tight">Reserved <br /> Excellence</h2>
                <p className="text-stone-300 text-sm leading-relaxed mb-8">
                  Whether you prefer the precision of our AI assistant or the direct control of manual booking, your luxury experience starts here.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-stone-200">
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold">Duration</p>
                      <p className="text-sm font-serif">30 - 180 Minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-stone-200">
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold">Location</p>
                      <p className="text-sm font-serif">Main St, Matara</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Need Help?</p>
                <p className="text-xs text-stone-300">+94 41 123 4567</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-[#FDFBF7] relative">
              <button
                onClick={() => {
                  setBookingView("none");
                  if (searchParams.get("book") === "true" || searchParams.get("book") === "ai") router.replace("/");
                }}
                className="absolute top-6 right-6 z-30 p-2 text-stone-400 hover:text-[#3E2723] hover:bg-white rounded-full transition-all shadow-sm"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Tabs */}
              <div className="flex border-b border-stone-200 bg-white">
                <button
                  onClick={() => setBookingView("manual")}
                  className={`flex-1 py-6 text-xs font-bold tracking-[0.2em] uppercase transition-all relative ${bookingView === "manual"
                    ? "text-[#3E2723]"
                    : "text-stone-400 hover:text-stone-600"
                    }`}
                >
                  Manual Booking
                  {bookingView === "manual" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#C69C6D]"></div>}
                </button>
                <button
                  onClick={() => setBookingView("ai")}
                  className={`flex-1 py-6 text-xs font-bold tracking-[0.2em] uppercase transition-all relative ${bookingView === "ai"
                    ? "text-[#3E2723]"
                    : "text-stone-400 hover:text-stone-600"
                    }`}
                >
                  AI Assistant
                  {bookingView === "ai" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#C69C6D]"></div>}
                </button>
              </div>

              {/* Views */}
              <div className="flex-1 overflow-y-auto w-full">
                {bookingView === "manual" && (
                  <div className="p-8 md:p-12 animate-fadeIn">
                    {manualSuccess ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-serif text-[#3E2723] mb-4">Reservation Confirmed</h3>
                        <p className="text-stone-500 text-sm max-w-sm mb-10 leading-relaxed">
                          Your appointment has been successfully booked. We have sent a confirmation to your registered email.
                        </p>
                        <button
                          onClick={() => {
                            setBookingView("none");
                            if (searchParams.get("book") === "true") router.replace("/");
                          }}
                          className="bg-[#3E2723] text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#5D3A32] transition-all shadow-lg"
                        >
                          Return Home
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleManualSubmit} className="max-w-2xl mx-auto space-y-10">
                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-black">Full Name</label>
                            <input
                              type="text"
                              required
                              value={manualForm.name}
                              onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                              className="w-full bg-white border border-stone-200 px-5 py-4 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] focus:ring-1 focus:ring-[#C69C6D] transition-all font-serif placeholder-stone-300 rounded-lg shadow-sm"
                              placeholder="Your full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-black">Category</label>
                            <div className="relative">
                              <select
                                value={manualForm.category}
                                onChange={(e) => setManualForm({ ...manualForm, category: e.target.value, service: e.target.value === 'men' ? 'Adult Buzz Cut 60 min (Rs. 5000+)' : 'Women\'s Haircut (Rs. 6000+)' })}
                                className="w-full bg-white border border-stone-200 px-5 py-4 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] focus:ring-1 focus:ring-[#C69C6D] transition-all font-serif appearance-none rounded-lg shadow-sm"
                              >
                                <option value="men">Men's Styling</option>
                                <option value="women">Women's Styling</option>
                              </select>
                              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-black">Select Treatment</label>
                          <div className="relative">
                            <select
                              value={manualForm.service}
                              onChange={(e) => setManualForm({ ...manualForm, service: e.target.value })}
                              className="w-full bg-white border border-stone-200 px-5 py-4 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] focus:ring-1 focus:ring-[#C69C6D] transition-all font-serif appearance-none rounded-lg shadow-sm"
                            >
                              {manualForm.category === "women" ? (
                                <>
                                  <option value="Women's Haircut 60 min (Rs. 6000+)">Women's Haircut — 60 min (Rs. 6000+)</option>
                                  <option value="Color & Highlights 120 min (Rs. 15000+)">Color & Highlights — 120 min (Rs. 15000+)</option>
                                  <option value="Keratin Treatment 120 min (Rs. 25000+)">Keratin Treatment — 120 min (Rs. 25000+)</option>
                                  <option value="Bridal Package 180 min (Rs. 50000+)">Bridal Package — 180 min (Rs. 50000+)</option>
                                  <option value="Consultation 30 min (Rs. 2000)">Consultation — 30 min (Rs. 2000)</option>
                                </>
                              ) : (
                                <>
                                  <option value="Adult Buzz Cut 60 min (Rs. 5000+)">Adult Buzz Cut — 60 min (Rs. 5000+)</option>
                                  <option value="Clean Up - Beard & Neck Trim 15 min (Rs. 2500+)">Clean Up — 15 min (Rs. 2500+)</option>
                                  <option value="Gent hair cut 30 min (Rs. 4000+)">Gent Haircut — 30 min (Rs. 4000+)</option>
                                  <option value="Color & Highlights 60 min (Rs. 10000+)">Color & Highlights — 60 min (Rs. 10000+)</option>
                                  <option value="Consultation 15 min (Rs. 2000)">Consultation — 15 min (Rs. 2000)</option>
                                </>
                              )}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-black">Date</label>
                            <input
                              type="date"
                              min={new Date().toLocaleDateString('en-CA')}
                              required
                              value={manualForm.date}
                              onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                              className="w-full bg-white border border-stone-200 px-5 py-4 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] focus:ring-1 focus:ring-[#C69C6D] transition-all font-serif rounded-lg shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-black">Preferred Time</label>
                            <div className="relative">
                              <select
                                value={manualForm.time}
                                onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })}
                                className="w-full bg-white border border-stone-200 px-5 py-4 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] focus:ring-1 focus:ring-[#C69C6D] transition-all font-serif appearance-none rounded-lg shadow-sm"
                              >
                                {availableTimes.length > 0 ? (
                                  availableTimes.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))
                                ) : (
                                  <option value="" disabled>No slots available</option>
                                )}
                              </select>
                              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={manualLoading || !manualForm.time}
                          className="w-full bg-[#C69C6D] text-white py-5 mt-4 uppercase tracking-[0.3em] text-xs font-black hover:bg-[#B38759] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 rounded-lg"
                        >
                          {manualLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Processing
                            </>
                          ) : !manualForm.time ? "No Slots Available" : "Confirm Booking"}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {bookingView === "ai" && (
                  <div className="h-full flex flex-col bg-white overflow-hidden animate-fadeIn">
                    {/* Chat Header (Mobile only) */}
                    <div className="md:hidden p-4 bg-[#3E2723] text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C69C6D] rounded-full flex items-center justify-center text-xl shadow-inner">✨</div>
                      <div>
                        <p className="text-xs font-bold tracking-widest uppercase text-stone-300">AI Assistant</p>
                        <p className="text-sm font-serif">Bella</p>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
                      {chatLog.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn py-10">
                          <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mb-8 shadow-sm border border-stone-100 text-3xl">
                            ✨
                          </div>
                          <h3 className="text-2xl font-serif text-[#3E2723] mb-4">Hello, I'm Bella</h3>
                          <p className="text-stone-500 text-sm max-w-xs leading-relaxed mb-10">
                            Your luxury concierge. I can book your visit, recommend styles, or answer any questions about our services.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                            <button
                              onClick={() => {
                                setInput("Book a haircut for tomorrow morning");
                                // We need to trigger the send after setting input, but since it's a state change 
                                // it's better to just call sendMessage with the string if possible, or use a ref.
                                // For now, let the user click send or just provide the text.
                              }}
                              className="p-4 text-left bg-white border border-stone-200 rounded-xl hover:border-[#C69C6D] hover:bg-stone-50 transition-all group"
                            >
                              <p className="text-[10px] uppercase tracking-widest text-[#C69C6D] font-bold mb-1">Quick Booking</p>
                              <p className="text-xs text-stone-600 font-serif group-hover:text-[#3E2723]">"Book a haircut for tomorrow morning"</p>
                            </button>
                            <button
                              onClick={() => setInput("What services do you offer for women?")}
                              className="p-4 text-left bg-white border border-stone-200 rounded-xl hover:border-[#C69C6D] hover:bg-stone-50 transition-all group"
                            >
                              <p className="text-[10px] uppercase tracking-widest text-[#C69C6D] font-bold mb-1">Services</p>
                              <p className="text-xs text-stone-600 font-serif group-hover:text-[#3E2723]">"What services do you offer for women?"</p>
                            </button>
                          </div>
                        </div>
                      ) : (
                        chatLog.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                          >
                            <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                              {msg.role === "bella" && (
                                <div className="w-8 h-8 rounded-full bg-[#C69C6D] flex items-center justify-center text-white text-xs shrink-0 mt-1 shadow-sm">✨</div>
                              )}
                              <div
                                className={`px-6 py-4 rounded-2xl shadow-sm leading-relaxed text-sm ${msg.role === "user"
                                  ? "bg-[#3E2723] text-white rounded-tr-none"
                                  : "bg-[#F5F1E8] text-[#3E2723] rounded-tl-none border border-stone-100"
                                  }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {loading && (
                        <div className="flex justify-start animate-fadeIn">
                          <div className="flex gap-4 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-[#C69C6D] flex items-center justify-center text-white text-xs shrink-0 mt-1 shadow-sm animate-pulse">✨</div>
                            <div className="bg-[#F5F1E8] px-6 py-4 rounded-2xl rounded-tl-none border border-stone-100 shadow-sm">
                              <div className="flex gap-1.5 items-center h-5">
                                <div className="w-1.5 h-1.5 bg-[#C69C6D] rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-[#C69C6D] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                <div className="w-1.5 h-1.5 bg-[#C69C6D] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 md:p-10 bg-white border-t border-stone-100">
                      <div className="max-w-3xl mx-auto flex items-center gap-4 bg-[#FDFBF7] border border-stone-200 rounded-2xl p-2 pl-6 focus-within:border-[#C69C6D] focus-within:ring-1 focus-within:ring-[#C69C6D] transition-all shadow-sm">
                        <input
                          className="flex-1 bg-transparent border-none focus:outline-none py-3 text-stone-800 placeholder-stone-400 text-sm font-serif"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Tell Bella what you're looking for..."
                          disabled={loading}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={loading || !input.trim()}
                          className="bg-[#3E2723] disabled:bg-stone-300 text-white rounded-xl p-3.5 transition-all hover:bg-[#C69C6D] active:scale-95 shadow-md flex items-center justify-center"
                          aria-label="Send message"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-center text-[10px] text-stone-400 mt-4 uppercase tracking-[0.1em]">Bella AI can schedule, reschedule and answer questions about Royale Glow Salon</p>
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
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            {heroImages.map((src, idx) => (
              idx === currentHeroSlide && (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={src}
                    alt={`Luxury Salon Interior ${idx + 1}`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </motion.div>
              )
            ))}
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-[#C69C6D] tracking-[0.4em] uppercase text-xs mb-8 font-bold"
          >
            Matara's Finest Destination
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-6xl md:text-8xl lg:text-9xl font-serif mb-10 leading-[0.9] tracking-tighter"
          >
            Refining <br /> <span className="italic text-[#C69C6D]">Elegance</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-stone-200 max-w-xl mx-auto mb-14 text-sm md:text-base font-light leading-relaxed tracking-wide"
          >
            Enter a sanctuary of sophisticated beauty. At Royal Glow, we blend timeless artistry with modern innovation to redefine your unique essence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button
              onClick={() => handleBookingAction("manual")}
              className="bg-[#C69C6D] text-white px-10 py-5 tracking-[0.2em] uppercase text-xs font-bold hover:bg-[#B38759] transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95"
            >
              Reserve Visit
            </button>
            <button
              onClick={() => handleBookingAction("ai")}
              className="group text-white px-10 py-5 tracking-[0.2em] uppercase text-xs font-bold border border-white/30 backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center gap-3"
            >
              <span>Consult Bella AI</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </motion.div>
        </div>

      </section>

      {/* Stats Bar */}
      <section className="bg-[#3E2723] py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "5+", label: "Years Experience" },
            { number: "2000+", label: "Happy Clients" },
            { number: "15+", label: "Expert Stylists" },
            { number: "50+", label: "Services Offered" },
          ].map((stat, idx) => (
            <div key={idx} className="group">
              <p className="text-3xl md:text-4xl font-serif text-[#C69C6D] mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</p>
              <p className="text-stone-400 text-xs uppercase tracking-[0.15em] font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>



      {/* Story Section */}
      <section id="about" className="py-24 md:py-32 px-6 md:px-12 bg-[#FDFBF7] overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[#C69C6D] tracking-[0.3em] uppercase text-[10px] mb-5 font-bold">Heritage of Beauty</p>
            <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight text-[#3E2723]">
              Crafting Excellence <br /> <span className="text-[#C69C6D]">Since inception.</span>
            </h2>
            <div className="space-y-6 text-stone-500 leading-relaxed font-light">
              <p>
                Royal Glow Salon was born from a singular vision: to create a sanctuary where beauty is not just maintained, but elevated to an art form.
              </p>
              <p>
                Nestled in the heart of <strong>Matara</strong>, we have curated a collection of the world's most talented stylists and premium products to deliver a transformation that resonates with your personal narrative.
              </p>
              <p>
                Every stroke of the brush and every cut of the shear is executed with precision and intention, ensuring that your visit is more than an appointment—it is a moment of refined self-care.
              </p>
            </div>
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#FDFBF7] bg-stone-200 overflow-hidden relative">
                    <Image src="/1.jpg" alt="Client" fill sizes="40px" className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 font-medium">Joined by <span className="text-[#3E2723] font-bold">2,000+</span> happy clients</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative h-[600px] group"
          >
            <div className="absolute inset-0 border border-stone-200 translate-x-6 translate-y-6 -z-10 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500" />
            <Image
              src="/customers/omar.jpg"
              alt="Happy client at Royal Glow Salon"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover shadow-2xl grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 rounded-sm"
            />
            <div className="absolute -bottom-8 -left-8 bg-[#3E2723] p-8 shadow-2xl rounded-sm">
              <p className="text-[#C69C6D] text-4xl font-serif mb-1">5.0</p>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(i => <svg key={i} className="w-3 h-3 fill-[#C69C6D]" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}
              </div>
              <p className="text-white text-[10px] uppercase tracking-widest font-bold">Google Rating</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Merged Services & Features Section */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">Excellence Preferred</p>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Elevated Salon Experience</h2>
            <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
              We combine world-class styling techniques with modern technology and premium care to deliver an unmatched salon experience.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Column 1 & 2: Services Highlights */}
            <div className="lg:col-span-2 space-y-12">
              <div className="bg-white border border-stone-100 p-10 md:p-16 shadow-sm">
                <div className="flex flex-col md:flex-row gap-16">
                  {aboutServices.map((group) => (
                    <div key={group.category} className="flex-1">
                      <h3 className="text-2xl font-serif text-[#3E2723] mb-8 pb-4 border-b border-stone-100 flex items-center gap-3">
                        <span className="w-10 h-10 bg-[#C69C6D]/10 rounded-full flex items-center justify-center">
                          {group.category === "Men" ? (
                            <svg className="w-5 h-5 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          )}
                        </span>
                        {group.category}
                      </h3>
                      <ul className="space-y-4">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-center gap-4 text-stone-600 group cursor-default">
                            <span className="w-2 h-2 bg-[#C69C6D] rounded-full group-hover:scale-125 transition-transform duration-300" />
                            <span className="text-sm font-medium tracking-wide group-hover:text-[#3E2723] transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-12 pt-8 border-t border-stone-100 text-center">
                  <a
                    href="/services"
                    className="inline-flex items-center gap-4 text-[#C69C6D] text-xs font-bold uppercase tracking-[0.2em] hover:gap-6 transition-all duration-300"
                  >
                    View Comprehensive Menu
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Bottom horizontal features list (optional refinement) */}
              <div className="grid grid-cols-2 gap-8">
                {aboutFeatures.slice(0, 2).map((feature, idx) => (
                  <div key={idx} className="flex gap-5 items-start">
                    <div className="text-[#C69C6D] bg-white p-3 shadow-sm border border-stone-100">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-[#3E2723] font-serif text-lg mb-1">{feature.title}</h4>
                      <p className="text-stone-500 text-xs leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Why Choose Us (Features) */}
            <div className="bg-[#3E2723] p-10 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C69C6D]/10 rounded-bl-full -mr-16 -mt-16"></div>
              <div className="relative z-10 space-y-12">
                <div>
                  <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-[10px] mb-3 font-semibold">The Standard</p>
                  <h3 className="text-2xl md:text-3xl font-serif text-white leading-tight">Expertise & Innovation</h3>
                </div>

                <div className="space-y-10">
                  {aboutFeatures.slice(2, 6).map((feature, idx) => (
                    <div key={idx} className="flex gap-5 group">
                      <div className="text-[#C69C6D] group-hover:scale-110 transition-transform duration-300 shrink-0">
                        {/* Slightly smaller icons for sidebar */}
                        {feature.icon}
                      </div>
                      <div>
                        <h5 className="text-white font-serif text-base mb-1">{feature.title}</h5>
                        <p className="text-stone-400 text-xs leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Testimonials Section */}
      <Reviews />

      {/* Look Book Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#C69C6D] tracking-[0.3em] uppercase text-[10px] mb-4 font-bold"
            >
              The Portfolio
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif mb-6 text-[#3E2723]"
            >
              The Look Book
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-stone-500 max-w-xl mx-auto font-light leading-relaxed"
            >
              Witness the power of transformation. A curated gallery of our recent work and style inspirations.
            </motion.p>
          </div>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {lookBookImages.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="break-inside-avoid group relative overflow-hidden rounded-xl border border-stone-100"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={600}
                  height={400}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact" className="py-24 md:py-32 px-6 md:px-12 bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">Connect</p>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Contact Us</h2>
            <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
              We&apos;re here to help you achieve your beauty goals. Visit us at our salon or give us a call to book your transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Location */}
            <div className="bg-white border border-stone-100 p-10 text-center shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-16 h-16 bg-[#C69C6D]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C69C6D] group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 text-[#C69C6D] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl mb-3">Visit Us</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Beach Road, Matara<br />
                Sri Lanka
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white border border-stone-100 p-10 text-center shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-16 h-16 bg-[#C69C6D]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C69C6D] group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 text-[#C69C6D] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl mb-3">Call Us</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-1">+94 41 222 3456</p>
              <p className="text-stone-500 text-sm leading-relaxed">+94 77 123 4567</p>
            </div>

            {/* Hours */}
            <div className="bg-white border border-stone-100 p-10 text-center shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-16 h-16 bg-[#C69C6D]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C69C6D] group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 text-[#C69C6D] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl mb-3">Working Hours</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Mon – Sat: 9:00 AM – 8:00 PM<br />
                Sunday: 10:00 AM – 4:00 PM
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Map Section */}
      <section className="h-[400px] relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63542.03706908!2d80.498!3d5.9489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae138d151937cd9%3A0x1d711f45fa81947d!2sMatara!5e0!3m2!1sen!2slk!4v1696000000000"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Royal Glow Salon Location – Matara"
          className="grayscale hover:grayscale-0 transition-all duration-500"
        />
      </section>

      {/* CTA Section */}
      <section className="bg-[#3E2723] py-20 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">Ready?</p>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">
            Book Your Appointment Today
          </h2>
          <p className="text-stone-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Whether it&apos;s a fresh cut, a stunning color, or bridal glam — we&apos;re here to make it happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleBookingAction("manual")}
              className="bg-[#C69C6D] text-white px-8 py-4 tracking-[0.15em] uppercase text-sm font-medium hover:bg-[#B38759] transition-all duration-300"
            >
              Book Now
            </button>
            <button
              onClick={() => handleBookingAction("ai")}
              className="border border-white/30 text-white px-8 py-4 tracking-[0.15em] uppercase text-sm font-medium backdrop-blur-sm bg-white/5 hover:bg-white/15 transition-all duration-300"
            >
              Consult AI Assistant
            </button>
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
