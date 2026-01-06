import React, { useState } from 'react';
import axios from 'axios';
import { Apple, Search, Calendar, Pin, PinOff, Star, ArrowRight, Loader2 } from 'lucide-react';

interface FoodNutrient {
    id: string | number;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    image?: string;
    isPinned?: boolean;
}

const Nutrisi: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FoodNutrient[]>([]);
    const [loading, setLoading] = useState(false);

    // Pinned items (Staple for MBG)
    const [pinnedItems, setPinnedItems] = useState<FoodNutrient[]>([
        { id: 'p1', name: 'Nasi Putih (Masak)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, isPinned: true },
        { id: 'p2', name: 'Daging Ayam (Dada)', calories: 165, protein: 31, carbs: 0, fat: 3.6, isPinned: true },
        { id: 'p3', name: 'Telur Ayam (Rebus)', calories: 155, protein: 13, carbs: 1.1, fat: 11, isPinned: true },
        { id: 'p4', name: 'Tempe Kedelai Murni', calories: 193, protein: 19, carbs: 9.4, fat: 11, isPinned: true },
        { id: 'p5', name: 'Tahu Putih', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, isPinned: true },
        { id: 'p6', name: 'Susu Sapi UHT', calories: 60, protein: 3.2, carbs: 4.8, fat: 3.3, isPinned: true }
    ]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:3001/api/proxy/food-search?query=${encodeURIComponent(searchQuery)}`);
            if (res.data.success) {
                setSearchResults(res.data.data);
            }
        } catch (err) {
            console.error("Search error:", err);
            alert("Gagal mencari data makanan.");
        } finally {
            setLoading(false);
        }
    };

    const togglePin = (item: FoodNutrient) => {
        if (item.isPinned) {
            setPinnedItems(prev => prev.filter(i => i.id !== item.id));
            setSearchResults(prev => prev.map(i => i.id === item.id ? { ...i, isPinned: false } : i));
        } else {
            const newItem = { ...item, isPinned: true };
            setPinnedItems(prev => [newItem, ...prev]);
            setSearchResults(prev => prev.map(i => i.id === item.id ? { ...i, isPinned: true } : i));
        }
    };

    return (
        <div className="p-4 md:p-6 min-h-screen transition-colors duration-500">
            <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <Apple className="text-emerald-600" size={32} />
                            Database Nutrisi MBG
                        </h1>
                        <p className="text-gray-500 mt-1">Cari kandungan gizi makanan untuk standarisasi menu bergizi.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                            <Calendar className="text-gray-400" size={18} />
                            <span className="text-sm font-semibold text-gray-700">
                                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari makanan (misal: Ayam Goreng)..."
                        className="w-full bg-white border border-gray-100 rounded-3xl pl-14 pr-32 py-5 text-lg font-medium shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-3 top-3 bottom-3 bg-emerald-600 text-white px-8 rounded-2xl font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Cari Data'}
                    </button>
                </form>

                {/* Main Content: Table */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                            <Star className="text-amber-500" size={20} />
                            Daftar Kandungan Gizi (per 100g)
                        </h3>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                <tr>
                                    <th className="px-10 py-6">Nama Makanan</th>
                                    <th className="px-6 py-6 text-center">Energi (kcal)</th>
                                    <th className="px-6 py-6 text-center">Protein (g)</th>
                                    <th className="px-6 py-6 text-center">Karbo (g)</th>
                                    <th className="px-6 py-6 text-center">Lemak (g)</th>
                                    <th className="px-10 py-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {/* Pinned Items First */}
                                {pinnedItems.map((item) => (
                                    <tr key={item.id} className="bg-emerald-50/30 hover:bg-emerald-50 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                                    <Pin size={14} />
                                                </div>
                                                <span className="font-bold text-gray-900 uppercase tracking-tight">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center font-black text-orange-600 tracking-tighter">{item.calories}</td>
                                        <td className="px-6 py-6 text-center font-bold text-blue-600 tracking-tighter">{item.protein}</td>
                                        <td className="px-6 py-6 text-center font-bold text-amber-600 tracking-tighter">{item.carbs}</td>
                                        <td className="px-6 py-6 text-center font-bold text-gray-600 tracking-tighter">{item.fat}</td>
                                        <td className="px-10 py-6 text-right">
                                            <button
                                                onClick={() => togglePin(item)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Unpin Item"
                                            >
                                                <PinOff size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* Search Results */}
                                {searchResults
                                    .filter(res => !pinnedItems.find(p => p.id === res.id))
                                    .map((item) => (
                                        <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                                            <td className="px-10 py-6">
                                                <span className="font-medium text-gray-700">{item.name}</span>
                                            </td>
                                            <td className="px-6 py-6 text-center font-bold text-gray-400 group-hover:text-orange-500 transition-colors tracking-tighter">{item.calories}</td>
                                            <td className="px-6 py-6 text-center font-bold text-gray-400 group-hover:text-blue-500 transition-colors tracking-tighter">{item.protein}</td>
                                            <td className="px-6 py-6 text-center font-bold text-gray-400 group-hover:text-amber-500 transition-colors tracking-tighter">{item.carbs}</td>
                                            <td className="px-6 py-6 text-center font-bold text-gray-400 group-hover:text-gray-600 transition-colors tracking-tighter">{item.fat}</td>
                                            <td className="px-10 py-6 text-right">
                                                <button
                                                    onClick={() => togglePin(item)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 bg-gray-100 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                    title="Pin untuk MBG"
                                                >
                                                    <Pin size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                {searchResults.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Search className="text-gray-200 mb-4" size={48} />
                                                <p className="text-gray-400 font-medium max-w-xs">Gunakan kolom pencarian di atas untuk menemukan data nutrisi produk lainnya.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="bg-emerald-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden transition-all uppercase tracking-tight">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Star size={150} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                                <Star className="text-amber-400" />
                                Standarisasi Menu MBG
                            </h3>
                            <p className="text-emerald-100/80 max-w-xl normal-case">Data di atas merupakan referensi nutrisi per 100 gram bahan. Pastikan komposisi menu harian memenuhi target AKG (Angka Kecukupan Gizi).</p>
                        </div>
                        <button className="whitespace-nowrap bg-white text-emerald-900 px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-50 transition-all flex items-center gap-2">
                            <a href="https://nilaigizi.com/">Lihat Panduan Gizi</a>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Nutrisi;
