"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function JoinUs() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubscribed(true);
        setEmail("");
    };

    return (
        <section className="bg-[#3E2723] py-24 px-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#C69C6D]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C69C6D]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-[#C69C6D] tracking-[0.3em] uppercase text-xs mb-6 font-bold"
                >
                    Stay Inspired
                </motion.p>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-white text-4xl md:text-5xl font-serif mb-8 leading-tight"
                >
                    Join Our Private Circle
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-stone-400 mb-12 max-w-xl mx-auto text-sm md:text-base font-light"
                >
                    Receive exclusive styling tips, early access to bridal bookings, and private event invitations directly in your inbox.
                </motion.p>

                {subscribed ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl"
                    >
                        <p className="text-white font-serif text-xl mb-2">Welcome to the inner circle.</p>
                        <p className="text-[#C69C6D] text-xs uppercase tracking-widest">You've successfully subscribed.</p>
                    </motion.div>
                ) : (
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
                    >
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            className="flex-1 bg-transparent border-none px-6 py-4 text-white focus:outline-none placeholder-stone-500 font-serif"
                        />
                        <button
                            type="submit"
                            className="bg-[#C69C6D] text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#B38759] transition-all rounded-xl shadow-lg"
                        >
                            Sign Up
                        </button>
                    </motion.form>
                )}
            </div>
        </section>
    );
}
