"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "../../../utils/supabase";
import AdminNavbar from "../../components/AdminNavbar";
import { Plus, Edit2, Trash2, Save, X, Settings } from "lucide-react";
import Link from "next/link";
import { LayoutDashboard, Users, Calendar } from "lucide-react";

interface Service {
    id: string;
    name: string;
    category: string;
    price: string;
    duration: number;
}

export default function AdminServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New service form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newService, setNewService] = useState({
        name: "",
        category: "Men",
        price: "",
        duration: 30
    });

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Service | null>(null);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/services");
            if (!response.ok) throw new Error("Failed to fetch services");
            const data = await response.json();
            setServices(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleAddService = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch("http://localhost:5000/api/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newService, accessToken: session?.access_token })
            });
            if (!response.ok) throw new Error("Failed to add service");
            setShowAddForm(false);
            setNewService({ name: "", category: "Men", price: "", duration: 30 });
            fetchServices();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to add service");
        }
    };

    const handleUpdateService = async (e: FormEvent) => {
        e.preventDefault();
        if (!editForm) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`http://localhost:5000/api/services/${editForm.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editForm, accessToken: session?.access_token })
            });
            if (!response.ok) throw new Error("Failed to update service");
            setEditingId(null);
            setEditForm(null);
            fetchServices();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update service");
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`http://localhost:5000/api/services/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: session?.access_token })
            });
            if (!response.ok) throw new Error("Failed to delete service");
            fetchServices();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete service");
        }
    };

    const startEditing = (service: Service) => {
        setEditingId(service.id);
        setEditForm({ ...service });
    };

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Bookings", href: "/admin/bookings", icon: Calendar },
        { name: "Customers", href: "/admin/customers", icon: Users },
        { name: "Services", href: "/admin/services", icon: Settings },
        { name: "Lookbook", href: "/admin/lookbook", icon: Plus },
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
                            const active = item.href === "/admin/services";
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
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-serif text-[#3E2723] mb-1">Services Management</h1>
                                <p className="text-stone-500 text-sm">Add, edit, or remove salon services</p>
                            </div>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-[#3E2723] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#5D3A32] transition shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Service
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {/* Add Service Modal */}
                        {showAddForm && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                                    <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                                        <h3 className="text-xl font-serif text-[#3E2723]">Add New Service</h3>
                                        <button onClick={() => setShowAddForm(false)} className="text-stone-400 hover:text-stone-600">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleAddService} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Service Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C69C6D] outline-none"
                                                value={newService.name}
                                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                                placeholder="e.g. Luxury Haircut"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Category</label>
                                            <select
                                                className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C69C6D] outline-none"
                                                value={newService.category}
                                                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                            >
                                                <option value="Men">Men</option>
                                                <option value="Women">Women</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Price (LKR)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C69C6D] outline-none"
                                                    value={newService.price}
                                                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                                    placeholder="e.g. 5000+"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Duration (min)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C69C6D] outline-none"
                                                    value={newService.duration}
                                                    onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-[#3E2723] text-white py-4 rounded-lg font-bold hover:bg-[#5D3A32] transition mt-4"
                                        >
                                            Save Service
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Services Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50 border-b border-stone-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Service</th>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Price</th>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Duration</th>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-stone-400">Loading services...</td>
                                        </tr>
                                    ) : services.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-stone-400">No services found. Add your first service above.</td>
                                        </tr>
                                    ) : (
                                        services.map((service) => (
                                            <tr key={service.id} className="hover:bg-stone-50 transition">
                                                <td className="px-6 py-4">
                                                    {editingId === service.id && editForm ? (
                                                        <input
                                                            type="text"
                                                            className="w-full border border-stone-200 rounded px-2 py-1"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-[#3E2723]">{service.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === service.id && editForm ? (
                                                        <select
                                                            className="w-full border border-stone-200 rounded px-2 py-1"
                                                            value={editForm.category}
                                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                        >
                                                            <option value="Men">Men</option>
                                                            <option value="Women">Women</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold ${service.category === 'Men' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                                            }`}>
                                                            {service.category}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === service.id && editForm ? (
                                                        <input
                                                            type="text"
                                                            className="w-full border border-stone-200 rounded px-2 py-1"
                                                            value={editForm.price}
                                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                        />
                                                    ) : (
                                                        <span className="text-stone-600">Rs. {service.price}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-stone-600">
                                                    {editingId === service.id && editForm ? (
                                                        <input
                                                            type="number"
                                                            className="w-full border border-stone-200 rounded px-2 py-1"
                                                            value={editForm.duration}
                                                            onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                                                        />
                                                    ) : (
                                                        `${service.duration} min`
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {editingId === service.id ? (
                                                            <>
                                                                <button
                                                                    onClick={handleUpdateService}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                                                    title="Save Changes"
                                                                >
                                                                    <Save className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingId(null)}
                                                                    className="p-2 text-stone-400 hover:bg-stone-50 rounded transition"
                                                                    title="Cancel"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => startEditing(service)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteService(service.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
