import Link from "next/link";

export default function AIBotButton() {
    return (
        <Link href="/?book=ai"
            className="fixed bottom-8 right-8 bg-[#3E2723] text-white p-0 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center group w-16 h-16 border-2 border-white/20"
            aria-label="Consult AI Assistant"
        >
            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-[#C69C6D] animate-ping opacity-20 group-hover:opacity-40"></span>

            {/* Bot Icon */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">✨</span>

                {/* Status indicator */}
                <span className="absolute bottom-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-[#3E2723]"></span>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute right-full mr-4 bg-white text-[#3E2723] px-4 py-2 text-[10px] font-black rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 uppercase tracking-[0.2em] whitespace-nowrap border border-stone-100">
                <p className="text-[#C69C6D]">Online</p>
                Chat with Bella
            </div>
        </Link>
    );
}

