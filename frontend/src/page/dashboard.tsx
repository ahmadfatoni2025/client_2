import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  DollarSign,
  ShoppingCart,
  Calendar
} from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:3001/api/finance/dashboard/summary');
        setData(res.data.data);
        setError(null);
      } catch (err) {
        console.error("Gagal load dashboard", err);
        setError("Gagal terhubung ke server. Pastikan backend berjalan dan database telah terkonfigurasi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Menyiapkan laporan eksekutif...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-red-800 mb-2">Terjadi Kesalahan</h3>
        <p className="text-red-600 mb-6">{error || "Data tidak ditemukan."}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <LayoutDashboard className="text-blue-600" size={32} />
            Executive Command Center
          </h1>
          <p className="text-gray-500 mt-1">Ringkasan performa operasional & keuangan MBG secara terpadu</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <Calendar className="text-gray-400" size={18} />
          <span className="text-sm font-semibold text-gray-700">
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <div className="w-2 h-2 rounded-full bg-green-500 ml-2 animate-pulse"></div>
        </div>
      </div>

      {/* Alert Banner (Hanya muncul jika ada alert asli dari API) */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div className="grow">
            <h3 className="text-amber-800 font-bold mb-1">Pemberitahuan Sistem</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              {data.alerts.map((alert, idx) => (
                <div key={idx} className="text-sm text-amber-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                  {alert.pesan}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Finance Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} />
              <span>Realtime</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Realisasi Anggaran</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.finance.serapan}%</h3>
            <div className="mt-4 space-y-2">
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                  style={{ width: `${data.finance.serapan}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 flex justify-between">
                <span>Terpakai: {formatCurrency(data.finance.terpakai)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recipients Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Penerima</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.operation.total_penerima.toLocaleString()}</h3>
            <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
              <CheckCircle2 size={14} /> Terverifikasi di database
            </p>
          </div>
        </div>

        {/* Today's Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShoppingCart size={24} />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Hari Ini</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Distribusi Makanan</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.operation.distribusi_hari_ini.toLocaleString()}</h3>
            <p className="text-xs text-gray-400 mt-2">
              Porsi tersalurkan hari ini
            </p>
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl transition-colors ${data.operation.stok_kritis > 0 ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white' : 'bg-green-50 text-green-600'}`}>
              <Package size={24} />
            </div>
            {data.operation.stok_kritis > 0 && <span className="animate-pulse w-2 h-2 rounded-full bg-orange-500"></span>}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Stok Logistik</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.operation.stok_kritis} Item Kritis</h3>
            <p className={`text-xs font-medium mt-2 ${data.operation.stok_kritis > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {data.operation.stok_kritis > 0 ? 'Segera lakukan pengadaan' : 'Stok aman terkendali'}
            </p>
          </div>
        </div>

      </div>

      {/* Secondary Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Chart/Visual Placeholder (Left 2/3) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={24} />
              Ikhtisar Performa KPI
            </h3>
            <select className="bg-gray-50 border-none text-sm font-semibold text-gray-600 rounded-lg px-3 py-2 outline-none cursor-pointer">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>

          <div className="space-y-6">
            {/* KPI Item 1 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">Efisiensi Rantai Pasok</span>
                <span className="text-sm font-bold text-blue-600">92%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[92%] rounded-full"></div>
              </div>
            </div>

            {/* KPI Item 2 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">Kepuasan Penerima Manfaat</span>
                <span className="text-sm font-bold text-emerald-600">{data.operation.kepuasan}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${data.operation.kepuasan}%` }}></div>
              </div>
            </div>

            {/* KPI Item 3 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">Ketepatan Waktu Pengiriman</span>
                <span className="text-sm font-bold text-indigo-600">88%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[88%] rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="mt-10 p-5 bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg shadow-blue-200">
            <div className="flex gap-4 items-center">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">Analisis AI MBG</h4>
                <p className="text-blue-50 text-sm opacity-90">
                  {/* TEXT DUMMY DIHAPUS, DIGANTI PESAN DEFAULT */}
                  Sistem sedang mengumpulkan data historis untuk memberikan prediksi yang akurat.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info (Right 1/3) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="text-orange-500" size={20} />
              Aktivitas Terakhir
            </h3>
            
            {/* DATA DUMMY DIHAPUS TOTAL DI SINI */}
            <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="p-3 bg-gray-50 rounded-full mb-3">
                         <Clock size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-xs font-medium">Belum ada aktivitas tercatat hari ini.</p>
                </div>
            </div>

            <button className="w-full mt-2 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-50">
              Lihat Semua Aktivitas
            </button>
          </div>

          <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            <h4 className="text-lg font-bold mb-2 relative z-10">Unduh Laporan</h4>
            <p className="text-indigo-200 text-sm mb-6 relative z-10">Dapatkan versi PDF lengkap untuk rapat pimpinan.</p>
            <button className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors relative z-10 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20">
              Generate PDF
              <ArrowDownRight size={18} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ExecutiveDashboard;