import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- PERBAIKAN DI SINI (Definisikan tipe data dengan jelas, jangan pakai any) ---
interface Employee { 
  id: string; 
  nama_lengkap: string; 
  jabatan: string; 
  gaji_pokok: number; 
  nama_bank: string; 
  no_rekening: string; 
}

interface History { 
  id: string; 
  tanggal_proses: string; 
  total_terima: number; 
  status: string; 
  // Ganti 'any' menjadi object yang spesifik
  karyawan: {
    nama_lengkap: string;
  }; 
}
// -----------------------------------------------------------------------------

const PayrollSystem: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State form input
  const [newEmp, setNewEmp] = useState({ 
    nama: '', 
    jabatan: 'Staff Dapur', 
    gaji_pokok: '', 
    nama_bank: '', 
    no_rekening: '' 
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const e = await axios.get('http://localhost:3001/api/finance/employees'); 
        setEmployees(e.data.data);
        
        const h = await axios.get('http://localhost:3001/api/finance/payroll/history'); 
        setHistory(h.data.data);
      } catch (err) { 
        console.error(err); 
      }
    };
    fetch();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try { 
      await axios.post('http://localhost:3001/api/finance/employees', newEmp); 
      window.location.reload(); 
    } catch { 
      alert("Gagal menyimpan data karyawan"); 
    }
  };

  const handleGenerate = async () => {
    if(!confirm("Generate Gaji Bulan Ini?")) return;
    setLoading(true);
    try { 
      await axios.post('http://localhost:3001/api/finance/payroll/generate', { 
        periode: new Date().toISOString().split('T')[0] 
      }); 
      window.location.reload(); 
    } catch { 
      alert("Gagal generate payroll"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans text-slate-600">
      
      {/* --- BAGIAN KIRI: INPUT KARYAWAN --- */}
      <div className="lg:col-span-1 space-y-6">
        {/* Form Input */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-cyan-50 text-cyan-600 p-1.5 rounded-lg text-sm">👤</span> Input Karyawan
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <input 
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition" 
              placeholder="Nama Lengkap" 
              value={newEmp.nama} 
              onChange={e=>setNewEmp({...newEmp, nama:e.target.value})} 
              required
            />
            <select 
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition" 
              value={newEmp.jabatan} 
              onChange={e=>setNewEmp({...newEmp, jabatan:e.target.value})}
            >
              <option>Staff Dapur</option>
              <option>Ahli Gizi</option>
              <option>Admin Keuangan</option>
              <option>Logistik</option>
              <option>Supir</option>
            </select>
            <input 
              type="number" 
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition" 
              placeholder="Gaji Pokok (Rp)" 
              value={newEmp.gaji_pokok} 
              onChange={e=>setNewEmp({...newEmp, gaji_pokok:e.target.value})} 
              required
            />
            <button className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-black transition shadow-lg">
              + Simpan Data
            </button>
          </form>
        </div>
        
        {/* List Karyawan */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50">
           <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Data Staff ({employees.length})</h3>
           <ul className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
             {employees.map(e => (
               <li key={e.id} className="p-3 bg-slate-50/80 rounded-xl flex justify-between items-center text-sm border border-slate-100 hover:border-cyan-200 transition">
                 <div>
                   <p className="font-bold text-slate-700">{e.nama_lengkap}</p>
                   <p className="text-xs text-slate-400">{e.jabatan}</p>
                 </div>
                 <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs">
                   Rp {e.gaji_pokok.toLocaleString('id-ID')}
                 </span>
               </li>
             ))}
           </ul>
        </div>
      </div>

      {/* --- BAGIAN KANAN: EKSEKUSI & RIWAYAT --- */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Kartu Eksekusi Payroll */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
             <h2 className="text-2xl font-bold">⚡ Payroll Otomatis</h2>
             <p className="text-emerald-100 text-sm mt-1">Satu klik untuk hitung & transfer semua gaji karyawan aktif.</p>
           </div>
           <button 
             onClick={handleGenerate} 
             disabled={loading} 
             className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold shadow-md hover:bg-emerald-50 hover:scale-105 transition transform"
           >
             {loading ? 'Sedang Memproses...' : 'Generate Gaji Bulan Ini'}
           </button>
        </div>

        {/* Tabel Riwayat */}
        <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-bold text-slate-700">📜 Riwayat Transfer Gaji</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Tanggal</th>
                  <th className="p-4">Nama Karyawan</th>
                  <th className="p-4 text-right">Total Terima</th>
                  <th className="p-4 pr-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada data riwayat gaji.</td></tr>
                ) : (
                  history.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 pl-6 text-slate-500 font-medium">
                        {new Date(h.tanggal_proses).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                      </td>
                      <td className="p-4 font-bold text-slate-700">{h.karyawan?.nama_lengkap || 'Unknown'}</td>
                      <td className="p-4 text-right font-bold text-slate-800">Rp {h.total_terima.toLocaleString('id-ID')}</td>
                      <td className="p-4 pr-6 text-center">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                          LUNAS
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollSystem;