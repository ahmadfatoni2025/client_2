import { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Save, Globe, Calendar, Lock, Mail, Phone, Cloud, RotateCcw, Download, Loader2 } from 'lucide-react';

const pengaturan: React.FC = () => {
    const [activeTab, setActiveTab] = useState('umum');
    const [isSaving, setIsSaving] = useState(false);

    // --- STATES FOR SETTINGS ---
    const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'Bahasa Indonesia');
    const [notifs, setNotifs] = useState(() => {
        const saved = localStorage.getItem('notifs');
        return saved ? JSON.parse(saved) : { email: true, push: true, wa: false };
    });
    const [profile, setProfile] = useState({
        name: 'Administrator MBG',
        email: 'admin@mbg-sppg.id'
    });

    const tabs = [
        { id: 'umum', label: 'Profil Umum', icon: <User size={18} /> },
        { id: 'notif', label: 'Notifikasi', icon: <Bell size={18} /> },
        { id: 'keamanan', label: 'Keamanan', icon: <Shield size={18} /> },
        { id: 'data', label: 'Database & Backup', icon: <Database size={18} /> },
    ];

    const handleSave = () => {
        setIsSaving(true);
        // Save everything to localStorage
        localStorage.setItem('lang', language);
        localStorage.setItem('notifs', JSON.stringify(notifs));

        setTimeout(() => {
            setIsSaving(false);
            alert('Konfigurasi sistem berhasil disimpan ke penyimpanan lokal.');
        }, 1000);
    };

    const toggleNotif = (key: keyof typeof notifs): void => {
        setNotifs((prev: typeof notifs) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="p-4 md:p-6 min-h-screen transition-colors duration-500 bg-gray-50 text-gray-900">
            <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-gray-900">
                            <Settings className="text-blue-600" size={32} />
                            Pengaturan Sistem
                        </h1>
                        <p className="text-gray-500 mt-1">Konfigurasi akun, preferensi notifikasi, dan manajemen aset database.</p>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border bg-white border-gray-100">
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
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Settings Card */}
                    <div className="lg:col-span-3 rounded-[2.5rem] p-6 md:p-10 shadow-2xl border transition-colors duration-500 bg-white border-gray-100 flex flex-col min-h-[600px]">
                        <div className="grow animate-in fade-in slide-in-from-right-4 duration-500">

                            {/* TAB: UMUM */}
                            {activeTab === 'umum' && (
                                <div className="space-y-10">
                                    <section>
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                                            Informasi Akun
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                                                <input
                                                    type="text"
                                                    className="w-full border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-gray-50 border-gray-100 text-gray-900"
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Satuan Pelayanan</label>
                                                <input
                                                    type="email"
                                                    className="w-full border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-gray-50 border-gray-100 text-gray-900"
                                                    value={profile.email}
                                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                                            Preferensi Regional
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex items-center justify-between p-6 rounded-3xl border transition-all bg-gray-50 border-transparent hover:bg-white hover:border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-xl shadow-sm bg-white text-blue-600 transition-colors">
                                                        <Globe size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">Bahasa</p>
                                                        <p className="text-xs text-gray-400">Pilih bahasa antarmuka</p>
                                                    </div>
                                                </div>
                                                <select
                                                    className="bg-transparent text-sm font-bold outline-none cursor-pointer text-gray-900"
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                >
                                                    <option className="text-black">Bahasa Indonesia</option>
                                                    <option className="text-black">English (US)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {/* TAB: NOTIFIKASI */}
                            {activeTab === 'notif' && (
                                <div className="space-y-8">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                                        Pusat Notifikasi
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { id: 'email' as const, icon: <Mail className="text-blue-500" />, title: 'Email Penugasan', desc: 'Terima email setiap ada menu baru dari dapur.' },
                                            { id: 'push' as const, icon: <Bell className="text-orange-500" />, title: 'Push Notification', desc: 'Peringatan stok kritis dan transaksi besar.' },
                                            { id: 'wa' as const, icon: <Phone className="text-emerald-500" />, title: 'WhatsApp Update', desc: 'Ringkasan laporan harian melalui WA.' },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                onClick={() => toggleNotif(item.id)}
                                                className="flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer bg-gray-50 border-transparent hover:bg-white hover:border-gray-100"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-2xl shadow-sm bg-white transition-colors">
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">{item.title}</p>
                                                        <p className="text-xs text-gray-400">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-12 h-6 rounded-full relative transition-colors ${notifs[item.id] ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${notifs[item.id] ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB: KEAMANAN */}
                            {activeTab === 'keamanan' && (
                                <div className="space-y-10">
                                    <section>
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                                            Ganti Kata Sandi
                                        </h3>
                                        <div className="space-y-4 max-w-md">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Kata Sandi Lama</label>
                                                <div className="relative">
                                                    <input type="password" placeholder="••••••••" className="w-full border rounded-2xl px-6 py-4 text-sm font-bold outline-none bg-gray-50 border-gray-100 text-gray-900" />
                                                    <Lock className="absolute right-6 top-4 text-gray-300" size={18} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Kata Sandi Baru</label>
                                                <input type="password" placeholder="Minimal 8 karakter" className="w-full border rounded-2xl px-6 py-4 text-sm font-bold outline-none bg-gray-50 border-gray-100 text-gray-900" />
                                            </div>
                                            <button className="text-blue-500 text-xs font-bold hover:underline">Lupa kata sandi?</button>
                                        </div>
                                    </section>

                                    <section className="p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors bg-orange-50 border-orange-100">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl shadow-sm border bg-white border-orange-100 text-orange-600 transition-colors">
                                                <Shield size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-orange-900">Autentikasi Dua Faktor (2FA)</p>
                                                <p className="text-xs text-orange-700 opacity-80">Lindungi akun Anda dengan verifikasi tambahan.</p>
                                            </div>
                                        </div>
                                        <button className="w-full md:w-auto bg-orange-600 text-white px-8 py-3 rounded-xl text-xs font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20">Aktifkan</button>
                                    </section>
                                </div>
                            )}

                            {/* TAB: DATABASE */}
                            {activeTab === 'data' && (
                                <div className="space-y-10">
                                    <section>
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                                            Manajemen Cloud & Database
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div
                                                className="p-8 rounded-[2.5rem] border transition-all group cursor-pointer bg-gray-50 border-transparent hover:border-blue-100 hover:bg-blue-50/30"
                                                onClick={() => {
                                                    alert('Memulai sinkronisasi cloud...');
                                                }}
                                            >
                                                <div className="p-4 rounded-2xl w-fit shadow-sm mb-6 bg-white text-blue-600 group-hover:scale-110 transition-transform">
                                                    <Cloud size={24} />
                                                </div>
                                                <h4 className="font-black mb-2 text-gray-900">Cloud Backup</h4>
                                                <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">Cadangkan seluruh data transaksi dan inventaris ke server pusat.</p>
                                                <button className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                                                    <Download size={16} /> Mulai Proses Backup
                                                </button>
                                            </div>
                                            <div
                                                className="p-8 rounded-[2.5rem] border transition-all group cursor-pointer bg-gray-50 border-transparent hover:border-red-100 hover:bg-red-50/30"
                                                onClick={() => {
                                                    if (confirm('Hapus semua log sistem? Tindakan ini tidak bisa dibatalkan.')) {
                                                        alert('Log sistem berhasil dibersihkan.');
                                                    }
                                                }}
                                            >
                                                <div className="p-4 rounded-2xl w-fit shadow-sm mb-6 bg-white text-red-600 group-hover:scale-110 transition-transform">
                                                    <RotateCcw size={24} />
                                                </div>
                                                <h4 className="font-black mb-2 text-gray-900">Pembersihan Data</h4>
                                                <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">Hapus log transaksi lama untuk mempercepat performa sistem.</p>
                                                <button className="flex items-center gap-2 text-red-600 font-bold text-sm">
                                                    <RotateCcw size={16} /> Reset Log Sistem
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>

                        {/* Save Footer */}
                        <div className="pt-10 border-t border-gray-100 flex justify-end transition-colors">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`flex items-center gap-3 px-10 py-4 text-white rounded-2xl font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50 ${isSaving ? 'bg-gray-400' : 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-700'}`}
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {isSaving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default pengaturan;