import React, { useState, useEffect } from "react";
import { Search, Package, RefreshCw, AlertCircle, Save, Calculator, CheckCircle2, Plus, Warehouse, X, Database, MapPin, Hash, Box, Pin, PinOff, TrendingUp, Eye } from "lucide-react";

interface StokItem {
    id: string | number;
    kode_barang: string;
    nama_barang: string;
    stok_tersedia: number;
    satuan: string;
    lokasi?: string;
    kategori?: string;
    stok_minimum?: number;
    last_audit?: string;
    is_pinned?: boolean;
}

interface AuditItem extends StokItem {
    physical_count: number | string;
    variance: number;
    status: 'pending' | 'adjusted' | 'matched';
}

interface StokOpnameProps {
    onSync?: () => void;
}

const StokOpname: React.FC<StokOpnameProps> = ({ onSync }) => {
    const [stokItems, setStokItems] = useState<AuditItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // New Entry Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEntry, setNewEntry] = useState({
        kode_barang: '',
        nama_barang: '',
        stok_tersedia: 0,
        satuan: 'Pcs',
        lokasi: 'Gudang Utama',
        stok_minimum: 5
    });

    const API_URL = "http://localhost:3001/api";

    const showNotify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchStok = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const response = await fetch(`${API_URL}/stok`);
            const result = await response.json();
            if (result.success) {
                const mapped = result.data.map((item: StokItem) => ({
                    ...item,
                    physical_count: item.stok_tersedia,
                    variance: 0,
                    status: 'pending',
                    is_pinned: item.is_pinned || false
                }));
                setStokItems(mapped);
            }
        } catch (error) {
            console.error("Error fetching stock:", error);
            showNotify("Gagal memuat data stok", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStok();
    }, []);

    const handlePinToggle = async (item: AuditItem) => {
        const newPinnedStatus = !item.is_pinned;

        // Optimistic UI update
        setStokItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, is_pinned: newPinnedStatus } : i
        ));

        try {
            await fetch(`${API_URL}/stok/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_pinned: newPinnedStatus }),
            });
        } catch (error) {
            console.error("Pin update error:", error);
            // Revert if failed
            setStokItems(prev => prev.map(i =>
                i.id === item.id ? { ...i, is_pinned: !newPinnedStatus } : i
            ));
        }
    };

    const handlePhysicalCountChange = (id: string | number, value: string) => {
        setStokItems(prev => prev.map(item => {
            if (item.id === id) {
                const physical = value === "" ? "" : parseInt(value);
                const variance = value === "" ? 0 : (typeof physical === 'number' ? physical - item.stok_tersedia : 0);
                const status = variance === 0 ? 'matched' : 'pending';
                return { ...item, physical_count: physical, variance, status };
            }
            return item;
        }));
    };

    const handleSync = async () => {
        const changedItems = stokItems.filter(item => item.variance !== 0);
        if (changedItems.length === 0) return;

        setIsSaving(true);
        try {
            const updatePromises = changedItems.map(item =>
                fetch(`${API_URL}/stok/${item.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        stok_tersedia: item.physical_count,
                        updated_at: new Date().toISOString()
                    }),
                })
            );

            const results = await Promise.all(updatePromises);
            const allSuccess = results.every(res => res.ok);

            if (allSuccess) {
                // UPDATE LOCAL STATE DIRECTLY - NO REFRESH
                setStokItems(prev => prev.map(item => {
                    const updated = changedItems.find(c => c.id === item.id);
                    if (updated) {
                        return {
                            ...item,
                            stok_tersedia: Number(updated.physical_count),
                            variance: 0,
                            status: 'matched' as const
                        };
                    }
                    return item;
                }));

                if (onSync) onSync();
                showNotify("Semua data berhasil disinkronkan");
            } else {
                throw new Error("Beberapa data gagal diperbarui");
            }
        } catch (error) {
            console.error("Sync error:", error);
            showNotify("Gagal sinkronisasi data", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newEntry.kode_barang || !newEntry.nama_barang) {
            showNotify("Kode dan Nama barang wajib diisi", "error");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/stok`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newEntry,
                    updated_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    is_pinned: false
                }),
            });

            if (!response.ok) throw new Error("Failed to add data");

            const result = await response.json();
            if (result.success) {
                // If it's a new item, we need the ID from DB, but we can prepend it to avoid full refresh
                const newItem = {
                    ...result.data, // assuming backend returns the created object
                    physical_count: result.data.stok_tersedia,
                    variance: 0,
                    status: 'pending' as const,
                    is_pinned: false
                };

                setStokItems(prev => [newItem, ...prev]);
                if (onSync) onSync();
                setShowAddForm(false);
                setNewEntry({
                    kode_barang: '',
                    nama_barang: '',
                    stok_tersedia: 0,
                    satuan: 'Pcs',
                    lokasi: 'Gudang Utama',
                    stok_minimum: 5
                });
                showNotify("Produk baru berhasil didaftarkan");
            }
        } catch (error) {
            console.error("Add error:", error);
            showNotify("Gagal menambahkan barang baru", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredItems = stokItems
        .filter(item =>
            item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return a.nama_barang.localeCompare(b.nama_barang);
        });

    const stats = {
        total: stokItems.length,
        discrepancy: stokItems.filter(i => i.variance !== 0).length,
        matched: stokItems.filter(i => i.variance === 0 && i.physical_count !== "").length
    };

    return (
        <div className="w-full min-h-screen animate-in fade-in duration-700 pb-20">
            {/* Main Header - Sticky & Blurred */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-100/50 px-6 py-6 transition-all">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                            <Warehouse size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Warehouse Control</h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">Operational Audit Terminal Console</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Cari SKU atau Nama..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-gray-50/80 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 border-none w-full md:w-[320px] transition-all"
                            />
                        </div>

                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-zinc-800 hover:scale-105 transition-all active:scale-95"
                        >
                            <Plus size={16} /> Register SKU
                        </button>
                        <button
                            onClick={() => fetchStok()}
                            className="p-3 bg-gray-50/80 backdrop-blur-sm hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <RefreshCw size={18} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickStat label="Active Inventory" value={stats.total} icon={<Database className="text-blue-500" size={20} />} />
                    <QuickStat label="Pending Audit" value={stats.discrepancy} color="text-red-500" icon={<AlertCircle className="text-red-500" size={20} />} />
                    <QuickStat label="Verified Matches" value={stats.matched} color="text-green-500" icon={<CheckCircle2 className="text-green-500" size={20} />} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? <SkeletonCards /> : filteredItems.map(item => (
                        <AuditCard key={item.id} item={item} onCountChange={handlePhysicalCountChange} onPinToggle={handlePinToggle} />
                    ))}
                </div>

                {/* Floating Action Bar */}
                {stats.discrepancy > 0 && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
                        <div className="flex items-center gap-8 bg-black text-white px-8 py-5 rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl">
                            <div className="flex flex-col border-r border-white/10 pr-8">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Items to Commit</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-blue-400">{stats.discrepancy}</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Updates Found</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSync}
                                disabled={isSaving || loading}
                                className="flex items-center gap-4 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 group"
                            >
                                <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all ${isSaving ? 'bg-orange-500 animate-pulse' : 'bg-blue-600 group-hover:bg-blue-500 shadow-lg shadow-blue-500/20'}`}>
                                    {isSaving ? <RefreshCw size={20} className="animate-spin text-white" /> : <Save size={20} className="text-white" />}
                                </div>
                                <div className="text-left pr-4">
                                    <p className="text-sm font-black uppercase tracking-widest text-white leading-none mb-1">Commit Audit</p>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Sync physical data to Master</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Industrial Guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-20 pt-16 border-t border-gray-100">
                    <FeatureItem title="Inventory Integrity" desc="Enabling real-time precision for large scale warehouse operations." icon={<Package className="text-blue-500" size={20} />} />
                    <FeatureItem title="Smart Syncing" desc="Advanced parallel processing algorithm for massive data sets." icon={<RefreshCw className="text-green-500" size={20} />} />
                    <FeatureItem title="System Resilience" desc="Robust audit trails and validation for mission-critical stocks." icon={<TrendingUp className="text-purple-500" size={20} />} />
                    <FeatureItem title="Visual Ergonomics" desc="Optimized interface reduces clerical errors and fatigue." icon={<Eye className="text-orange-500" size={20} />} />
                </div>
            </div>

            {/* Custom Notification Toast */}
            {notification && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-10">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
                        notification.type === 'info' ? 'bg-blue-500/90 border-blue-400 text-white' :
                            'bg-zinc-900/90 border-zinc-800 text-white'
                        }`}>
                        {notification.type === 'success' ? <CheckCircle2 size={18} /> : notification.type === 'error' ? <AlertCircle size={18} /> : <Database size={18} />}
                        <span className="text-sm font-black uppercase tracking-widest">{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Modal: New Item Entry */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-white/20 p-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />

                        <button onClick={() => setShowAddForm(false)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-2xl transition-all">
                            <X size={24} className="text-gray-400" />
                        </button>

                        <div className="flex items-center gap-5 mb-12">
                            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20">
                                <Box size={28} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-black tracking-tighter">Register New SKU</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Master Database Insertion Entry</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddProduct} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput label="Unique Item Code" placeholder="e.g. SK-091" value={newEntry.kode_barang} onChange={(v: string) => setNewEntry({ ...newEntry, kode_barang: v })} icon={<Hash size={16} />} />
                                <FormInput label="Official Name" placeholder="e.g. Wheat Flour Premium" value={newEntry.nama_barang} onChange={(v: string) => setNewEntry({ ...newEntry, nama_barang: v })} icon={<Package size={16} />} />
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <FormInput label="Initial Vol" type="number" value={newEntry.stok_tersedia} onChange={(v: string) => setNewEntry({ ...newEntry, stok_tersedia: parseInt(v) || 0 })} icon={<Calculator size={16} />} />
                                <FormInput label="Unit" placeholder="Pcs" value={newEntry.satuan} onChange={(v: string) => setNewEntry({ ...newEntry, satuan: v })} />
                                <FormInput label="Safety Lvl" type="number" value={newEntry.stok_minimum} onChange={(v: string) => setNewEntry({ ...newEntry, stok_minimum: parseInt(v) || 0 })} />
                            </div>

                            <FormInput label="Warehouse Allocation" placeholder="Warehouse A - Section 1" value={newEntry.lokasi} onChange={(v: string) => setNewEntry({ ...newEntry, lokasi: v })} icon={<MapPin size={16} />} />

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel Operation</button>
                                <button type="submit" disabled={isSaving} className="flex-2 py-5 bg-black text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-black/20 hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                                    {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                                    Commit Selection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Internal Components
const QuickStat = ({ label, value, color = "text-gray-900", icon }: any) => (
    <div className="flex items-center justify-between p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <span className={`text-4xl font-black tracking-tighter ${color}`}>{value}</span>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
    </div>
);

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    label: string;
    icon?: React.ReactNode;
    value: string | number;
    onChange: (value: string) => void;
}

const FormInput = ({ label, icon, value, onChange, ...props }: FormInputProps) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
            {icon} {label}
        </label>
        <input
            {...props}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
        />
    </div>
);

const AuditCard = ({ item, onCountChange, onPinToggle }: any) => (
    <div className={`p-10 bg-white border border-gray-100 rounded-[40px] space-y-10 transition-all hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden ${item.is_pinned ? 'ring-2 ring-blue-600/10' : ''}`}>
        {item.is_pinned && <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />}

        <button
            onClick={() => onPinToggle(item)}
            className={`absolute top-8 right-8 p-3 rounded-2xl transition-all z-10 ${item.is_pinned ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-300 hover:bg-gray-100'}`}
        >
            {item.is_pinned ? <Pin size={18} fill="white" /> : <PinOff size={18} />}
        </button>

        <div className="flex justify-between items-start pr-16">
            <div className="space-y-2">
                <h4 className="text-2xl font-black text-gray-900 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">{item.nama_barang}</h4>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.kode_barang}</span>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span className="text-[10px] font-black text-gray-400 uppercase">{item.lokasi || 'ZONE A'}</span>
                </div>
            </div>
        </div>

        <div className="bg-gray-50/50 p-8 rounded-[32px] space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">System State</span>
                    <span className="text-lg font-black text-gray-700">{item.stok_tersedia} <span className="text-[10px] opacity-40 uppercase">{item.satuan}</span></span>
                </div>
                {item.variance !== 0 && (
                    <div className={`px-4 py-2 rounded-2xl font-black text-sm ${item.variance > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.variance > 0 ? '+' : ''}{item.variance}
                    </div>
                )}
            </div>

            <div className="relative">
                <input
                    type="number"
                    value={item.physical_count}
                    onChange={(e) => onCountChange(item.id, e.target.value)}
                    placeholder="Actual..."
                    className="w-full bg-white border-2 border-transparent rounded-[24px] px-8 py-6 font-black text-2xl focus:border-blue-600 transition-all outline-none shadow-sm"
                />
            </div>
        </div>
    </div>
);

const FeatureItem = ({ title, desc, icon }: any) => (
    <div className="space-y-4">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">{icon}</div>
        <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.15em]">{title}</h4>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
);

const SkeletonCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-80 bg-gray-50 rounded-[40px] animate-pulse" />
        ))}
    </div>
);

export default StokOpname;