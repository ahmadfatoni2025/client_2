import { useState } from 'react';
import BudgetPlanning from '../components/BudgetPlanning';
import ExpenseTracking from '../components/ExpenseTracking';
import PayrollSystem from '../components/PayrollSystem';
import FinancialReport from '../components/FinancialReport';

const Keuangan = () => {
  const [activeTab, setActiveTab] = useState('rab');

  return (
    <div className="w-full space-y-8 font-sans text-slate-600">
      
      {/* HEADER & TABS CONTAINER */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">💰 Manajemen Keuangan</h1>
          <p className="text-slate-400 text-sm">Pusat kontrol anggaran, belanja, dan penggajian.</p>
        </div>

        {/* NAVIGATION PILLS */}
        <div className="flex flex-wrap justify-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-100">
          {[
            { id: 'rab', label: '📊 Perencanaan (RAB)' },
            { id: 'belanja', label: '💸 Belanja & Struk' },
            { id: 'payroll', label: '👥 Gaji & Absensi' },
            { id: 'laporan', label: '📈 Laporan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-cyan-600 shadow-md transform scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-125">
        {activeTab === 'rab' && <BudgetPlanning />}
        {activeTab === 'belanja' && <ExpenseTracking />}
        {activeTab === 'payroll' && <PayrollSystem />}
        {activeTab === 'laporan' && <FinancialReport />}
      </div>

    </div>
  );
};

export default Keuangan;