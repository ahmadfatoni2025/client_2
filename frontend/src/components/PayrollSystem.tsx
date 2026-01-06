import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, CreditCard, Clock, CheckCircle2, RefreshCcw, Send, Briefcase } from 'lucide-react';

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
  karyawan: {
    nama_lengkap: string;
  };
}

const PayrollSystem: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [newEmp, setNewEmp] = useState({
    nama: '',
    jabatan: 'Staff Dapur',
    gaji_pokok: '',
    nama_bank: '',
    no_rekening: ''
  });

  const fetchData = async () => {
    try {
      setIsFetching(true);
      const e = await axios.get('http://localhost:3001/api/finance/employees');
      setEmployees(e.data.data);

      const h = await axios.get('http://localhost:3001/api/finance/payroll/history');
      setHistory(h.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/finance/employees', newEmp);
      setNewEmp({ nama: '', jabatan: 'Staff Dapur', gaji_pokok: '', nama_bank: '', no_rekening: '' });
      fetchData();
    } catch {
      alert("Gagal menyimpan data karyawan");
    }
  };

  const handleGenerate = async () => {
    if (!confirm("Luncurkan Payroll Massal untuk periode ini?")) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/finance/payroll/generate', {
        periode: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch {
      alert("Gagal generate payroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">

      {/* --- SIDEBAR: MANAJEMEN STAFF (4 Columns) --- */}
      <div className="lg:col-span-4 space-y-8">

        {/* Form Registrasi */}
        <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-50 relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-all opacity-50"></div>

          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <UserPlus size={20} />
            </div>
            Registrasi Karyawan
          </h3>

          <form onSubmit={handleAdd} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
              <input
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                placeholder="e.g. Budi Santoso"
                value={newEmp.nama}
                onChange={e => setNewEmp({ ...newEmp, nama: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Jabatan & Peran</label>
              <select
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                value={newEmp.jabatan}
                onChange={e => setNewEmp({ ...newEmp, jabatan: e.target.value })}
              >
                <option className="">Staff Dapur</option>
                <option className="">Ahli Gizi</option>
                <option className="">Admin Keuangan</option>
                <option className="">Logistik</option>
                <option className="">Supir</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gaji Pokok (Rp)</label>
              <input
                type="number"
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                placeholder="0"
                value={newEmp.gaji_pokok}
                onChange={e => setNewEmp({ ...newEmp, gaji_pokok: e.target.value })}
                required
              />
            </div>
            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2">
              <RefreshCcw size={16} />
              Simpan Data Staff
            </button>
          </form>
        </div>

        {/* Direktori Staff */}
        <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-50 min-h-[300px] transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Direktori Aktif ({employees.length})</h3>
            <button onClick={fetchData} className="text-slate-300 hover:text-blue-500 transition-colors">
              <RefreshCcw size={14} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
          <ul className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {employees.map(e => (
              <li key={e.id} className="p-4 bg-slate-50/50 rounded-2xl flex justify-between items-center border border-slate-100 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm uppercase">{e.nama_lengkap}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{e.jabatan}</p>
                  </div>
                </div>
                <span className="font-black text-emerald-600 text-xs tracking-tighter">
                  Rp {e.gaji_pokok.toLocaleString('id-ID')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- MAIN CONTENT: PAYROLL EXECUTION (8 Columns) --- */}
      <div className="lg:col-span-8 space-y-10">

        {/* Payroll Automation Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-500/20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner">
              <CreditCard size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Payroll Engine</h2>
              <p className="text-emerald-50 text-sm opacity-80 max-w-sm">Otomatisasi pemrosesan gaji untuk seluruh karyawan aktif dalam satu siklus aman.</p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="relative z-10 px-8 py-5 bg-white text-emerald-700 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
          >
            {loading ? <RefreshCcw className="animate-spin" size={18} /> : <Send size={18} />}
            {loading ? 'PROCESSING...' : 'RUN PAYROLL CYCLE'}
          </button>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden transition-colors">
          <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <Clock className="text-slate-400" size={20} />
              Log Riwayat Payroll
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Transaction Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6">Timestamp</th>
                  <th className="px-10 py-6">Karyawan</th>
                  <th className="px-10 py-6 text-right">Disbursement</th>
                  <th className="px-10 py-6 text-center">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-20 text-center text-slate-300">
                      <Briefcase className="mx-auto mb-4 opacity-20" size={48} />
                      <p className="text-sm font-medium italic">Belum ada riwayat transaksi penggajian.</p>
                    </td>
                  </tr>
                ) : (
                  history.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-10 py-6 text-slate-400 text-xs font-bold">
                        {new Date(h.tanggal_proses).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-10 py-6 font-black text-slate-700 uppercase">{h.karyawan?.nama_lengkap || 'Staff Member'}</td>
                      <td className="px-10 py-6 text-right font-black text-slate-900">Rp {h.total_terima.toLocaleString('id-ID')}</td>
                      <td className="px-10 py-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-inner">
                          <CheckCircle2 size={12} />
                          Disbursed
                        </div>
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