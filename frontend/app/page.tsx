"use client";
import { useState, useEffect, FormEvent, KeyboardEvent, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../utils/supabase";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingView, setBookingView] = useState<"none" | "ai" | "manual">("none");
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

  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("book") === "true") {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setBookingView("manual");
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
  };

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    setManualSuccess(false);

    // Combine date and time
    const dateTimeString = `${manualForm.date}T${
      manualForm.time === "10:00 AM" ? "10:00:00" :
      manualForm.time === "1:00 PM" ? "13:00:00" :
      manualForm.time === "3:00 PM" ? "15:00:00" : "12:00:00"
    }`;

    try {
      const { error } = await supabase.from("bookings").insert([
        {
          customer_name: manualForm.name,
          service: manualForm.service,
          appointment_date: new Date(dateTimeString).toISOString(),
        },
      ]);
      if (error) throw error;
      setManualSuccess(true);
      setManualForm({ ...manualForm, name: "" }); // Reset some fields
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setManualLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

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
                        <input type="text" required value={manualForm.name} onChange={(e) => setManualForm({...manualForm, name: e.target.value})} className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-3 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors font-serif placeholder-stone-300" placeholder="Jane Doe"/>
                      </div>
                      
                      {/* Service select */}
                      <div className="mb-4">
                        <label className="block text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">Category</label>
                        <select
                          value={manualForm.category}
                          onChange={(e) => setManualForm({...manualForm, category: e.target.value, service: e.target.value === 'men' ? 'Adult Buzz Cut 60 min (Rs. 5000+)' : 'Women\'s Haircut (Rs. 6000+)'})}
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
                          onChange={(e) => setManualForm({...manualForm, service: e.target.value})}
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
                          <input type="date" required value={manualForm.date} onChange={(e) => setManualForm({...manualForm, date: e.target.value})} className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-3 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors font-serif"/>
                        </div>
                        <div>
                          <label className="block text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">Time</label>
                          <select value={manualForm.time} onChange={(e) => setManualForm({...manualForm, time: e.target.value})} className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-3 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors font-serif appearance-none">
                            <option>10:00 AM</option>
                            <option>1:00 PM</option>
                            <option>3:00 PM</option>
                          </select>
                        </div>
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
                          className={`max-w-[85%] px-5 py-4 rounded-2xl transition-all duration-300 shadow-sm ${
                            msg.role === "user"
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
              className={`object-cover object-center transition-opacity duration-1000 ${
                idx === currentHeroSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-1000" />
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
      
      {/* Footer */}
      <footer className="bg-[#3E2723] text-stone-400 py-12 px-6">
        <div className="max-w-6xl mx-auto border-t border-stone-800 pt-8 text-center text-xs">
          <p>Â© {new Date().getFullYear()} Our Salon. All Rights Reserved.</p>
        </div>
      </footer>
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
