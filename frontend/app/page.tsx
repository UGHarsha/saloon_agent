"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (showChat) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-2xl mx-auto h-[calc(100vh-64px)] flex flex-col bg-white shadow-sm border-x border-stone-100">
          {/* Header */}
          <div className="bg-white border-b border-stone-100 px-6 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-serif text-stone-900 tracking-wide">Consultation</h1>
              <p className="text-stone-500 text-sm mt-1">Speak with our stylist assistant</p>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-sm uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Chat Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-serif text-stone-900 mb-2">Welcome to Royal Glow</h2>
                <p className="text-stone-500 text-sm max-w-sm leading-relaxed">
                  How can we assist you today? Ask about our specialized treatments, pricing, or let us help you find the perfect appointment time.
                </p>
              </div>
            ) : (
              chatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-4 rounded-2xl transition-all duration-300 ${
                      msg.role === "user"
                        ? "bg-stone-900 text-white rounded-br-none"
                        : "bg-stone-100 text-stone-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-stone-100 text-stone-800 px-5 py-4 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1.5 items-center h-5">
                    <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-stone-100">
            <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-full border border-stone-200 focus-within:border-stone-400 focus-within:ring-1 focus-within:ring-stone-400 transition-all">
              <input
                className="flex-1 bg-transparent border-none focus:outline-none px-4 py-2 text-stone-800 placeholder-stone-400 text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-stone-900 disabled:bg-stone-300 text-white rounded-full p-2.5 transition-colors"
                aria-label="Send message"
              >
                <svg className="w-5 h-5 translate-x-px translate-y-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 font-sans">
      {/* Hero Section */}
      <section className="relative text-white py-32 px-6 md:py-48 flex items-center justify-center min-h-[90vh] overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2000&auto=format&fit=crop" 
            alt="Luxury Salon Interior" 
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <p className="text-stone-100 tracking-[0.2em] uppercase text-xs mb-6 font-light">Discover Luxury</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-tight tracking-tight">
            Refined <br/> Elegance
          </h1>
          <p className="text-stone-50 max-w-2xl mx-auto mb-12 text-base md:text-lg font-light leading-relaxed">
            Experience the pinnacle of modern styling and personalized beauty at Royal Glow Salon.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/bookings"
              className="bg-white text-black px-8 py-3.5 tracking-[0.15em] uppercase text-sm font-medium hover:bg-stone-100 transition-all duration-300"
            >
              Book Appointment
            </Link>
            <button
              onClick={() => setShowChat(true)}
              className="text-white px-8 py-3.5 tracking-[0.15em] uppercase text-sm font-medium border border-white/50 backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              Consult Now
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto py-24 px-6">
        <div className="text-center mb-16">
          <p className="text-stone-500 tracking-[0.2em] uppercase text-xs mb-4">Excellence</p>
          <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">Our Services</h2>
          <div className="w-16 h-px bg-stone-300 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
          {/* Feature 1 */}
          <div className="group cursor-pointer">
            <div className="bg-stone-200 aspect-4/5 mb-6 overflow-hidden relative border border-stone-300 transition-all duration-500 group-hover:border-stone-500 group-hover:shadow-xl">
              <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/5 transition-colors duration-500"></div>
              <div className="absolute flex items-center justify-center w-full h-full text-stone-400 text-xs tracking-[0.15em] uppercase">
                Hair Design
              </div>
            </div>
            <h3 className="text-lg font-serif text-stone-900 mb-2">Precision Cutting</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4 font-light">
              Expertly tailored cuts that enhance your natural features with modern precision.
            </p>
            <Link href="/bookings" className="text-stone-900 text-xs tracking-[0.15em] uppercase hover:text-stone-600 transition-colors border-b border-stone-400 pb-1 inline-block">
              Learn More →
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="group cursor-pointer">
            <div className="bg-stone-200 aspect-4/5 mb-6 overflow-hidden relative border border-stone-300 transition-all duration-500 group-hover:border-stone-500 group-hover:shadow-xl">
              <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/5 transition-colors duration-500"></div>
              <div className="absolute flex items-center justify-center w-full h-full text-stone-400 text-xs tracking-[0.15em] uppercase">
                Color Studio
              </div>
            </div>
            <h3 className="text-lg font-serif text-stone-900 mb-2">Artisan Color</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4 font-light">
              Sophisticated color transformations previewed virtually before commitment.
            </p>
            <Link href="/recolor" className="text-stone-900 text-xs tracking-[0.15em] uppercase hover:text-stone-600 transition-colors border-b border-stone-400 pb-1 inline-block">
              Try Virtual →
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="group cursor-pointer">
            <div className="bg-stone-200 aspect-4/5 mb-6 overflow-hidden relative border border-stone-300 transition-all duration-500 group-hover:border-stone-500 group-hover:shadow-xl">
              <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/5 transition-colors duration-500"></div>
              <div className="absolute flex items-center justify-center w-full h-full text-stone-400 text-xs tracking-[0.15em] uppercase">
                Consultation
              </div>
            </div>
            <h3 className="text-lg font-serif text-stone-900 mb-2">Expert Guidance</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4 font-light">
              Personalized beauty advice tailored to your unique profile and goals.
            </p>
            <button onClick={() => setShowChat(true)} className="text-stone-900 text-xs tracking-[0.15em] uppercase hover:text-stone-600 transition-colors border-b border-stone-400 pb-1 inline-block">
              Chat Now →
            </button>
          </div>
        </div>
      </section>

      {/* Philosophy/Stats Section */}
      <section className="bg-stone-200 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-serif text-stone-900 mb-8 leading-relaxed italic">
            &quot;Beauty is about refining what makes you unique, rather than masking it behind trends.&quot;
          </h2>
          <div className="grid grid-cols-3 gap-8 border-t border-stone-300 pt-12 mt-12">
            <div>
              <p className="text-3xl font-serif text-stone-900 mb-2">15+</p>
              <p className="text-xs uppercase tracking-[0.15em] text-stone-500">Years Excellence</p>
            </div>
            <div>
              <p className="text-3xl font-serif text-stone-900 mb-2">Curated</p>
              <p className="text-xs uppercase tracking-[0.15em] text-stone-500">Premium Products</p>
            </div>
            <div>
              <p className="text-3xl font-serif text-stone-900 mb-2">4.9★</p>
              <p className="text-xs uppercase tracking-[0.15em] text-stone-500">Client Adoration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-xl text-stone-100 tracking-widest">ROYAL GLOW</div>
          <div className="flex gap-8 text-xs tracking-[0.15em] uppercase">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-stone-800 mt-12 pt-8 text-center md:text-left text-xs text-stone-600 flex flex-col md:flex-row justify-between">
          <p>© {new Date().getFullYear()} Royal Glow Salon. All Rights Reserved.</p>
          <p className="mt-2 md:mt-0">Elevating beauty through expertise.</p>
        </div>
      </footer>
    </main>
  );
}
