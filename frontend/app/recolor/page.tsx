"use client";
import { useState } from "react";
import Link from "next/link";

export default function Recolor() {
  const [file, setFile] = useState<File | null>(null);
  const [color, setColor] = useState("4A3022");
  const [colorName, setColorName] = useState("Dark Brown");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ originalUrl: string; recoloredUrl: string; appliedColor?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("color", color);

    try {
      const response = await fetch("http://localhost:5000/api/recolor-hair", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Failed to process image";
        try {
          const errData = await response.json();
          message = [errData?.error, errData?.details].filter(Boolean).join(" ") || message;
        } catch {
          // keep fallback message when response body is not JSON
        }
        throw new Error(message);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const PRESET_COLORS = [
    { name: "Blonde", val: "CAA36B", tw: "bg-[#CAA36B]", hex: "CAA36B" },
    { name: "Light Brown", val: "8A5F46", tw: "bg-[#8A5F46]", hex: "8A5F46" },
    { name: "Dark Brown", val: "4A3022", tw: "bg-[#4A3022]", hex: "4A3022" },
    { name: "Auburn", val: "8D3127", tw: "bg-[#8D3127]", hex: "8D3127" },
    { name: "Ginger", val: "B55A2A", tw: "bg-[#B55A2A]", hex: "B55A2A" },
    { name: "Black", val: "2A211E", tw: "bg-[#2A211E]", hex: "2A211E" },
    { name: "Silver", val: "AEB1B3", tw: "bg-[#AEB1B3]", hex: "AEB1B3" },
    { name: "Burgundy", val: "4D1A1C", tw: "bg-[#4D1A1C]", hex: "4D1A1C" },
    { name: "Chestnut", val: "7B4C37", tw: "bg-[#7B4C37]", hex: "7B4C37" },
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-rose-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="text-pink-500 hover:text-pink-600 font-semibold transition-colors"
          >
            ← Back to Chat
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">AI Hair Recolor 🎨</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-pink-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload your photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Natural Hair Color
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.val}
                    type="button"
                    onClick={() => {
                      setColor(c.val);
                      setColorName(c.name);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                      color === c.val ? "border-pink-500 bg-pink-50" : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full shadow-inner border border-gray-200`}
                      style={{ backgroundColor: `#${c.hex}` }}
                    />
                    <span className="text-xs text-center text-gray-600 font-medium">
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                Or type a custom color (hex code or color name)
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setColorName("Custom");
                }}
                placeholder="e.g., blonde, 8D3127, chestnut"
                className="w-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none px-4 py-2 rounded-xl text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-2">
                Tip: output is auto-balanced to natural salon-like tones.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-linear-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {loading ? "Processing..." : "Generate Magic ✨"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="grid md:grid-cols-2 gap-8 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-pink-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Original Photo</h3>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={result.originalUrl}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-pink-100">
              <h3 className="text-lg font-semibold text-pink-600 mb-4 text-center">New Hair Color ({colorName})</h3>
              {result.appliedColor && (
                <p className="text-center text-xs text-gray-500 mb-3">
                  Applied realistic tone: #{result.appliedColor}
                </p>
              )}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={result.recoloredUrl}
                  alt="Recolored"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}