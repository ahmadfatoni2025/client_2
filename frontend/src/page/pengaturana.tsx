import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Save, Globe, Moon, Calendar } from 'lucide-react';

const Pengaturana: React.FC = () => {
    const [activeTab, setActiveTab] = useState('umum');

    const tabs = [
        { id: 'umum', label: 'Profil Umum', icon: <User size={18} /> },
        { id: 'notif', label: 'Notifikasi', icon: <Bell size={18} /> },
        { id: 'keamanan', label: 'Keamanan', icon: <Shield size={18} /> },
        { id: 'data', label: 'Database & Backup', icon: <Database size={18} /> },
    ];

    return (
        <div className="p-4 md:p-6 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <Settings className="text-gray-600" size={32} />
                            Pengaturan Sistem
                        </h1>
                        <p className="text-gray-500 mt-1">Konfigurasi akun, preferensi notifikasi, dan manajemen aset database.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                        <Calendar className="text-gray-400" size={18} />
                        <span className="text-sm font-semibold text-gray-700">
                            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-white text-blue-600 shadow-md border border-blue-50'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Settings Card */}
                    {/* UPDATED: rounded-4xl & min-h-125 */}
                    <div className="lg:col-span-3 bg-white rounded-4xl p-6 md:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 min-h-125">
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            {activeTab === 'umum' && (
                                <div className="space-y-10">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            Informasi Akun
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                                                <input type="text" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" defaultValue="Administrator MBG" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                                <input type="email" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" defaultValue="admin@mbg-sppg.id" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            Preferensi Regional
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
                                                        <Globe size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">Bahasa</p>
                                                        <p className="text-xs text-gray-400">Pilih bahasa antarmuka</p>
                                                    </div>
                                                </div>
                                                <select className="bg-transparent text-sm font-bold text-gray-800 outline-none">
                                                    <option>Bahasa Indonesia</option>
                                                    <option>English (US)</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                                                        <Moon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">Mode Gelap</p>
                                                        <p className="text-xs text-gray-400">Aktifkan tema malam</p>
                                                    </div>
                                                </div>
                                                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                                                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                                        <button className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                                            <Save size={18} />
                                            Simpan Perubahan
                                        </button>
                                    </div>
                                </div>
                            )}
                            {activeTab !== 'umum' && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-3xl flex items-center justify-center mb-6">
                                        <Settings size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Modul Sedang Dikembangkan</h3>
                                    <p className="text-gray-500 max-w-xs mt-2">Fitur ini akan segera tersedia pada update keamanan sistem berikutnya.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Pengaturana;