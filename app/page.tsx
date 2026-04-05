"use client";
import { useState } from "react";

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
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      
      setChatLog((prev) => [...prev, { role: "bella", text: data.text }]);
    } catch (error) {
      console.error("Error:", error);
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
    <main className="min-h-screen bg-linear-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="max-w-2xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-rose-400 via-pink-400 to-purple-400 text-white px-6 py-8 shadow-lg rounded-b-3xl">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">✨</span>
            <h1 className="text-4xl font-bold text-center">Royal Glow Salon</h1>
            <span className="text-3xl">✨</span>
          </div>
          <p className="text-center text-pink-100 text-sm">Chat with Bella - Your Beauty Consultant</p>
        </div>

        {/* Chat Container */}
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
                      ? "bg-linear-to-r from-rose-400 to-pink-400 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-pink-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-md border border-pink-200">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-pink-200 bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-t-3xl shadow-lg">
          <div className="flex gap-3">
            <input
              className="flex-1 border-2 border-pink-200 focus:border-pink-400 focus:outline-none px-4 py-3 rounded-2xl bg-white placeholder-gray-400 text-gray-800 transition-colors duration-300"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Bella about services, pricing, or book an appointment..."
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-linear-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}