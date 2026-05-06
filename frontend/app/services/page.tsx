"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

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

    // Subcategories definitions
    const menSubcategories = ["Face", "Hair", "Bridal Full"];
    const womenSubcategories = ["Face", "Hair", "Nails", "Bridal Full"];

    return (
        <main className="min-h-screen bg-[#FDFBF7] font-sans text-[#3E2723]">
            {/* Header Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="/salon.jpg"
                    alt="Luxury Salon Interior"
                    fill
                    className="object-cover scale-105 brightness-[0.4]"
                />
                <div className="relative z-10 text-center px-6">
                    <p className="text-[#C69C6D] tracking-[0.4em] uppercase text-xs mb-6 font-bold">The Menu</p>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 uppercase tracking-tight">Our Services</h1>
                    <p className="max-w-xl mx-auto text-stone-300 text-sm md:text-base font-light italic leading-relaxed">
                        "Elegance is the only beauty that never fades." — Discover our curated treatments designed for the modern individual.
                    </p>
                </div>
            </section>



            {/* Services Sections */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto min-h-[800px]">

                {/* Tabs & Search */}
                <div className="flex flex-col items-center mb-24 space-y-12">
                    <div className="flex justify-center gap-8 md:gap-20 border-b border-stone-200 w-full max-w-2xl">
                        <button
                            onClick={() => setActiveTab("women")}
                            className={`text-2xl md:text-3xl font-serif pb-6 px-4 transition-all -mb-[1px] ${activeTab === "women" ? "text-[#3E2723] border-b-2 border-[#C69C6D]" : "text-stone-400 hover:text-stone-600 border-b-2 border-transparent"}`}
                        >
                            Women&apos;s Styling
                        </button>
                        <button
                            onClick={() => setActiveTab("men")}
                            className={`text-2xl md:text-3xl font-serif pb-6 px-4 transition-all -mb-[1px] ${activeTab === "men" ? "text-[#3E2723] border-b-2 border-[#C69C6D]" : "text-stone-400 hover:text-stone-600 border-b-2 border-transparent"}`}
                        >
                            Men&apos;s Grooming
                        </button>
                    </div>

                    <div className="w-full max-w-xl relative">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-stone-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search treatments, styling, or descriptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-full py-4 pl-14 pr-6 focus:outline-none focus:border-[#C69C6D] focus:ring-1 focus:ring-[#C69C6D] transition-all shadow-sm font-light text-stone-600"
                        />
                    </div>
                </div>

                {/* Content */}
                {activeTab === "men" && (
                    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-[#C69C6D] text-xs uppercase tracking-[0.3em] font-bold">Category 01</span>
                                <h2 className="text-4xl font-serif text-[#3E2723]">Men&apos;s Grooming</h2>
                            </div>
                            <div className="space-y-12">
                                {menServices.length === 0 ? (
                                    <p className="text-stone-500 italic">No services found matching your search.</p>
                                ) : menSubcategories.map(subcat => {
                                    const subServices = menServices.filter(s => s.category === `Men - ${subcat}` || (subcat === 'Hair' && s.category === 'Men'));
                                    if (subServices.length === 0) return null;
                                    return (
                                        <div key={subcat} className="mb-12">
                                            <h4 className="text-sm font-bold text-[#C69C6D] uppercase tracking-[0.2em] mb-6 border-b border-stone-100 pb-3">{subcat}</h4>
                                            <div className="space-y-8">
                                                {subServices.map((service, idx) => (
                                                    <div key={idx} className="group hover:border-[#C69C6D] transition-colors border-b border-transparent pb-4">
                                                        <div className="flex justify-between items-baseline mb-3">
                                                            <h3 className="text-xl font-serif text-[#3E2723] group-hover:text-[#C69C6D] transition-colors">{service.name}</h3>
                                                            <span className="text-[#C69C6D] font-bold">Rs. {service.price}</span>
                                                        </div>
                                                        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3">
                                                            <span className="flex items-center gap-2">
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                {service.duration} min
                                                            </span>
                                                        </div>
                                                        <p className="text-stone-500 text-sm leading-relaxed font-light">{service.description || "A professional service tailored to your style."}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "women" && (
                    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-[#C69C6D] text-xs uppercase tracking-[0.3em] font-bold">Category 02</span>
                                <h2 className="text-4xl font-serif text-[#3E2723]">Women&apos;s Styling</h2>
                            </div>
                            <div className="space-y-12">
                                {womenServices.length === 0 ? (
                                    <p className="text-stone-500 italic">No services found matching your search.</p>
                                ) : womenSubcategories.map(subcat => {
                                    const subServices = womenServices.filter(s => s.category === `Women - ${subcat}` || (subcat === 'Hair' && s.category === 'Women'));
                                    if (subServices.length === 0) return null;
                                    return (
                                        <div key={subcat} className="mb-12">
                                            <h4 className="text-sm font-bold text-[#C69C6D] uppercase tracking-[0.2em] mb-6 border-b border-stone-100 pb-3">{subcat}</h4>
                                            <div className="space-y-8">
                                                {subServices.map((service, idx) => (
                                                    <div key={idx} className="group hover:border-[#C69C6D] transition-colors border-b border-transparent pb-4">
                                                        <div className="flex justify-between items-baseline mb-3">
                                                            <h3 className="text-xl font-serif text-[#3E2723] group-hover:text-[#C69C6D] transition-colors">{service.name}</h3>
                                                            <span className="text-[#C69C6D] font-bold">Rs. {service.price}</span>
                                                        </div>
                                                        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3">
                                                            <span className="flex items-center gap-2">
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                {service.duration} min
                                                            </span>
                                                        </div>
                                                        <p className="text-stone-500 text-sm leading-relaxed font-light">{service.description || "A professional service tailored to your style."}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

            </section>

            {/* Expert Tip Section */}
            <section className="bg-white py-24 px-6">
                <div className="max-w-4xl mx-auto bg-[#FDFBF7] border border-stone-100 p-12 text-center rounded-3xl relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#C69C6D] rounded-full flex items-center justify-center text-white text-xl">💡</div>
                    <h3 className="text-2xl font-serif mb-4">The Style Recommendation</h3>
                    <p className="text-stone-500 italic mb-8">
                        &quot;For first-time color transformations, we always recommend a consultation 48 hours prior to the appointment. This allows us to perform a skin test and perfectly plan your color map.&quot;
                    </p>
                    <Link href="/?book=ai" className="text-[#C69C6D] font-bold uppercase tracking-widest text-xs border-b border-[#C69C6D] pb-1 hover:text-[#3E2723] hover:border-[#3E2723] transition-all">
                        Consult with Bella AI
                    </Link>
                </div>
            </section>

            {/* Booking CTA */}
            <section className="py-24 px-6 text-center bg-[#FDFBF7]">
                <h2 className="text-4xl font-serif text-[#3E2723] mb-6 uppercase tracking-widest">Reserve Your Moment</h2>
                <p className="text-stone-400 mb-12 max-w-xl mx-auto font-light">
                    Join us for a transformation that goes beyond the mirror. Secure your preferred time slot today.
                </p>
                <Link
                    href="/?book=true"
                    className="inline-block bg-[#C69C6D] text-white px-12 py-5 tracking-[0.2em] uppercase text-xs font-bold hover:bg-[#B38759] transition-all duration-300 shadow-2xl"
                >
                    Instant Booking
                </Link>
            </section>

        </main>
    );
}
