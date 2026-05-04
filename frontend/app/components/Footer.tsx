import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-[#1A1A1A] text-stone-500 py-24 px-6 border-t border-stone-800">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

                    {/* Brand */}
                    <div className="space-y-8">
                        <Link href="/" className="inline-block">
                            <Image src="/wite.png" alt="Royal Glow" width={80} height={80} style={{ width: "auto" }} className="mb-4 opacity-80" />
                            <h2 className="text-white font-serif text-2xl tracking-[0.2em] uppercase">Royal Glow</h2>
                        </Link>
                        <p className="text-sm font-light leading-relaxed max-w-xs">
                            Elevating the standard of beauty in Matara. We combine traditional artistry with modern innovation to create timeless transformations.
                        </p>
                        <div className="flex gap-4">
                            {["facebook", "instagram", "twitter"].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="w-10 h-10 rounded-full border border-stone-800 flex items-center justify-center hover:border-[#C69C6D] hover:text-[#C69C6D] transition-all group"
                                >
                                    <span className="text-[10px] uppercase tracking-tighter opacity-70 group-hover:opacity-100 font-bold">{social.charAt(0)}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-8">
                        <h4 className="text-white text-[10px] uppercase tracking-[0.3em] font-bold">The House</h4>
                        <ul className="space-y-4">
                            {["Home", "About", "Services", "Reviews", "Virtual Try-On"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={item === "Home" ? "/" : item === "About" ? "/#about" : `/${item.toLowerCase().replace(/ /g, "-")}`}
                                        className="text-sm hover:text-[#C69C6D] transition-colors font-light"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-8">
                        <h4 className="text-white text-[10px] uppercase tracking-[0.3em] font-bold">Inquiries</h4>
                        <ul className="space-y-6 text-sm font-light">
                            <li className="flex gap-4">
                                <span className="text-[#C69C6D] shrink-0 font-bold">A</span>
                                <span>Beach Road, Matara<br />Sri Lanka</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-[#C69C6D] shrink-0 font-bold">T</span>
                                <span>+94 41 222 3456</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-[#C69C6D] shrink-0 font-bold">E</span>
                                <span className="border-b border-stone-800 pb-1">concierge@royalglow.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Appointment */}
                    <div className="space-y-8">
                        <h4 className="text-white text-[10px] uppercase tracking-[0.3em] font-bold">Availability</h4>
                        <div className="space-y-4 text-sm font-light">
                            <div className="flex justify-between border-b border-stone-800/50 pb-2">
                                <span>Mon — Sat</span>
                                <span className="text-white">9:00 — 20:00</span>
                            </div>
                            <div className="flex justify-between border-b border-stone-800/50 pb-2">
                                <span>Sunday</span>
                                <span className="text-white">10:00 — 16:00</span>
                            </div>
                        </div>
                        <Link
                            href="/?book=true"
                            className="inline-block bg-white text-[#1A1A1A] px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-[#C69C6D] hover:text-white transition-all shadow-2xl"
                        >
                            Reserve Now
                        </Link>
                    </div>

                </div>

                <div className="pt-12 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-600">
                    <p>© {new Date().getFullYear()} Royal Glow Salon</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-stone-400">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-stone-400">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
