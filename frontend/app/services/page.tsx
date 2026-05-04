import Link from "next/link";
import Image from "next/image";

export default function ServicesPage() {
    const menServices = [
        { name: "Adult Buzz Cut", duration: "60 min", price: "Rs. 5000+", description: "A clean, sharp, and precise buzz cut tailored to your head shape." },
        { name: "Clean Up - Beard & Neck Trim", duration: "15 min", price: "Rs. 2500+", description: "Keep your facial hair and neck looking sharp and well-maintained." },
        { name: "Gent Hair Cut", duration: "30 min", price: "Rs. 4000+", description: "Classic or contemporary cut tailored to your style." },
        { name: "Color & Highlights", duration: "60 min", price: "Rs. 10000+", description: "Subtle or bold color updates to refresh your look." },
        { name: "Consultation", duration: "15 min", price: "Rs. 2000", description: "Expert advice on style and hair care customized for you." },
    ];

    const womenServices = [
        { name: "Women's Haircut", duration: "60 min", price: "Rs. 6000+", description: "A tailored haircut designed to complement your features." },
        { name: "Color & Highlights", duration: "120 min", price: "Rs. 15000+", description: "Expert coloring techniques to add depth and dimension." },
        { name: "Keratin Treatment", duration: "120 min", price: "Rs. 25000+", description: "Smoothing treatment for frizz-free, shiny hair." },
        { name: "Bridal Package", duration: "180 min", price: "Rs. 50000+", description: "Complete styling for your special day." },
        { name: "Consultation", duration: "30 min", price: "Rs. 2000", description: "Personalized advice on styling and treatments." },
    ];

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

            {/* Introduction */}
            <section className="py-20 px-6 max-w-4xl mx-auto text-center border-b border-stone-200">
                <h2 className="text-3xl font-serif mb-6">Artistry in Every Detail</h2>
                <p className="text-stone-500 leading-relaxed">
                    At Royal Glow, we don&apos;t just provide services; we craft experiences. Every treatment is preceded by a personalized consultation to ensure the results harmonize with your lifestyle and unique features.
                </p>
            </section>

            {/* Services Sections */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">

                {/* Men's Section */}
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <div className="order-2 lg:order-1">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-[#C69C6D] text-xs uppercase tracking-[0.3em] font-bold">Category 01</span>
                            <h2 className="text-4xl font-serif text-[#3E2723]">Men&apos;s Grooming</h2>
                        </div>
                        <div className="space-y-12">
                            {menServices.map((service, idx) => (
                                <div key={idx} className="border-b border-stone-100 pb-6 group hover:border-[#C69C6D] transition-colors">
                                    <div className="flex justify-between items-baseline mb-3">
                                        <h3 className="text-xl font-serif text-[#3E2723] group-hover:text-[#C69C6D] transition-colors">{service.name}</h3>
                                        <span className="text-[#C69C6D] font-bold">{service.price}</span>
                                    </div>
                                    <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {service.duration}
                                        </span>
                                    </div>
                                    <p className="text-stone-500 text-sm leading-relaxed font-light">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 relative h-[700px] overflow-hidden rounded-2xl shadow-2xl">
                        <Image
                            src="/customers/young-man-barbershop-trimming.jpg"
                            alt="Men's Grooming"
                            fill
                            className="object-cover brightness-90 hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#3E2723]/30 to-transparent"></div>
                    </div>
                </div>

                {/* Women's Section */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative h-[700px] overflow-hidden rounded-2xl shadow-2xl">
                        <Image
                            src="/customers/female-hairdresser.jpg"
                            alt="Women's Styling"
                            fill
                            className="object-cover brightness-90 hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#3E2723]/30 to-transparent"></div>
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-[#C69C6D] text-xs uppercase tracking-[0.3em] font-bold">Category 02</span>
                            <h2 className="text-4xl font-serif text-[#3E2723]">Women&apos;s Styling</h2>
                        </div>
                        <div className="space-y-12">
                            {womenServices.map((service, idx) => (
                                <div key={idx} className="border-b border-stone-100 pb-6 group hover:border-[#C69C6D] transition-colors">
                                    <div className="flex justify-between items-baseline mb-3">
                                        <h3 className="text-xl font-serif text-[#3E2723] group-hover:text-[#C69C6D] transition-colors">{service.name}</h3>
                                        <span className="text-[#C69C6D] font-bold">{service.price}</span>
                                    </div>
                                    <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {service.duration}
                                        </span>
                                    </div>
                                    <p className="text-stone-500 text-sm leading-relaxed font-light">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

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
            <section className="py-24 px-6 text-center bg-[#3E2723]">
                <h2 className="text-4xl font-serif text-white mb-6 uppercase tracking-widest">Reserve Your Moment</h2>
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
