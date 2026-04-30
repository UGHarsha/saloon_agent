"use client";
import { useState, useEffect, FormEvent, KeyboardEvent, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../utils/supabase";

const lookBookImages = [
  { src: "/customers/client-doing-hair-cut-barber-shop-salon_1303-20710.jpg", alt: "Barber shop styling" },
  { src: "/customers/female-hairdresser-beauty-salon_1303-27755.jpg", alt: "Beauty salon look" },
  { src: "/customers/female-hairdresser-making-hairstyle-blonde-woman-beauty-salon_176420-4458.jpg", alt: "Blonde hairstyle" },
  { src: "/customers/female-hairdresser-making-hairstyle-redhead-woman-beauty-salon_176420-4476.jpg", alt: "Redhead hairstyle" },
  { src: "/customers/female-hairdresser-making-hairstyle-redhead-woman-beauty-salon_176420-4482.jpg", alt: "Elegant redhead styling" },
  { src: "/customers/female-hairdresser-using-hairbrush-hair-dryer_329181-1929.jpg", alt: "Professional blow dry" },
  { src: "/customers/pretty-cute-young-woman-with-long-brunette-hair-smiling-camera-hairdresser-salon_197531-3664.jpg", alt: "Happy client" },
  { src: "/customers/professional-girl-hairdresser-makes-client-haircut-girl-is-sitting-mask-beauty-salon_343596-4444.jpg", alt: "Professional haircut" },
  { src: "/customers/woman-washing-head-hairsalon_1157-27179.jpg", alt: "Hair wash treatment" },
  { src: "/customers/young-beautiful-bride-is-standing-summer-park-with-bouquet-flowers.jpg", alt: "Bridal styling" },
  { src: "/customers/young-man-barbershop-trimming-hair_1303-26254.jpg", alt: "Men's grooming" },
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
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const heroImages = ["/salon.jpg", "/2.jpg", "/3.jpg"];

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

      const startOfDay = new Date(`${manualForm.date}T00:00:00`).toISOString();
      const endOfDay = new Date(`${manualForm.date}T23:59:59`).toISOString();

      const { data, error } = await supabase
        .from('bookings')
        .select('appointment_date, service')
        .gte('appointment_date', startOfDay)
        .lte('appointment_date', endOfDay);

      if (!error && data) {
        const bookingsList = data.map(b => {
          const date = new Date(b.appointment_date);
          const startMin = date.getHours() * 60 + date.getMinutes();
          const p = b.service ? b.service.match(/(\d+)\s*min/) : null;
          const dur = p ? parseInt(p[1]) : 60;
          return { start: startMin, end: startMin + dur };
        });
        setBookingsData(bookingsList);
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

      const missingUserIdColumn = (message?: string) => {
        const msg = (message || "").toLowerCase();
        return msg.includes("user_id") && (msg.includes("schema cache") || msg.includes("does not exist"));
      };

      const payloadWithUser = {
        user_id: session.user.id,
        customer_name: manualForm.name,
        service: manualForm.service,
        appointment_date: appointmentDate,
      };

      let insertError = (await supabase.from("bookings").insert([payloadWithUser]).select()).error;

      if (insertError && missingUserIdColumn(insertError.message)) {
        const payloadWithoutUser = {
          customer_name: manualForm.name,
          service: manualForm.service,
          appointment_date: appointmentDate,
        };
        insertError = (await supabase.from("bookings").insert([payloadWithoutUser]).select()).error;
      }

      if (insertError) throw new Error(insertError.message || "Failed to book appointment");

      setManualSuccess(true);
      setManualForm({ ...manualForm, name: "" }); // Reset some fields
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Booking error:", errorMessage);
      alert(`Failed to book appointment: ${errorMessage}`);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
            <button
              onClick={() => {
                setBookingView("none");
                if (searchParams.get("book") === "true") router.replace("/");
              }}
              className="absolute top-4 right-4 z-10 p-2 text-stone-500 hover:text-stone-900 bg-white/50 hover:bg-white/80 backdrop-blur-md rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="absolute top-4 left-4 z-10 md:hidden">
              <button
                onClick={() => {
                  setBookingView("none");
                  if (searchParams.get("book") === "true") router.replace("/");
                }}
                className="bg-white/50 backdrop-blur-md p-2 rounded-full text-stone-800"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Header */}
            <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 bg-white shrink-0">
              <div>
                <h1 className="text-2xl font-serif text-[#3E2723] tracking-wide">Book Your Visit</h1>
                <p className="text-stone-500 text-xs mt-1 tracking-wide uppercase">Select an option below</p>
              </div>
            </div>

            {/* Booking View Tabs */}
            <div className="flex bg-stone-50/50 p-2 gap-2 border-b border-stone-100 shrink-0">
              <button
                onClick={() => setBookingView("manual")}
                className={`flex-1 py-3 text-xs font-semibold tracking-widest uppercase transition-all rounded-sm ${bookingView === "manual"
                  ? "bg-[#C69C6D] text-white shadow-md mx-1"
                  : "bg-transparent text-stone-500 hover:text-stone-800 hover:bg-white"
                  }`}
              >
                Manual Booking
              </button>
              <button
                onClick={() => setBookingView("ai")}
                className={`flex-1 py-3 text-xs font-semibold tracking-widest uppercase transition-all rounded-sm ${bookingView === "ai"
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
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <div className="text-[#C69C6D] mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-serif text-[#3E2723] mb-2">Booking Confirmed</h2>
                    <p className="text-stone-500 mb-8 max-w-sm mx-auto text-sm">
                      We&apos;ve reserved your time. You&apos;ll receive a confirmation email shortly.
                    </p>
                    <button
                      onClick={() => {
                        setBookingView("none");
                        if (searchParams.get("book") === "true") router.replace("/");
                      }}
                      className="border border-[#C69C6D] text-[#C69C6D] hover:bg-[#C69C6D] hover:text-white px-8 py-3 tracking-widest uppercase text-xs transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto">
                    <form onSubmit={handleManualSubmit} className="space-y-8 bg-white p-8 md:p-12 shadow-sm border border-stone-100 relative">
                      {/* Name input */}
                      <div>
                        <label className="block text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">Full Name</label>
                        <input type="text" required value={manualForm.name} onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })} className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-3 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors font-serif placeholder-stone-300" placeholder="Jane Doe" />
                      </div>

                      {/* Service select */}
                      <div className="mb-4">
                        <label className="block text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">Category</label>
                        <select
                          value={manualForm.category}
                          onChange={(e) => setManualForm({ ...manualForm, category: e.target.value, service: e.target.value === 'men' ? 'Adult Buzz Cut 60 min (Rs. 5000+)' : 'Women\'s Haircut (Rs. 6000+)' })}
                          className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-3 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors font-serif appearance-none"
                        >
                          <option value="men">Men</option>
                          <option value="women">Women</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">Service</label>
                        <select
                          value={manualForm.service}
                          onChange={(e) => setManualForm({ ...manualForm, service: e.target.value })}
                          className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-3 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors font-serif appearance-none"
                        >
                          {manualForm.category === "women" ? (
                            <>
                              <option value="Women's Haircut 60 min (Rs. 6000+)">Women&apos;s Haircut 60 min (Rs. 6000+)</option>
                              <option value="Color & Highlights 120 min (Rs. 15000+)">Color & Highlights 120 min (Rs. 15000+)</option>
                              <option value="Keratin Treatment 120 min (Rs. 25000+)">Keratin Treatment 120 min (Rs. 25000+)</option>
                              <option value="Bridal Package 180 min (Rs. 50000+)">Bridal Package 180 min (Rs. 50000+)</option>
                              <option value="Consultation 30 min (Rs. 2000)">Consultation 30 min (Rs. 2000)</option>
                            </>
                          ) : (
                            <>
                              <option value="Adult Buzz Cut 60 min (Rs. 5000+)">Adult Buzz Cut 60 min (Rs. 5000+)</option>
                              <option value="Clean Up - Beard & Neck Trim 15 min (Rs. 2500+)">Clean Up - Beard & Neck Trim 15 min (Rs. 2500+)</option>
                              <option value="Gent hair cut 30 min (Rs. 4000+)">Gent hair cut 30 min (Rs. 4000+)</option>
                              <option value="Color & Highlights 60 min (Rs. 10000+)">Color & Highlights 60 min (Rs. 10000+)</option>
                              <option value="Consultation 15 min (Rs. 2000)">Consultation 15 min (Rs. 2000)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">Date</label>
                          <input type="date" min={new Date().toLocaleDateString('en-CA')} required value={manualForm.date} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-3 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors font-serif" />
                        </div>
                        <div>
                          <label className="block text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">Time</label>
                          <select value={manualForm.time} onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })} className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-3 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors font-serif appearance-none">
                            {availableTimes.length > 0 ? (
                              availableTimes.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))
                            ) : (
                              <option value="" disabled>No slots available</option>
                            )}
                          </select>
                        </div>
                      </div>

                      <button type="submit" disabled={manualLoading || !manualForm.time} className="w-full bg-[#C69C6D] text-white py-4 mt-8 uppercase tracking-widest text-sm font-semibold hover:bg-[#B38759] transition-colors disabled:opacity-50">
                        {manualLoading ? "Processing..." : !manualForm.time ? "No Slots Available" : "Confirm Booking"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {bookingView === "ai" && (
              <div className="flex-1 flex flex-col h-full bg-stone-50 relative">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

                {/* Chat Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent z-10 w-full">
                  {chatLog.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-100">
                        <span className="text-2xl">✨</span>
                      </div>
                      <h2 className="text-xl font-serif text-[#3E2723] mb-2">Your AI Assistant</h2>
                      <p className="text-stone-500 text-sm max-w-sm leading-relaxed">
                        I can help you schedule your appointment or answer questions. Try asking: &quot;Book a haircut for tomorrow at 2pm.&quot;
                      </p>
                    </div>
                  ) : (
                    chatLog.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                      >
                        <div
                          className={`max-w-[85%] px-5 py-4 rounded-2xl transition-all duration-300 shadow-sm ${msg.role === "user"
                            ? "bg-[#C69C6D] text-white rounded-br-sm"
                            : "bg-white border border-stone-200 text-[#3E2723] rounded-bl-sm"
                            }`}
                        >
                          {msg.role === "bella" && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] uppercase tracking-widest text-[#C69C6D] font-semibold">Bella</span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="bg-white border border-stone-200 text-stone-800 px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm">
                        <div className="flex gap-1.5 items-center h-5">
                          <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-white border-t border-stone-100 z-10 w-full shrink-0">
                  <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-full border border-stone-200 focus-within:border-[#C69C6D] focus-within:ring-1 focus-within:ring-[#C69C6D] transition-all max-w-4xl mx-auto">
                    <input
                      className="flex-1 bg-transparent border-none focus:outline-none px-4 py-2 text-stone-800 placeholder-stone-400 text-sm"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Message the AI agent..."
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="bg-[#C69C6D] disabled:bg-stone-300 text-white rounded-full p-2.5 transition-colors"
                      aria-label="Send message"
                    >
                      <svg className="w-5 h-5 translate-x-px translate-y-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative text-white py-32 md:py-48 flex items-center justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, idx) => (
            <Image
              key={src}
              src={src}
              alt={`Luxury Salon Interior ${idx + 1}`}
              fill
              priority={idx === 0}
              className={`object-cover object-center transition-opacity duration-1000 ${idx === currentHeroSlide ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}
          <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-1000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
          <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-6 font-semibold">Discover Luxury</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-tight tracking-tight">
            Refined <br /> Elegance
          </h1>
          <p className="text-stone-50 max-w-2xl mx-auto mb-12 text-base md:text-lg font-light leading-relaxed">
            Experience the pinnacle of modern styling and personalized beauty at our salon, inspired by the excellence of noelines.com.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => handleBookingAction("manual")}
              className="bg-[#C69C6D] text-white px-8 py-4 tracking-[0.15em] uppercase text-sm font-medium hover:bg-[#B38759] transition-all duration-300 shadow-lg"
            >
              Book Appointment
            </button>
            <button
              onClick={() => handleBookingAction("ai")}
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

      {/* ===== ABOUT US SECTIONS ===== */}

      {/* Story Section */}
      <section id="about" className="py-20 md:py-28 px-6 md:px-12 bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">Our Story</p>
            <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">
              Crafting Beauty <br />Since Day One
            </h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              Royal Glow Salon was born from a passion for making people feel their absolute best.
              Nestled in the vibrant city of <strong>Matara</strong>, we have built a reputation for
              delivering exceptional hair care, cutting-edge styling, and a truly luxurious experience.
            </p>
            <p className="text-stone-600 leading-relaxed mb-6">
              Our team of expert stylists stays at the forefront of global trends while respecting
              each client&apos;s individuality. We believe that every visit should be more than an
              appointment — it should be a moment of transformation and self-care.
            </p>
            <p className="text-stone-600 leading-relaxed">
              From classic cuts to bridal packages, color transformations to keratin treatments,
              we offer a comprehensive range of services for both men and women using only premium
              professional products.
            </p>
          </div>
          <div className="relative h-[500px] group">
            <Image
              src="/customers/pretty-cute-young-woman-with-long-brunette-hair-smiling-camera-hairdresser-salon_197531-3664.jpg"
              alt="Happy client at Royal Glow Salon"
              fill
              className="object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#C69C6D] flex items-center justify-center">
              <div className="text-white text-center">
                <p className="text-3xl font-serif font-bold">5★</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Rated</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#3E2723] py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Our Features</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">
              We combine technology, expertise, and luxury to deliver an unmatched salon experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {aboutFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 p-8 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="text-[#C69C6D] mb-5 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-white font-serif text-lg mb-3">{feature.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Our Services</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              A curated selection of premium hair care and styling services for every occasion.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {aboutServices.map((group) => (
              <div key={group.category} className="bg-white border border-stone-100 shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-serif text-[#3E2723] mb-6 pb-4 border-b border-stone-100 flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#C69C6D]/10 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  {group.category}
                </h3>
                <ul className="space-y-4">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-stone-600">
                      <span className="w-1.5 h-1.5 bg-[#C69C6D] rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/services"
                  className="inline-block mt-6 text-[#C69C6D] text-xs uppercase tracking-widest font-semibold hover:text-[#B38759] transition-colors border-b border-[#C69C6D]/30 pb-0.5"
                >
                  View Full Menu →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Look Book Section */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">Inspiration</p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Look Book</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              Browse through our portfolio of stunning transformations and styles crafted by our expert team.
            </p>
          </div>
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {lookBookImages.map((img, idx) => (
              <div
                key={idx}
                className="break-inside-avoid group cursor-pointer relative overflow-hidden"
                onClick={() => setSelectedImage(idx)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={600}
                  height={400}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedImage((selectedImage - 1 + lookBookImages.length) % lookBookImages.length); }}
            className="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedImage((selectedImage + 1) % lookBookImages.length); }}
            className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="max-w-4xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lookBookImages[selectedImage].src}
              alt={lookBookImages[selectedImage].alt}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto object-contain"
            />
            <p className="text-center text-white/60 text-sm mt-4 tracking-wide">
              {lookBookImages[selectedImage].alt} — {selectedImage + 1} / {lookBookImages.length}
            </p>
          </div>
        </div>
      )}

      {/* Salon Details / Contact Section */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">Get in Touch</p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Visit Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Location */}
            <div className="bg-white border border-stone-100 p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-14 h-14 bg-[#C69C6D]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-6 h-6 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg mb-2">Location</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Matara, Sri Lanka
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white border border-stone-100 p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-14 h-14 bg-[#C69C6D]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-6 h-6 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg mb-2">Call Us</h3>
              <a href="tel:+94771234567" className="text-stone-500 text-sm hover:text-[#C69C6D] transition-colors">
                +94 77 123 4567
              </a>
            </div>

            {/* Hours */}
            <div className="bg-white border border-stone-100 p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-14 h-14 bg-[#C69C6D]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-6 h-6 text-[#C69C6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg mb-2">Working Hours</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Mon – Sat: 9:00 AM – 8:00 PM<br />
                Sunday: Closed
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

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
