import React, { useState, useEffect } from 'react';
import TambahPemasok from '@/components/inventasris/TambahPemasok';
import Order from '@/components/inventasris/order';
import StockOpname from '@/components/inventasris/StockOpname';
import { Package, ShoppingCart, BarChart2, PlusCircle, RefreshCcw, ChevronRight } from 'lucide-react';

const InventoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        total_items: 0,
        low_stock: 0,
        active_orders: 0
    });

    const fetchStats = async () => {
        try {
            // Fetch from 'stok' table to match StockOpname
            const prodRes = await fetch('http://localhost:3001/api/stok');
            const prodData = await prodRes.json();

            if (prodData.success) {
                const items = prodData.data;
                const low = items.filter((i: any) => i.stok_tersedia < (i.stok_minimum || 5)).length;

                // Fetch active orders
                const orderRes = await fetch('http://localhost:3001/api/orders?status=pending');
                const orderData = await orderRes.json();

                setStats({
                    total_items: items.length,
                    low_stock: low,
                    active_orders: orderData.success ? orderData.data.length : 0
                });
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const tabs = [
        { id: 'overview', name: 'Overview', icon: <BarChart2 size={16} /> },
        { id: 'stock', name: 'Stock Opname', icon: <Package size={16} /> },
        { id: 'order', name: 'Buat Pesanan', icon: <ShoppingCart size={16} /> },
        { id: 'supplier', name: 'Manage Supplier', icon: <PlusCircle size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Page Header Area - Not sticky, allowed to scroll away */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                                <Package size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-black">Inventory Management</h1>
                                <p className="text-xs text-gray-500 font-medium">Control and monitor your warehouse assets in real-time.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="text-[11px] font-bold uppercase tracking-wider px-4 py-2 border border-gray-200 rounded-md bg-white hover:border-black transition-all">
                                Build Logs
                            </button>
                            <button className="text-[11px] font-bold uppercase tracking-wider px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all flex items-center gap-2">
                                <RefreshCcw size={12} /> Sync Stock
                            </button>
                        </div>
                    </div>

                    {/* Sub Navigation Tabs */}
                    <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                                    }`}
                            >
                                {tab.icon}
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === 'overview' && (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-black tracking-tight">Executive Summary</h3>
                                    <p className="text-[13px] text-gray-400 font-medium leading-none">Indikator performa gudang dan kesehatan inventaris saat ini.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={fetchStats} className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                                        <RefreshCcw size={16} className="text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Grid Cards for Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <StatCard
                                    title="Kapasitas Produk"
                                    value={stats.total_items.toString()}
                                    sub="Jenis barang aktif"
                                    color="zinc"
                                    icon={<BarChart2 size={32} />}
                                />
                                <StatCard
                                    title="Peringatan Stok"
                                    value={stats.low_stock.toString()}
                                    sub={stats.low_stock > 0 ? "Bahan segera habis" : "Ketersediaan aman"}
                                    color={stats.low_stock > 0 ? "red" : "zinc"}
                                    icon={<Package size={32} />}
                                />
                                <StatCard
                                    title="Antrian Pesanan"
                                    value={stats.active_orders.toString()}
                                    sub="Menunggu pengiriman"
                                    color="zinc"
                                    icon={<ShoppingCart size={32} />}
                                />
                            </div>
                        </>
                    )}

                    {/* Module Container */}
                    <div className="bg-white border border-gray-100 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden min-h-[600px] transition-all duration-500">
                        {activeTab === 'stock' && <StockOpname onSync={fetchStats} />}
                        {activeTab === 'order' && <div className="p-12 max-w-2xl mx-auto"><Order /></div>}
                        {activeTab === 'supplier' && <div className="p-12 max-w-2xl mx-auto"><TambahPemasok /></div>}
                        {activeTab === 'overview' && <OverviewPlaceholder onStock={() => setActiveTab('stock')} />}
                    </div>
                </div>
            </main>

            <footer className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-200 mt-20 flex flex-col items-center md:flex-row md:justify-between text-gray-400">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <span className="text-xs font-bold tracking-tighter text-black">SPPG SYSTEM</span>
                    <span className="text-[10px] uppercase tracking-widest">© 2026 MBG Group</span>
                </div>
                <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest font-mono">
                    <a href="#" className="hover:text-black transition-colors">Privacy</a>
                    <a href="#" className="hover:text-black transition-colors">Documentation</a>
                    <a href="#" className="hover:text-black transition-colors">API Reference</a>
                    <a href="#" className="hover:text-black transition-colors">Status</a>
                </div>
            </footer>
        </div>
    );
};

// Utils & Statics


const StatCard = ({ title, value, sub, color, icon }: any) => (
    <div className="bg-white border border-gray-100 rounded-[24px] p-8 hover:shadow-xl transition-all cursor-pointer relative group border-b-4 border-b-transparent hover:border-b-black overflow-hidden">
        <div className="absolute top-0 right-0 p-6 text-gray-100 group-hover:text-black/5 transition-colors">
            {icon}
        </div>
        <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</h3>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={14} className="text-black" />
            </div>
        </div>
        <div className="space-y-2 relative z-10">
            <p className={`text-5xl font-black tracking-tighter ${color === 'red' ? 'text-red-500' : 'text-black'}`}>{value}</p>
            <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${color === 'red' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                <p className={`text-[11px] font-bold uppercase tracking-tight ${color === 'red' ? 'text-red-500' : 'text-gray-400'}`}>
                    {sub}
                </p>
            </div>
        </div>
    </div>
);

const OverviewPlaceholder = ({ onStock }: any) => (
    <div className="flex flex-col items-center justify-center py-32 text-center px-12">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
            <BarChart2 size={40} className="text-gray-200" />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">Selamat Datang di SPPG Analytics</h3>
        <p className="text-gray-500 max-w-sm mb-10 text-sm">Pilih modul di atas untuk melakukan penghitungan stok, membuat pesanan baru, atau mengelola direktori supplier Anda.</p>
        <button
            onClick={onStock}
            className="bg-black text-white text-xs font-bold px-10 py-4 rounded-md hover:bg-black/90 transition-all flex items-center gap-2 shadow-2xl shadow-black/20 uppercase tracking-widest"
        >
            Buka Stock Opname <ChevronRight size={16} />
        </button>
    </div>
);

export default InventoryPage;
