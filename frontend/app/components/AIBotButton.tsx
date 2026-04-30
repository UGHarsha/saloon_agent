import Link from "next/link";

export default function AIBotButton() {
    return (
        <Link href="/?book=ai"
            className="fixed bottom-8 right-8 bg-[#C69C6D] text-white p-4 rounded-full shadow-2xl hover:bg-[#B38759] transition-all duration-300 z-50 flex items-center justify-center group"
            aria-label="Consult AI Assistant"
        >
            {/* Message/Bot Icon */}
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>

            {/* Tooltip on hover */}
            <span className="absolute right-full mr-4 bg-white text-[#3E2723] px-3 py-1.5 text-xs font-semibold rounded-md shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">
                Consult AI
            </span>
        </Link>
    );
}
