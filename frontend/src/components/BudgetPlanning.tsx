import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Definisi Tipe Data (Supaya Aman)
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
  
  const [formData, setFormData] = useState({
    tahun: new Date().getFullYear(),
    kategori: '',
    pagu_dana: ''
  });

  // Fetch Data
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/finance/budgets');
        setBudgets(response.data.data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/finance/budgets', {
        tahun: formData.tahun,
        kategori: formData.kategori,
        pagu_dana: parseFloat(formData.pagu_dana)
      });
      alert("✅ RAB Berhasil Disimpan!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("❌ Gagal menyimpan RAB. Cek koneksi server.");
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-600">
      
      {/* --- FORM INPUT CARD --- */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-cyan-50 text-cyan-600 p-2.5 rounded-xl text-lg">📝</span>
          <h2 className="text-xl font-bold text-slate-800">Buat Pos Anggaran Baru</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tahun Anggaran</label>
            <input 
              type="number" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none transition font-semibold text-slate-700"
              value={formData.tahun}
              onChange={(e) => setFormData({...formData, tahun: parseInt(e.target.value)})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori Belanja</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
              value={formData.kategori}
              onChange={(e) => setFormData({...formData, kategori: e.target.value})}
              required
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="Belanja Bahan Makanan">Belanja Bahan Makanan (MBG)</option>
              <option value="Operasional Dapur">Operasional Dapur</option>
              <option value="Gaji & Honorarium">Gaji & Honorarium</option>
              <option value="Logistik & Distribusi">Logistik & Distribusi</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pagu Dana (Rp)</label>
            <input 
              type="number" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none transition font-bold text-slate-800 placeholder-slate-300"
              placeholder="0"
              value={formData.pagu_dana}
              onChange={(e) => setFormData({...formData, pagu_dana: e.target.value})}
              required
            />
          </div>

          <div className="flex items-end">
            <button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all duration-300"
            >
              + Simpan RAB
            </button>
          </div>
        </form>
      </div>

      {/* --- TABEL DATA --- */}
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Daftar Anggaran Aktif</h3>
          <span className="text-xs font-medium bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-500">
            Total Pos: {budgets.length}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Tahun</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Pagu Dana</th>
                <th className="px-6 py-4 text-right">Terpakai</th>
                <th className="px-6 py-4 text-right">Sisa Anggaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400 animate-pulse">Sedang memuat data...</td></tr>
              ) : budgets.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400 italic">Belum ada data anggaran. Silakan input di atas.</td></tr>
              ) : (
                budgets.map((budget, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition duration-200">
                    <td className="px-6 py-4 font-medium text-slate-500">{budget.tahun_anggaran}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{budget.kategori}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg border border-blue-100">
                        Rp {new Intl.NumberFormat('id-ID').format(budget.pagu_dana)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-orange-500 font-medium">
                      Rp {new Intl.NumberFormat('id-ID').format(budget.terpakai)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      Rp {new Intl.NumberFormat('id-ID').format(budget.sisa_dana)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanning;