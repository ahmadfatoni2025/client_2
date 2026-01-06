import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import Library Excel

// Interface Data
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

  useEffect(() => {
    axios.get('http://localhost:3001/api/finance/report/summary')
      .then(res => setData(res.data.data))
      .catch(err => console.error(err));
  }, []);

  // --- FUNGSI EXPORT EXCEL ---
  const handleExportExcel = () => {
    if (!data) return;

    // 1. Siapkan Data untuk Excel (Format Array of Objects)
    const excelData = data.mutasi.map(item => ({
      Tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
      Kategori: item.kategori,
      Keterangan: item.keterangan,
      'Jumlah Pengeluaran (Rp)': item.keluar
    }));

    // 2. Buat Worksheet & Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");

    // 3. Download File
    XLSX.writeFile(workbook, `Laporan_SPPG_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (!data) return <div className="p-10 text-center animate-pulse text-slate-400">Menarik Data Pembukuan...</div>;
  
  const persen = Math.round((data.summary.total_pengeluaran / data.summary.total_anggaran) * 100) || 0;

  return (
    <div className="space-y-8 font-sans text-slate-600">
      
      {/* HEADER & ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Laporan & Audit Keuangan</h2>
          <p className="text-sm text-slate-400">Rekapitulasi anggaran dan arus kas keluar.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            📊 Export Excel (.xlsx)
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-black transition flex items-center gap-2 print:hidden"
          >
            🖨️ Cetak PDF
          </button>
        </div>
      </div>

      {/* 1. SUMMARY CARDS (Tetap dipertahankan karena penting) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
        {/* Total Anggaran */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Pagu Anggaran</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
            Rp {data.summary.total_anggaran.toLocaleString('id-ID')}
          </h3>
          <div className="w-full bg-slate-100 h-2 mt-4 rounded-full">
            <div className="bg-blue-500 h-2 rounded-full w-full"></div>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50">
          <div className="flex justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase">Realisasi Pengeluaran</p>
            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded">{persen}%</span>
          </div>
          <h3 className="text-3xl font-extrabold text-orange-500 mt-2">
            Rp {data.summary.total_pengeluaran.toLocaleString('id-ID')}
          </h3>
          <div className="w-full bg-slate-100 h-2 mt-4 rounded-full">
            <div className={`bg-orange-500 h-2 rounded-full`} style={{width: `${persen}%`}}></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>🛒 Belanja: {data.summary.detail.belanja.toLocaleString()}</span>
            <span>👥 Gaji: {data.summary.detail.gaji.toLocaleString()}</span>
          </div>
        </div>

        {/* Sisa Kas */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50">
          <p className="text-xs font-bold text-slate-400 uppercase">Sisa Kas Tersedia</p>
          <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">
            Rp {data.summary.sisa_dana.toLocaleString('id-ID')}
          </h3>
          <div className="w-full bg-slate-100 h-2 mt-4 rounded-full">
            <div className="bg-emerald-500 h-2 rounded-full w-full"></div>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-bold">
            {data.summary.sisa_dana > 0 ? 'Status: AMAN ✅' : 'Status: DEFISIT ⚠️'}
          </p>
        </div>
      </div>

      {/* 2. TABEL RINCIAN MUTASI (INI YANG BARU) */}
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            📋 Rincian Mutasi Transaksi
            <span className="text-xs font-normal bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
              {data.mutasi.length} Item
            </span>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 pl-6">Tanggal</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Keterangan Transaksi</th>
                <th className="p-4 pr-6 text-right">Nominal (Keluar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.mutasi.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada transaksi tercatat.</td></tr>
              ) : (
                data.mutasi.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 pl-6 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        item.tipe === 'payroll' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {item.kategori}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                      {item.keterangan}
                    </td>
                    <td className="p-4 pr-6 text-right font-bold text-slate-800">
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