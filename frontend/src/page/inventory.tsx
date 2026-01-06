import { useState, useEffect } from 'react';
import axios from 'axios';
import TambahPemasok from '@/components/inventasris/TambahPemasok';
import Order from '@/components/inventasris/order';
import StockOpname from '@/components/inventasris/StockOpname';
import { Package, ShoppingCart, BarChart2, PlusCircle, RefreshCcw, LayoutDashboard, Database, AlertCircle, Calendar } from 'lucide-react';

interface Item {
    id: number;
    nama_barang: string;
    kategori: string;
    stok_tersedia: number;
    stok_minimum?: number;
    satuan: string;
}

const InventoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        total_items: 0,
        low_stock: 0,
        active_orders: 0
    });
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const prodRes = await axios.get('http://localhost:3001/api/stok');
            const prodData = prodRes.data;

            if (prodData.success) {
                const items: Item[] = prodData.data;
                const low = items.filter((i: Item) => i.stok_tersedia <= (i.stok_minimum || 5)).length;

                const orderRes = await axios.get('http://localhost:3001/api/transaksi?status=pending');
                const orderData = orderRes.data;

                setStats({
                    total_items: items.length,
                    low_stock: low,
                    active_orders: orderData.success ? orderData.data.length : 0
                });
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const tabs = [
        { id: 'overview', name: 'Ringkasan', icon: <LayoutDashboard size={18} /> },
        { id: 'stock', name: 'Stok Opname', icon: <Package size={18} /> },
        { id: 'order', name: 'Pesanan Baru', icon: <ShoppingCart size={18} /> },
        { id: 'supplier', name: 'Supplier', icon: <PlusCircle size={18} /> },
    ];

    return (
        <div className="p-4 md:p-6 min-h-screen transition-colors duration-500 bg-white">
            <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <Database className="text-blue-600" size={32} />
                            Manajemen Inventaris
                        </h1>
                        <p className="text-gray-500 mt-1">Monitoring stok barang, pengadaan, dan manajemen vendor.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchStats}
                            className="p-2.5 bg-white text-gray-400 hover:text-blue-600 transition-all rounded-xl border border-gray-100 shadow-sm"
                        >
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                            <Calendar className="text-gray-400" size={18} />
                            <span className="text-sm font-semibold text-gray-700">
                                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- QUICK STATS --- */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            label="Total Produk"
                            value={stats.total_items}
                            sub="Item terdaftar"
                            icon={<Package size={24} />}
                            color="blue"
                        />
                        <StatCard
                            label="Stok Kritis"
                            value={stats.low_stock}
                            sub="Segera restock"
                            icon={<AlertCircle size={24} />}
                            color={stats.low_stock > 0 ? "orange" : "emerald"}
                        />
                        <StatCard
                            label="Pesanan Aktif"
                            value={stats.active_orders}
                            sub="Dalam antrian"
                            icon={<ShoppingCart size={24} />}
                            color="indigo"
                        />
                    </div>
                )}

                {/* --- TAB NAVIGATION --- */}
                <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar gap-2 pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                                }`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 min-h-[500px]">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'overview' && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                                    <BarChart2 size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Analisis Inventaris SPPG</h3>
                                <p className="text-gray-500 max-w-sm mb-10">Pilih modul navigasi di atas untuk manajemen stok, pengadaan barang, atau pengaturan pemasok.</p>
                                <button
                                    onClick={() => setActiveTab('stock')}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
                                >
                                    Buka Stok Opname
                                </button>
                            </div>
                        )}
                        {activeTab === 'stock' && <StockOpname onSync={fetchStats} />}
                        {activeTab === 'order' && <div className="max-w-4xl mx-auto"><Order /></div>}
                        {activeTab === 'supplier' && <div className="max-w-4xl mx-auto"><TambahPemasok /></div>}
                    </div>
                </div>

            </div>
        </div>
    );
};

interface StatCardProps {
    label: string;
    value: number | string;
    sub: string;
    icon: React.ReactNode;
    color: 'blue' | 'orange' | 'emerald' | 'indigo' | string;
}

const StatCard = ({ label, value, sub, icon, color }: StatCardProps) => {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        orange: 'bg-orange-50 text-orange-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        indigo: 'bg-indigo-50 text-indigo-600'
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colorMap[color] || colorMap.blue}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
                <p className="text-xs text-gray-500 mt-1">{sub}</p>
            </div>
        </div>
    );
};

export default InventoryPage;
