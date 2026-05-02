"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

type Review = {
    id: number;
    customer_name: string;
    rating: number;
    comment: string;
    created_at: string;
};

export default function Reviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            const { data, error } = await supabase
                .from("reviews")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(3);

            if (!error && data) {
                setReviews(data);
            }
            setLoading(false);
        }
        fetchReviews();
    }, []);

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1 text-[#C69C6D]">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? "fill-current" : "text-stone-200 fill-transparent stroke-current stroke-2"}`}
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                ))}
            </div>
        );
    };

    if (loading) return null;
    if (reviews.length === 0) return null;

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold"
                    >
                        Voices of Elegance
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif text-[#3E2723]"
                    >
                        What Our Clients Say
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-[#FDFBF7] p-8 rounded-2xl border border-stone-100 hover:shadow-xl transition-all duration-500 group"
                        >
                            <div className="mb-6">
                                {renderStars(review.rating)}
                            </div>
                            <p className="text-stone-600 italic leading-relaxed mb-8 relative">
                                <span className="text-4xl text-[#C69C6D] absolute -top-4 -left-2 opacity-20 serif">"</span>
                                {review.comment}
                                <span className="text-4xl text-[#C69C6D] absolute -bottom-8 -right-2 opacity-20 serif">"</span>
                            </p>
                            <div className="flex items-center gap-4 border-t border-stone-200 pt-6">
                                <div className="w-10 h-10 bg-[#3E2723] rounded-full flex items-center justify-center text-white font-serif text-sm">
                                    {review.customer_name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-serif text-[#3E2723] font-bold">{review.customer_name}</h4>
                                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">Verified Client</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
