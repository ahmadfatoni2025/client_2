import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { AreaChart, Printer, FileSpreadsheet, History, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReportData {
  summary: {
    total_anggaran: number;
    total_pengeluaran: number;
    sisa_dana: number;
    detail: { belanja: number; gaji: number; };
  };
  mutasi: {
    id: string;
    tanggal: string;
    kategori: string;
    keterangan: string;
    masuk: number;
    keluar: number;
    tipe: string;
  }[];
}

const FinancialReport: React.FC = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/api/finance/report/summary');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportExcel = () => {
    if (!data) return;
    const excelData = data.mutasi.map(item => ({
      Tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
      Kategori: item.kategori,
      Keterangan: item.keterangan,
      'Jumlah Pengeluaran (Rp)': item.keluar
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");
    XLSX.writeFile(workbook, `Laporan_SPPG_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-slate-400">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
      <p className="font-bold">Mengkalkulasi Audit...</p>
    </div>
  );

  if (!data) return <div className="p-10 text-center text-red-500">Gagal memuat laporan.</div>;

  const persen = Math.round((data.summary.total_pengeluaran / data.summary.total_anggaran) * 100) || 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
            <AreaChart size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Audit & Transparansi Keuangan</h2>
            <p className="text-slate-400 text-sm">Rekapitulasi total anggaran dan mutasi arus kas real-time.</p>
          </div>
        </div>
        <div className="flex gap-3 print:hidden">
          <button
            onClick={handleExportExcel}
            className="px-6 py-3 bg-white text-emerald-600 border border-emerald-100 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10"
          >
            <Printer size={18} />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pagu Anggaran</p>
          <h3 className="text-3xl font-black text-slate-800">
            Rp {data.summary.total_anggaran.toLocaleString('id-ID')}
          </h3>
          <div className="w-full bg-slate-100 h-1.5 mt-6 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-full"></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Realisasi Belanja</p>
            <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{persen}%</span>
          </div>
          <h3 className="text-3xl font-black text-orange-500">
            Rp {data.summary.total_pengeluaran.toLocaleString('id-ID')}
          </h3>
          <div className="w-full bg-slate-100 h-1.5 mt-6 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${persen}%` }}></div>
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group ${data.summary.sisa_dana >= 0 ? 'bg-white border-slate-50' : 'bg-red-50 border-red-100'}`}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Balance (Sisa Dana)</p>
          <h3 className={`text-3xl font-black ${data.summary.sisa_dana >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            Rp {data.summary.sisa_dana.toLocaleString('id-ID')}
          </h3>
          <div className="flex items-center gap-2 mt-6">
            {data.summary.sisa_dana >= 0 ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-500" />}
            <span className={`text-[10px] font-black uppercase tracking-widest ${data.summary.sisa_dana >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {data.summary.sisa_dana >= 0 ? 'Status: Kas Aman' : 'Status: Kas Defisit'}
            </span>
          </div>
        </div>
      </div>

      {/* MUTASI TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <History className="text-slate-400" size={20} />
            Log Mutasi Pembukuan
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.mutasi.length} ENTRIES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Timestamp</th>
                <th className="px-10 py-6">Kategori Audit</th>
                <th className="px-10 py-6">Keterangan</th>
                <th className="px-10 py-6 text-right">Debit/Kredit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.mutasi.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <Info className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 font-medium italic">Belum ada aktivitas mutasi dana.</p>
                  </td>
                </tr>
              ) : (
                data.mutasi.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-6 text-slate-400 text-xs font-bold whitespace-nowrap">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.tipe === 'payroll'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-slate-700 font-medium">
                      {item.keterangan}
                    </td>
                    <td className="px-10 py-6 text-right font-black text-slate-900">
                      Rp {item.keluar.toLocaleString('id-ID')}
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

export default FinancialReport;