import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#3E2723] text-stone-400 py-12 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <p className="text-stone-300 font-serif text-lg mb-2">Royal Glow Salon</p>
                    <p className="text-xs">Experience luxury hair care and styling services.</p>
                </div>

                <div className="flex gap-6 text-sm">
                    <Link href="/" className="hover:text-[#C69C6D] transition-colors">Home</Link>
                    <Link href="/services" className="hover:text-[#C69C6D] transition-colors">Services</Link>
                    <Link href="/reviews" className="hover:text-[#C69C6D] transition-colors">Reviews</Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto border-t border-stone-800 mt-8 pt-8 text-center text-xs">
                <p>© {new Date().getFullYear()} Our Salon. All Rights Reserved.</p>
            </div>
        </footer>
    );
}
