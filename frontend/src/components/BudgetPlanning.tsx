import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Landmark, Plus, RefreshCcw, Wallet, Info, CheckCircle2 } from 'lucide-react';

interface Budget {
  id_anggaran: string;
  tahun_anggaran: number;
  kategori: string;
  pagu_dana: number;
  terpakai: number;
  sisa_dana: number;
}

const BudgetPlanning: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    tahun: new Date().getFullYear(),
    kategori: '',
    pagu_dana: ''
  });

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/finance/budgets');
      setBudgets(response.data.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.post('http://localhost:3001/api/finance/budgets', {
        tahun: formData.tahun,
        kategori: formData.kategori,
        pagu_dana: parseFloat(formData.pagu_dana)
      });
      setFormData({ ...formData, kategori: '', pagu_dana: '' });
      fetchBudgets();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan RAB.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* --- FORM SECTION --- */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-50 relative overflow-hidden group transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-all duration-700 opacity-50"></div>

        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl shadow-inner">
            <Landmark size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Perencanaan Anggaran (RAB)</h2>
            <p className="text-slate-400 text-sm">Alokasikan dana untuk pos pengeluaran operasional MBG.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tahun Anggaran</label>
            <input
              type="number"
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
              value={formData.tahun}
              onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kategori Belanja</label>
            <select
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none appearance-none"
              value={formData.kategori}
              onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              required
            >
              <option value="" className="">Pilih Kategori</option>
              <option value="Belanja Bahan Makanan" className="">Belanja Bahan Makanan (MBG)</option>
              <option value="Operasional Dapur" className="">Operasional Dapur</option>
              <option value="Gaji & Honorarium" className="">Gaji & Honorarium</option>
              <option value="Logistik & Distribusi" className="">Logistik & Distribusi</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pagu Dana (Rp)</label>
            <input
              type="number"
              placeholder="Min. 1,000,000"
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
              value={formData.pagu_dana}
              onChange={(e) => setFormData({ ...formData, pagu_dana: e.target.value })}
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-bold shadow-xl shadow-cyan-600/20 hover:bg-cyan-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSaving ? <RefreshCcw className="animate-spin" size={18} /> : <Plus size={20} />}
              Simpan Pos Anggaran
            </button>
          </div>
        </form>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden transition-colors">
        <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <Wallet className="text-slate-400 cursor-pointer" size={20} />
            Dafar Master Anggaran
          </h3>
          <button onClick={fetchBudgets} className="p-2.5 bg-white text-slate-400 hover:text-cyan-600 rounded-xl border border-slate-100 transition-colors">
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Kategori Belanja</th>
                <th className="px-10 py-6 text-center">Tahun</th>
                <th className="px-10 py-6 text-right">Pagu Dana</th>
                <th className="px-10 py-6 text-right">Serapan (%)</th>
                <th className="px-10 py-6 text-right">Sisa Anggaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-8 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : budgets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <Info className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 font-medium tracking-tight uppercase tracking-widest text-[10px]">Belum ada alokasi anggaran yang didaftarkan.</p>
                  </td>
                </tr>
              ) : (
                budgets.map((budget, index) => {
                  const serapan = Math.round((budget.terpakai / budget.pagu_dana) * 100) || 0;
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                          <span className="font-bold text-slate-700">{budget.kategori}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-medium text-slate-400 text-center">{budget.tahun_anggaran}</td>
                      <td className="px-10 py-6 text-right">
                        <span className="text-slate-900 font-black">Rp {budget.pagu_dana.toLocaleString('id-ID')}</span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-black ${serapan > 90 ? 'text-red-500 font-bold' : 'text-cyan-600'}`}>{serapan}%</span>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${serapan > 90 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]'}`} style={{ width: `${serapan}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-emerald-600 font-bold">
                          <CheckCircle2 size={14} />
                          Rp {budget.sisa_dana.toLocaleString('id-ID')}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanning;