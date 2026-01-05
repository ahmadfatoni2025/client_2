import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interface Data
interface DashboardData {
  finance: {
    total_anggaran: number;
    terpakai: number;
    sisa: number;
    serapan: number;
  };
  operation: {
    total_penerima: number;
    distribusi_hari_ini: number;
    kepuasan: number;
    stok_kritis: number;
  };
  alerts: {
    level: string;
    pesan: string;
  }[];
}

const ExecutiveDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/finance/dashboard/summary');
        setData(res.data.data);
      } catch (error) {
        console.error("Gagal load dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Memuat Data SPPG...</div>;
  if (!data) return <div className="p-10 text-center text-red-400">Gagal mengambil data sistem.</div>;

  return (
    <div className="w-full space-y-8 font-sans text-slate-600">
      
      {/* --- HEADER: STYLE MODERN CENTERED --- */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Executive Command Center
        </h1>
        <p className="text-slate-400 text-sm">
          Monitoring Terpadu Operasional & Keuangan SPPG
        </p>
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100 mt-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-medium text-cyan-600">
            Live Update: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* --- ALERT SYSTEM (Soft Warning) --- */}
      {data.alerts.length > 0 && (
        <div className="mx-auto max-w-4xl bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
          <div className="bg-orange-100 p-2 rounded-full text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-orange-800 font-bold text-sm">Perhatian Diperlukan</h3>
            <ul className="mt-1 space-y-1">
              {data.alerts.map((alert, idx) => (
                <li key={idx} className="text-xs text-orange-600 flex items-center gap-2">
                  • {alert.pesan}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* --- TAB NAVIGATION (Pill Style) --- */}
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            activeTab === 'overview' 
            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' 
            : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          Ringkasan Utama
        </button>
        <button 
          onClick={() => setActiveTab('kpi')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            activeTab === 'kpi' 
            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' 
            : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          Analisis KPI
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 pb-10">
          
          {/* CARD 1: KEUANGAN (TKPI Style) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Keuangan</p>
                <h3 className="text-lg font-bold text-slate-800 mt-1">Serapan Anggaran</h3>
              </div>
              <span className="bg-cyan-50 text-cyan-600 text-xs px-2 py-1 rounded-lg font-bold">{data.finance.serapan}%</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-800">
                {data.finance.serapan}<span className="text-lg text-slate-400 ml-1">%</span>
              </h2>
              {/* Custom Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" 
                  style={{ width: `${data.finance.serapan}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400">
                Sisa Dana: <span className="text-slate-600 font-semibold">Rp {new Intl.NumberFormat('id-ID').format(data.finance.sisa)}</span>
              </p>
            </div>
          </div>

          {/* CARD 2: DISTRIBUSI (Healthy Green) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Operasional</p>
                <h3 className="text-lg font-bold text-slate-800 mt-1">Distribusi Makanan</h3>
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-lg font-bold">Hari Ini</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-800">
                {data.operation.distribusi_hari_ini}
                <span className="text-lg text-slate-400 ml-1">porsi</span>
              </h2>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" 
                  style={{ width: '85%' }}
                ></div>
              </div>
              <p className="text-xs text-slate-400">
                Target: <span className="text-slate-600 font-semibold">{data.operation.total_penerima} Porsi</span>
              </p>
            </div>
          </div>

          {/* CARD 3: KEPUASAN (Purple Soft) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Publik</p>
                <h3 className="text-lg font-bold text-slate-800 mt-1">Indeks Kepuasan</h3>
              </div>
              <span className="bg-violet-50 text-violet-600 text-xs px-2 py-1 rounded-lg font-bold">Survey QR</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-800">
                {data.operation.kepuasan}
                <span className="text-lg text-slate-400 ml-1">/100</span>
              </h2>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full" 
                  style={{ width: `${data.operation.kepuasan}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400">
                Predikat: <span className="text-violet-600 font-semibold">Sangat Baik</span>
              </p>
            </div>
          </div>

          {/* CARD 4: INVENTORY (Orange Alert) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full opacity-50"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Logistik</p>
                <h3 className="text-lg font-bold text-slate-800 mt-1">Status Gudang</h3>
              </div>
              <span className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-lg font-bold">Warning</span>
            </div>
            
            <div className="space-y-4 relative z-10">
              <h2 className="text-4xl font-extrabold text-slate-800">
                {data.operation.stok_kritis}
                <span className="text-lg text-slate-400 ml-1">item</span>
              </h2>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-400 rounded-full animate-pulse" 
                  style={{ width: '30%' }}
                ></div>
              </div>
              <button className="text-xs font-bold text-orange-500 hover:text-orange-600 transition flex items-center gap-1">
                Lihat Detail Restock
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      )}
      
      {/* --- KPI SECTION (Soft Style) --- */}
      {activeTab === 'kpi' && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Analisis Performa (KPI)</h3>
          
          <div className="space-y-8">
            {/* KPI ITEM 1 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h4 className="font-bold text-slate-700">Efisiensi Anggaran</h4>
                  <p className="text-xs text-slate-400">Target Serapan: 95%</p>
                </div>
                <span className="text-2xl font-bold text-cyan-600">{data.finance.serapan}%</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${data.finance.serapan}%` }}></div>
              </div>
            </div>

            {/* KPI ITEM 2 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h4 className="font-bold text-slate-700">Food Waste (Sisa Makanan)</h4>
                  <p className="text-xs text-slate-400">Batas Toleransi: &lt; 5%</p>
                </div>
                <span className="text-2xl font-bold text-emerald-500">2.5%</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-500 flex items-start gap-3">
              <span className="text-xl">💡</span>
              <p>
                <strong className="text-slate-700">Rekomendasi AI:</strong> Data menunjukkan efisiensi anggaran cukup baik. Fokuskan pemantauan pada 3 item stok kritis di gudang agar tidak mengganggu jadwal distribusi besok.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExecutiveDashboard;