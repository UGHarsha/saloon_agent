"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

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
                <div className="relative bg-gradient-to-br from-[#C69C6D] to-[#A0735B] text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                </div>
            </div>
        </Link>
    );
}
