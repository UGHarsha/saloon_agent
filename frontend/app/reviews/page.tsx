"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "../../utils/supabase";

type Review = {
    id: number;
    customer_name: string;
    rating: number;
    comment: string;
    created_at: string;
};

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        customer_name: "",
        rating: 5,
        comment: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Fetch reviews on mount
    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        setLoading(true);
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setReviews(data);
        } else if (error) {
            console.error("Error fetching reviews:", error.message);
        }
        setLoading(false);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg("");
        setSuccess(false);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
            setErrorMsg("You must be signed in to submit a review.");
            setSubmitting(false);
            return;
        }

        if (!form.customer_name || !form.comment || !form.rating) {
            setErrorMsg("Please fill out all fields.");
            setSubmitting(false);
            return;
        }

        const { error } = await supabase.from("reviews").insert([
            {
                user_id: session.user.id,
                customer_name: form.customer_name,
                rating: form.rating,
                comment: form.comment,
            },
        ]);

        if (error) {
            console.error(error);
            setErrorMsg("Error submitting review. Have you created the reviews table?");
        } else {
            setSuccess(true);
            setForm({ customer_name: "", rating: 5, comment: "" });
            fetchReviews();
        }
        setSubmitting(false);
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1 text-[#C69C6D]">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? "fill-current" : "text-stone-300 fill-transparent stroke-current stroke-2"}`}
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-[#FDFBF7] font-sans text-[#3E2723] pt-24 px-6 md:px-12 max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <p className="text-[#C69C6D] tracking-[0.2em] uppercase text-xs mb-4 font-semibold">Client Love</p>
                <h1 className="text-4xl md:text-5xl font-serif text-[#3E2723] tracking-wide mb-4">Reviews & Testimonials</h1>
                <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
                    Read what our esteemed clients have to say about their experience. If you’ve visited us, we’d love for you to share your thoughts.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
                {/* Form Section */}
                <div className="lg:col-span-1 bg-white p-8 shadow-sm border border-stone-100 rounded-sm">
                    <h3 className="text-2xl font-serif text-[#3E2723] mb-6 border-b-2 border-[#C69C6D] pb-3 inline-block">Leave a Review</h3>

                    {success ? (
                        <div className="text-center py-12">
                            <div className="text-[#C69C6D] mb-4">
                                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-serif mb-2">Thank You!</h2>
                            <p className="text-stone-500 text-sm">Your review has been published.</p>
                            <button
                                onClick={() => setSuccess(false)}
                                className="mt-6 text-[#C69C6D] text-xs uppercase tracking-widest hover:text-[#B38759] transition-colors"
                            >
                                Write Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {errorMsg && (
                                <p className="text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-sm">{errorMsg}</p>
                            )}

                            <div>
                                <label className="block text-stone-500 text-xs uppercase tracking-widest mb-2 font-semibold">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.customer_name}
                                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-stone-100 px-0 py-2 text-[#3E2723] focus:outline-none focus:border-[#C69C6D] transition-colors placeholder-stone-300"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setForm({ ...form, rating: star })}
                                            className="focus:outline-none hover:scale-110 transition-transform"
                                        >
                                            <svg
                                                className={`w-8 h-8 ${star <= form.rating ? "fill-[#C69C6D]" : "text-stone-200 fill-transparent stroke-current stroke-2"}`}
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-stone-500 text-xs uppercase tracking-widest mb-2 font-semibold">Your Experience</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.comment}
                                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-100 p-3 text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#C69C6D] focus:border-[#C69C6D] transition-colors resize-none placeholder-stone-400"
                                    placeholder="Tell us about your visit..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#C69C6D] text-white py-3 uppercase tracking-widest text-sm font-semibold hover:bg-[#B38759] transition-colors disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    )}
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="animate-pulse space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-6 shadow-sm border border-stone-100 rounded-sm">
                                    <div className="h-4 bg-stone-200 rounded w-1/4 mb-4"></div>
                                    <div className="h-4 bg-stone-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-stone-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-white p-12 text-center border border-stone-100 rounded-sm">
                            <p className="text-stone-500 italic">No reviews yet. Be the first to share your experience!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-white p-8 shadow-sm border border-stone-100 rounded-sm group hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h4 className="font-serif text-xl font-semibold mb-1">{review.customer_name}</h4>
                                        <div className="text-xs text-stone-400 tracking-wider">
                                            {new Date(review.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>
                                <p className="text-stone-600 leading-relaxed italic border-l-2 border-stone-100 pl-4 py-1">
                                    &quot;{review.comment}&quot;
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Some extra padding before footer */}
            <div className="h-24"></div>
        </main>
    );
}
