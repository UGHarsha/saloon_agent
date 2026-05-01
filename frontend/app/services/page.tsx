import Link from "next/link";

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
            <section className="bg-[#3E2723] text-stone-100 py-24 px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-serif mb-4 tracking-wide">Our Services</h1>
                <p className="max-w-2xl mx-auto text-stone-300 text-lg font-light leading-relaxed">
                    Elevate your physical presence. We offer premium styling and treatments tailored to your unique essence, in a relaxing and luxurious atmosphere.
                </p>
            </section>

            {/* Services List */}
            <section className="max-w-6xl mx-auto py-16 px-6 sm:px-12">
                <div className="grid md:grid-cols-2 gap-16">

                    {/* Men's Services */}
                    <div>
                        <div className="flex items-center gap-4 mb-8 border-b-2 border-[#C69C6D] pb-3">
                            <h2 className="text-2xl font-serif text-[#3E2723]">Men&apos;s Grooming</h2>
                        </div>
                        <div className="space-y-8">
                            {menServices.map((service, idx) => (
                                <div key={idx} className="group cursor-pointer">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="text-lg font-semibold text-[#3E2723] group-hover:text-[#C69C6D] transition-colors">{service.name}</h3>
                                        <div className="text-right">
                                            <span className="text-[#C69C6D] font-medium">{service.price}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-stone-500 text-sm mb-2">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {service.duration}
                                        </span>
                                    </div>
                                    <p className="text-stone-600 text-sm leading-relaxed">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Women's Services */}
                    <div>
                        <div className="flex items-center gap-4 mb-8 border-b-2 border-[#C69C6D] pb-3">
                            <h2 className="text-2xl font-serif text-[#3E2723]">Women&apos;s Styling</h2>
                        </div>
                        <div className="space-y-8">
                            {womenServices.map((service, idx) => (
                                <div key={idx} className="group cursor-pointer">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="text-lg font-semibold text-[#3E2723] group-hover:text-[#C69C6D] transition-colors">{service.name}</h3>
                                        <div className="text-right">
                                            <span className="text-[#C69C6D] font-medium">{service.price}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-stone-500 text-sm mb-2">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {service.duration}
                                        </span>
                                    </div>
                                    <p className="text-stone-600 text-sm leading-relaxed">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* Booking CTA */}
            <section className="bg-stone-100 py-16 px-6 text-center">
                <h2 className="text-3xl font-serif text-[#3E2723] mb-6">Ready to transform your look?</h2>
                <p className="text-stone-600 mb-8 max-w-xl mx-auto">
                    Book an appointment with us today and let our expert stylists bring out the best version of you.
                </p>
                <Link
                    href="/?book=true"
                    className="inline-block bg-[#C69C6D] text-white px-8 py-4 tracking-[0.15em] uppercase text-sm font-medium hover:bg-[#B38759] transition-all duration-300 shadow-md"
                >
                    Book Appointment
                </Link>
            </section>


        </main>
    );
}
