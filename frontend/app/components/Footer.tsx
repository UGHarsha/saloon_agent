import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#2D1C19] text-stone-400">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <p className="text-white font-serif text-xl mb-4 tracking-wide">Royal Glow</p>
                        <p className="text-xs leading-relaxed mb-6">
                            Premium hair care and styling services in Matara, Sri Lanka. Where luxury meets artistry.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-9 h-9 border border-stone-700 flex items-center justify-center hover:border-[#C69C6D] hover:text-[#C69C6D] transition-colors" aria-label="Facebook">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                            </a>
                            <a href="#" className="w-9 h-9 border border-stone-700 flex items-center justify-center hover:border-[#C69C6D] hover:text-[#C69C6D] transition-colors" aria-label="Instagram">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="1.5" /><circle cx="12" cy="12" r="5" strokeWidth="1.5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" /></svg>
                            </a>
                            <a href="#" className="w-9 h-9 border border-stone-700 flex items-center justify-center hover:border-[#C69C6D] hover:text-[#C69C6D] transition-colors" aria-label="WhatsApp">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white text-xs uppercase tracking-[0.15em] font-semibold mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-sm hover:text-[#C69C6D] transition-colors">Home</Link></li>
                            <li><Link href="/#about" className="text-sm hover:text-[#C69C6D] transition-colors">About Us</Link></li>
                            <li><Link href="/services" className="text-sm hover:text-[#C69C6D] transition-colors">Services</Link></li>
                            <li><Link href="/reviews" className="text-sm hover:text-[#C69C6D] transition-colors">Reviews</Link></li>
                            <li><Link href="/recolor" className="text-sm hover:text-[#C69C6D] transition-colors">Virtual Try-On</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white text-xs uppercase tracking-[0.15em] font-semibold mb-6">Contact</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5 text-[#C69C6D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span>Beach Road, Matara<br />Sri Lanka</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#C69C6D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span>+94 41 222 3456</span>
                            </li>
                        </ul>
                    </div>

                    {/* Hours */}
                    <div>
                        <h4 className="text-white text-xs uppercase tracking-[0.15em] font-semibold mb-6">Hours</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between"><span>Mon – Sat</span><span className="text-stone-300">9AM – 8PM</span></li>
                            <li className="flex justify-between"><span>Sunday</span><span className="text-stone-300">10AM – 4PM</span></li>
                        </ul>
                        <div className="mt-8">
                            <Link
                                href="/?book=true"
                                className="inline-block bg-[#C69C6D] text-white text-xs uppercase tracking-[0.15em] font-semibold px-6 py-3 hover:bg-[#B38759] transition-colors"
                            >
                                Book Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-stone-800">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p>© {new Date().getFullYear()} Royal Glow Salon. All Rights Reserved.</p>
                    <p className="text-stone-500">Crafted with care in Matara, Sri Lanka</p>
                </div>
            </div>
        </footer>
    );
}
