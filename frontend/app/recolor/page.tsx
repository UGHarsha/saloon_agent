"use client";
import { useState } from "react";

export default function Recolor() {
  const [file, setFile] = useState<File | null>(null);
  const [color, setColor] = useState("dark brown");
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
          
        }
        // Strip any redundant 'Error:' prefix coming from the server so the UI shows a clean message
        message = message.replace(/^Error:\s*/i, "");
        throw new Error(message);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: unknown) {
      // Normalize the error message so it doesn't include a redundant 'Error:' prefix
      let message = "Something went wrong";
      if (err instanceof Error) {
        message = err.message || message;
      } else if (typeof err === "string") {
        message = err;
      }

      message = message.replace(/^Error:\s*/i, "");
      setError(message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const PRESET_COLORS = [
    { name: "Blonde", val: "blonde", hex: "CAA36B" },
    { name: "Light Brown", val: "light brown", hex: "8A5F46" },
    { name: "Dark Brown", val: "dark brown", hex: "4A3022" },
    { name: "Auburn", val: "auburn", hex: "8D3127" },
    { name: "Ginger", val: "ginger", hex: "B55A2A" },
    { name: "Black", val: "black", hex: "2A211E" },
    { name: "Silver", val: "silver", hex: "AEB1B3" },
    { name: "Burgundy", val: "burgundy", hex: "4D1A1C" },
    { name: "Chestnut", val: "chestnut", hex: "7B4C37" },
  ];

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans pt-32 pb-16 px-6 text-[#3E2723]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">Virtual Salon</p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#3E2723] mb-6">Hair Color Studio</h1>
          <div className="w-16 h-px bg-stone-300 mx-auto"></div>
        </div>

        <div className="bg-white p-8 md:p-12 mb-16 border border-stone-100 shadow-sm max-w-3xl mx-auto relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#C69C6D] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-stone-500 mb-4 font-semibold">
                Upload your photo
              </label>
              <div className="border border-stone-200 border-dashed p-8 text-center bg-stone-50 hover:bg-white hover:border-[#C69C6D] transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-[#3E2723] font-serif text-lg block mb-2">
                  {file ? file.name : "Select an Image"}
                </span>
                <span className="text-stone-400 text-xs tracking-widest uppercase">
                  {file ? "Change Image" : "Drag and drop or click to upload"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-stone-500 mb-4 font-semibold">
                Select a Natural Hair Color
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.val}
                    type="button"
                    onClick={() => {
                      setColor(c.val);
                      setColorName(c.name);
                    }}
                    className={`flex flex-col items-center gap-3 p-4 border transition-all duration-300 ${
                      color === c.val ? "border-[#C69C6D] bg-[#FDFBF7] shadow-sm" : "border-stone-200 bg-white hover:border-[#C69C6D]"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full shadow-inner border border-stone-200`}
                      style={{ backgroundColor: `#${c.hex}` }}
                    />
                    <span className={`text-[10px] text-center uppercase tracking-wider ${color === c.val ? "text-[#3E2723] font-bold" : "text-stone-500"}`}>
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>

              <label className="block text-xs uppercase tracking-[0.15em] text-stone-500 mb-2 font-semibold">
                Or type a custom color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setColorName("Custom");
                }}
                placeholder="e.g., blonde, 8D3127, chestnut"
                className="w-full border-b border-stone-300 focus:border-[#C69C6D] focus:outline-none px-0 py-3 bg-transparent text-[#3E2723] placeholder-stone-400 text-sm transition-colors font-serif"
              />
              <p className="text-xs text-stone-400 mt-3 font-light tracking-wide">
                Tip: output is auto-balanced to natural salon-like tones.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-[#C69C6D] text-white px-8 py-4 tracking-[0.15em] uppercase text-sm font-medium hover:bg-[#B38759] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
            >
              {loading ? "Processing..." : "Generate Magic"}
            </button>
          </form>

          {error && (
            <div className="mt-8 p-4 bg-red-50 text-red-700 text-xs tracking-widest uppercase border border-red-100 text-center font-semibold">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="grid md:grid-cols-2 gap-10 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-white p-8 shadow-sm border border-stone-100">
              <h3 className="text-xl font-serif text-[#3E2723] mb-6 text-center">Original Photo</h3>
              <div className="relative aspect-square overflow-hidden bg-stone-50 border border-stone-200/50">
                <img
                  src={result.originalUrl}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="bg-white p-8 shadow-sm border border-stone-100">
              <h3 className="text-xl font-serif text-[#3E2723] mb-2 text-center">New Tone: {colorName}</h3>
              {result.appliedColor && (
                <p className="text-center text-[10px] tracking-widest uppercase text-[#C69C6D] mb-4 font-bold">
                  Color Match: #{result.appliedColor}
                </p>
              )}
              <div className="relative aspect-square overflow-hidden bg-stone-50 border border-stone-200/50">
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