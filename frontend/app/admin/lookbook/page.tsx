"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "../../../utils/supabase";
import AdminNavbar from "../../components/AdminNavbar";
import { Plus, Trash2, X, Image as ImageIcon, LayoutDashboard, Users, Calendar, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface LookBookImage {
    id: string;
    src: string;
    alt: string;
}

export default function AdminLookbook() {
    const [images, setImages] = useState<LookBookImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New image form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newImage, setNewImage] = useState({
        src: "",
        alt: ""
    });

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/lookbook");
            if (!response.ok) throw new Error("Failed to fetch images");
            const data = await response.json();
            setImages(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleAddImage = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch("http://localhost:5000/api/lookbook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newImage, accessToken: session?.access_token })
            });
            if (!response.ok) throw new Error("Failed to add image");
            setShowAddForm(false);
            setNewImage({ src: "", alt: "" });
            fetchImages();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to add image");
        }
    };

    const handleDeleteImage = async (id: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`http://localhost:5000/api/lookbook/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: session?.access_token })
            });
            if (!response.ok) throw new Error("Failed to delete image");
            fetchImages();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete image");
        }
    };

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Bookings", href: "/admin/bookings", icon: Calendar },
        { name: "Customers", href: "/admin/customers", icon: Users },
        { name: "Services", href: "/admin/services", icon: Settings },
        { name: "Lookbook", href: "/admin/lookbook", icon: ImageIcon },
    ];

    return (
        <>
            <AdminNavbar />
            <div className="flex h-screen bg-stone-100 font-sans text-stone-900 pt-16">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-stone-200 shadow-sm flex-col hidden md:flex">
                    <div className="p-6 border-b border-stone-100">
                        <h2 className="text-xl font-serif text-[#C69C6D] uppercase tracking-widest">Admin Panel</h2>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = item.href === "/admin/lookbook";
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm transition ${active
                                            ? "bg-stone-50 text-[#C69C6D] font-semibold"
                                            : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-serif text-[#3E2723] mb-1">Lookbook Management</h1>
                                <p className="text-stone-500 text-sm">Manage gallery images for the home page</p>
                            </div>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-[#3E2723] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#5D3A32] transition shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                Add Image
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {/* Add Image Modal */}
                        {showAddForm && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                                    <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                                        <h3 className="text-xl font-serif text-[#3E2723]">Add Gallery Image</h3>
                                        <button onClick={() => setShowAddForm(false)} className="text-stone-400 hover:text-stone-600">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleAddImage} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Image URL</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C69C6D] outline-none"
                                                value={newImage.src}
                                                onChange={(e) => setNewImage({ ...newImage, src: e.target.value })}
                                                placeholder="e.g. /customers/new-look.jpg or https://..."
                                            />
                                            <p className="mt-1 text-[10px] text-stone-400">Provide a path relative to /public or an absolute URL</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Alt Text (Description)</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C69C6D] outline-none"
                                                value={newImage.alt}
                                                onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
                                                placeholder="e.g. Stylish men's haircut"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-[#3E2723] text-white py-4 rounded-lg font-bold hover:bg-[#5D3A32] transition mt-4"
                                        >
                                            Add to Lookbook
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Images Grid */}
                        {loading ? (
                            <div className="text-center py-20 text-stone-400">Loading lookbook...</div>
                        ) : images.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center border border-stone-100 shadow-sm">
                                <ImageIcon className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                                <h3 className="text-lg font-serif text-stone-600 mb-2">No images in lookbook</h3>
                                <p className="text-stone-400 text-sm mb-6">Add your first masterpiece to show off to clients.</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="text-[#C69C6D] font-bold text-xs uppercase tracking-widest hover:underline"
                                >
                                    Add Image Now
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {images.map((img) => (
                                    <div key={img.id} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-all relative">
                                        <div className="aspect-[4/5] relative">
                                            <Image
                                                src={img.src}
                                                alt={img.alt}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleDeleteImage(img.id)}
                                                    className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition transform hover:scale-110"
                                                    title="Delete Image"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white">
                                            <p className="text-xs text-stone-500 font-medium truncate">{img.alt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
