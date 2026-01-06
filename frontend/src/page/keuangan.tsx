import { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetPlanning from '../components/BudgetPlanning';
import ExpenseTracking from '../components/ExpenseTracking';
import PayrollSystem from '../components/PayrollSystem';
import FinancialReport from '../components/FinancialReport';
import { Wallet, Landmark, ReceiptText, Users, AreaChart, RefreshCcw, TrendingUp, Calendar } from 'lucide-react';

const Keuangan = () => {
  const [activeTab, setActiveTab] = useState('rab');
  const [summary, setSummary] = useState({
    pagu: 0,
    terpakai: 0,
    serapan: 0
  });

  useEffect(() => {
    let isMounted = true;

    // Using a self-invoking async function to handle the fetching logic
    // and avoid sync setState warning in some strict linters.
    (async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/finance/dashboard/summary');
        if (isMounted && res.data.status === 'success') {
          setSummary({
            pagu: res.data.data.finance.total_anggaran,
            terpakai: res.data.data.finance.terpakai,
            serapan: res.data.data.finance.serapan
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gagal load ringkasan keuangan", err);
        }
      }
    })();

    return () => { isMounted = false; };
  }, [activeTab]);

  const tabs = [
    { id: 'rab', label: 'Perencanaan (RAB)', icon: <Landmark size={18} /> },
    { id: 'belanja', label: 'Belanja & Struk', icon: <ReceiptText size={18} /> },
    { id: 'payroll', label: 'Gaji & Karyawan', icon: <Users size={18} /> },
    { id: 'laporan', label: 'Laporan KPI', icon: <AreaChart size={18} /> },
  ];

  const handleRefresh = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/finance/dashboard/summary');
      if (res.data.status === 'success') {
        setSummary({
          pagu: res.data.data.finance.total_anggaran,
          terpakai: res.data.data.finance.terpakai,
          serapan: res.data.data.finance.serapan
        });
      }
    } catch (err) {
      console.error("Gagal refresh data", err);
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Wallet className="text-cyan-600" size={32} />
              Manajemen Keuangan
            </h1>
            <p className="text-gray-500 mt-1">Pusat kontrol anggaran, pelaporan belanja, dan payroll SPPG.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Serapan Anggaran</span>
              <span className="text-xl font-black text-cyan-600 leading-tight">{summary.serapan}%</span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-3 bg-white text-gray-400 hover:text-cyan-600 rounded-2xl border border-gray-100 shadow-sm transition-all"
            >
              <RefreshCcw size={20} />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-4xl border border-gray-50 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all">
            <div className="p-4 bg-cyan-50 text-cyan-600 rounded-2xl group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-inner">
              <Landmark size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Total Pagu</p>
              <h4 className="text-xl font-black text-gray-800">Rp {summary.pagu.toLocaleString('id-ID')}</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-gray-50 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Realisasi</p>
              <h4 className="text-xl font-black text-gray-800">Rp {summary.terpakai.toLocaleString('id-ID')}</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-gray-50 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
              <AreaChart size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Sisa Dana</p>
              <h4 className="text-xl font-black text-gray-800">Rp {(summary.pagu - summary.terpakai).toLocaleString('id-ID')}</h4>
            </div>
          </div>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex justify-start md:justify-center flex-wrap gap-2 bg-white/50 p-2 rounded-3xl border border-gray-100 backdrop-blur-sm shadow-inner overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-500 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white text-cyan-600 shadow-xl shadow-cyan-500/10 transform scale-105 border border-cyan-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/40'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700 grow">
          {activeTab === 'rab' && <BudgetPlanning />}
          {activeTab === 'belanja' && <ExpenseTracking />}
          {activeTab === 'payroll' && <PayrollSystem />}
          {activeTab === 'laporan' && <FinancialReport />}
        </div>

      </div>
    </div>
  );
};

export default Keuangan;