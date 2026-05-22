"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AIBotButton() {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <Link href="/?book=ai"
            className="fixed bottom-6 right-6 z-50 group"
            aria-label="Consult AI Assistant"
        >
            <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 bg-[#C69C6D] rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500 scale-110" />
                {/* Button */}
                <div className="relative bg-linear-to-br from-[#C69C6D] to-[#A0735B] text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex items-center justify-center">
                    <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M21 11.5C21 16.194 16.97 20 12 20C10.846 20 9.744 19.796 8.739 19.425L4 21L5.532 17.186C4.584 15.947 4 14.411 4 12.75C4 8.056 8.03 4.25 13 4.25C17.97 4.25 22 8.056 22 12.75"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
