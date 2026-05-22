"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, Clock, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ServicesPage() {
    const [servicesData, setServicesData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"women" | "men">("women");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchServices() {
            try {
                const response = await fetch("http://localhost:5000/api/services");
                if (response.ok) {
                    const data = await response.json();
                    setServicesData(data);
                }
            } catch (err) {
                console.error("Error fetching services:", err);
            }
        }
        fetchServices();
    }, []);

    const filteredServices = servicesData.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const menServices = filteredServices.filter(s => s.category.startsWith("Men") || s.category === "Men");
    const womenServices = filteredServices.filter(s => s.category.startsWith("Women") || s.category === "Women");

    const menSubcategories = ["Face", "Hair", "Bridal Full"];
    const womenSubcategories = ["Face", "Hair", "Nails", "Bridal Full"];

    const currentServices = activeTab === "men" ? menServices : womenServices;
    const currentSubcategories = activeTab === "men" ? menSubcategories : womenSubcategories;

    return (
        <main className="min-h-screen bg-[#FDFBF7] font-sans text-[#3E2723]">
            {/* Hero Header */}
            <section className="relative h-[55vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
                <Image src="/salon.jpg" alt="Luxury Salon Interior" fill className="object-cover scale-105" />
                {/* Dark overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1A1210]/70 via-[#1A1210]/50 to-[#FDFBF7] z-[1]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A1210]/40 via-transparent to-[#1A1210]/40 z-[1]" />
                {/* Decorative blobs */}
                <div className="absolute top-1/3 -left-20 w-72 h-72 bg-[#C69C6D]/10 rounded-full blur-[100px] z-[1] animate-blob" />
                <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-[#C69C6D]/8 rounded-full blur-[80px] z-[1] animate-blob" style={{ animationDelay: "3s" }} />

                <div className="relative z-10 text-center px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
                    >
                        <Sparkles className="w-3 h-3 text-[#C69C6D]" />
                        <span className="text-[10px] tracking-[0.3em] uppercase font-medium text-white/80">The Menu</span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-tight"
                    >
                        Our <span className="italic gradient-text">Services</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                        className="max-w-xl mx-auto text-white/50 text-sm md:text-base font-light leading-relaxed"
                    >
                        Discover our curated treatments designed for the modern individual.
                    </motion.p>
                </div>
            </section>

            {/* Services Content */}
            <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto min-h-[800px]">
                {/* Tabs & Search */}
                <div className="flex flex-col items-center mb-16 space-y-8">
                    {/* Tab Switcher */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="inline-flex p-1.5 rounded-full bg-white border border-stone-200/80 shadow-sm"
                    >
                        {(["women", "men"] as const).map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`relative px-8 md:px-12 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${activeTab === tab
                                    ? "bg-[#3E2723] text-white shadow-lg"
                                    : "text-stone-400 hover:text-[#3E2723]"
                                    }`}
                            >
                                {tab === "women" ? (
                                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>Women&apos;s Styling</>
                                ) : (
                                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>Men&apos;s Grooming</>
                                )}
                            </button>
                        ))}
                    </motion.div>

                    {/* Search */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="w-full max-w-lg relative"
                    >
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-stone-400" />
                        </div>
                        <input type="text" placeholder="Search treatments..."
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="booking-input pl-12 pr-6 !py-4 !rounded-2xl shadow-sm text-sm text-stone-600 placeholder-stone-400"
                        />
                    </motion.div>
                </div>

                {/* Services Grid */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-5xl mx-auto"
                    >
                        {currentServices.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-[#C69C6D]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6">
                                    <Search className="w-8 h-8 text-[#C69C6D]" />
                                </div>
                                <p className="text-stone-400 text-lg font-light mb-2">
                                    {servicesData.length === 0 ? "Loading services..." : "No services found"}
                                </p>
                                <p className="text-stone-300 text-sm">
                                    {servicesData.length === 0 ? "Connecting to salon database..." : "Try adjusting your search query."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-14">
                                {currentSubcategories.map((subcat, catIdx) => {
                                    const prefix = activeTab === "men" ? "Men" : "Women";
                                    const subServices = currentServices.filter(s =>
                                        s.category === `${prefix} - ${subcat}` || (subcat === 'Hair' && s.category === prefix)
                                    );
                                    if (subServices.length === 0) return null;
                                    return (
                                        <motion.div key={subcat}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: catIdx * 0.1 }}
                                        >
                                            {/* Subcategory Header */}
                                            <div className="flex items-center gap-4 mb-7">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C69C6D]/20 to-[#C69C6D]/5 flex items-center justify-center">
                                                    <span className="text-[#C69C6D] text-xs font-bold">{String(catIdx + 1).padStart(2, '0')}</span>
                                                </div>
                                                <h3 className="text-xl font-serif text-[#3E2723]">{subcat}</h3>
                                                <div className="flex-1 h-px bg-gradient-to-r from-stone-200 to-transparent" />
                                                <span className="text-[9px] uppercase tracking-[0.15em] text-stone-300 font-bold">{subServices.length} {subServices.length === 1 ? 'service' : 'services'}</span>
                                            </div>

                                            {/* Service Cards */}
                                            <div className="grid gap-4">
                                                {subServices.map((service, idx) => (
                                                    <motion.div key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: catIdx * 0.1 + idx * 0.05 }}
                                                        className="group bg-white rounded-2xl border border-stone-100 p-6 md:p-8 hover:shadow-[0_20px_60px_-20px_rgba(198,156,109,0.15)] hover:border-[#C69C6D]/20 transition-all duration-500 relative overflow-hidden"
                                                    >
                                                        {/* Accent bar */}
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#C69C6D] to-transparent rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                            <div className="flex-1">
                                                                <h4 className="text-lg font-serif text-[#3E2723] group-hover:text-[#C69C6D] transition-colors duration-300 mb-1.5">
                                                                    {service.name}
                                                                </h4>
                                                                <p className="text-stone-400 text-sm leading-relaxed font-light">
                                                                    {service.description || "A professional service tailored to your style."}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-4 md:text-right shrink-0">
                                                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FDFBF7] border border-stone-50 text-stone-400">
                                                                    <Clock className="w-3.5 h-3.5 text-[#C69C6D]" />
                                                                    <span className="text-xs font-medium">{service.duration} min</span>
                                                                </div>
                                                                <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C69C6D]/10 to-[#C69C6D]/5 text-[#C69C6D] font-bold text-sm border border-[#C69C6D]/10">
                                                                    Rs. {service.price}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </section>

            {/* Expert Tip - Redesigned */}
            <section className="py-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-white to-[#FDFBF7]" />
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="max-w-4xl mx-auto relative"
                >
                    <div className="bg-gradient-to-br from-[#1A1210] to-[#2A1E1A] rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-60 h-60 bg-[#C69C6D]/10 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#C69C6D]/5 rounded-full blur-[60px]" />

                        <div className="grid md:grid-cols-[1fr_300px] gap-0">
                            <div className="p-10 md:p-14 relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C69C6D]/10 mb-6">
                                    <span className="text-xl">💡</span>
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#C69C6D] font-bold">Expert Tip</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-serif text-white mb-4 leading-tight">The Style <span className="gradient-text">Recommendation</span></h3>
                                <p className="text-stone-400 italic text-sm leading-relaxed mb-8 max-w-md">
                                    &quot;For first-time color transformations, we always recommend a consultation 48 hours prior. This allows us to perfectly plan your color map.&quot;
                                </p>
                                <Link href="/?book=ai"
                                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#C69C6D] to-[#A0735B] text-white px-6 py-3 rounded-full tracking-[0.12em] uppercase text-[10px] font-bold hover:shadow-[0_0_30px_rgba(198,156,109,0.3)] transition-all duration-500 hover:scale-105 active:scale-95 group"
                                >
                                    <span className="text-sm">✨</span>
                                    Consult with Bella AI
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            {/* Right image */}
                            <div className="hidden md:block relative">
                                <Image src="/salon-booking.png" alt="Expert Styling" fill className="object-cover opacity-40" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#1A1210] via-[#1A1210]/60 to-transparent" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Booking CTA - Redesigned */}
            <section className="py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white to-[#FDFBF7]" />
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C69C6D]/10 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C69C6D] animate-pulse" />
                        <span className="text-[#C69C6D] tracking-[0.2em] uppercase text-[10px] font-bold">Ready?</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif text-[#3E2723] mb-4">Reserve Your <span className="gradient-text italic">Moment</span></h2>
                    <p className="text-stone-400 mb-10 max-w-md mx-auto font-light text-sm leading-relaxed">
                        Join us for a transformation that goes beyond the mirror. Secure your preferred time slot today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/?book=true"
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#C69C6D] to-[#B38759] text-white px-10 py-5 tracking-[0.2em] uppercase text-xs font-bold rounded-full hover:shadow-[0_0_50px_rgba(198,156,109,0.4)] transition-all duration-500 hover:scale-105 active:scale-95 group"
                        >
                            Instant Booking
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/?book=ai"
                            className="inline-flex items-center gap-3 px-10 py-5 rounded-full border border-stone-200 text-stone-500 hover:border-[#C69C6D]/30 hover:text-[#C69C6D] transition-all duration-300 tracking-[0.2em] uppercase text-xs font-bold group"
                        >
                            <span className="text-sm">✨</span>
                            Ask Bella AI
                        </Link>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
