"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

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
          history: chatLog, // Send full conversation history
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Normalize server error message (strip any leading 'Error:' prefix)
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

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-emerald-600 text-white px-6 py-8 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center justify-center gap-3 flex-1">
              <span className="text-3xl">✨</span>
              <h1 className="text-4xl font-bold text-center">Royal Glow Salon</h1>
              <span className="text-3xl">✨</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/recolor"
                className="bg-emerald-500 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium"
                title="Try hair color change"
              >
                🎨 Color
              </Link>
              <Link
                href="/bookings"
                className="bg-emerald-500 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                title="View all appointments"
              >
                📅
              </Link>
            </div>
          </div>
          <p className="text-center text-emerald-100 text-sm">Chat with Bella - Your Beauty Consultant</p>
        </div>          {/* Chat Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4">💇‍♀️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Royal Glow</h2>
                <p className="text-gray-600 max-w-xs">Start a conversation with Bella to explore our premium salon services and book your appointment!</p>
              </div>
            ) : (
              chatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md transition-all duration-300 ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-md border border-gray-200">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex gap-3">
              <input
                className="flex-1 border-2 border-gray-300 focus:border-emerald-600 focus:outline-none px-4 py-3 rounded-2xl bg-white placeholder-gray-400 text-gray-800 transition-colors duration-300"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Bella about services, pricing, or book an appointment..."
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
              >
                {loading ? "..." : "Send"}
              </button>
          </div>
        </div>
      </div>
    </main>
  );
}