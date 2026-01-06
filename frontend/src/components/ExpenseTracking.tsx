import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Calendar, Store, CreditCard, FileText, MapPin, Navigation, Save, RefreshCcw, CheckCircle2 } from 'lucide-react';

interface Budget {
  id_anggaran: string;
  kategori: string;
  sisa_dana: number;
}

const ExpenseTracking: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [formData, setFormData] = useState({
    id_anggaran: '',
    tanggal: new Date().toISOString().split('T')[0],
    nama_toko: '',
    keterangan: '',
    nominal: ''
  });

  const [geo, setGeo] = useState<{ lat: number | null, long: number | null, status: 'idle' | 'loading' | 'success' | 'error' }>({
    lat: null,
    long: null,
    status: 'idle'
  });

  const fetchBudgets = async () => {
    try {
      setIsFetching(true);
      const res = await axios.get('http://localhost:3001/api/finance/budgets');
      setBudgets(res.data.data);
    } catch (err) {
      console.error("Gagal ambil anggaran", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeo({ ...geo, status: 'error' });
      return;
    }
    setGeo({ ...geo, status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeo({
          lat: position.coords.latitude,
          long: position.coords.longitude,
          status: 'success'
        });
      },
      () => {
        setGeo({ ...geo, status: 'error' });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:3001/api/finance/transactions', {
        ...formData,
        nominal: parseFloat(formData.nominal),
        geo_lat: geo.lat,
        geo_long: geo.long
      });

      alert("Transaksi berhasil disimpan!");
      setFormData({
        id_anggaran: '',
        tanggal: new Date().toISOString().split('T')[0],
        nama_toko: '',
        keterangan: '',
        nominal: ''
      });
      setGeo({ lat: null, long: null, status: 'idle' });
      fetchBudgets();

    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan transaksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">

      <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-50 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl shadow-inner">
              <ShoppingCart size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pelaporan Belanja Operasional</h2>
              <p className="text-slate-400 text-sm">Input data transaksi belanja harian dengan validasi lokasi.</p>
            </div>
          </div>
          <button
            onClick={fetchBudgets}
            className="p-3 bg-slate-50 text-slate-400 hover:text-orange-600 rounded-2xl transition-all"
          >
            <RefreshCcw size={20} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <CreditCard size={14} /> Sumber Anggaran (RAB)
              </label>
              <select
                required
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all outline-none appearance-none"
                value={formData.id_anggaran}
                onChange={(e) => setFormData({ ...formData, id_anggaran: e.target.value })}
              >
                <option value="">-- Pilih Pos Anggaran --</option>
                {budgets.map((b) => (
                  <option key={b.id_anggaran} value={b.id_anggaran}>
                    {b.kategori} (Sisa: Rp {b.sisa_dana.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <Calendar size={14} /> Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <Store size={14} /> Nama Toko / Vendor
              </label>
              <input
                type="text"
                placeholder="Contoh: PD. Sayur Mayur"
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                value={formData.nama_toko}
                onChange={(e) => setFormData({ ...formData, nama_toko: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <CreditCard size={14} /> Nominal Belanja (Rp)
              </label>
              <input
                type="number"
                required
                placeholder="0"
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-lg font-black text-slate-800 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <FileText size={14} /> Rincian Belanja
            </label>
            <textarea
              required
              rows={3}
              placeholder="Sebutkan item utama yang dibeli..."
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
            ></textarea>
          </div>

          {/* Validation Tool */}
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl transition-all ${geo.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Validasi Geospasial</h4>
                <p className="text-xs text-slate-400 mt-1">Sematkan koordinat lokasi pembelian sebagai bukti audit fisik.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={geo.status === 'success'}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all
                ${geo.status === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-orange-500 hover:text-orange-600 shadow-sm'
                }`}
            >
              {geo.status === 'loading' ? <RefreshCcw className="animate-spin" size={16} /> : geo.status === 'success' ? <CheckCircle2 size={16} /> : <Navigation size={16} />}
              {geo.status === 'loading' ? 'Mendeteksi...' : geo.status === 'success' ? 'LOKASI TERKUNCI' : 'AMBIL LOKASI'}
            </button>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'MEMPROSES DATA...' : 'SUBMIT TRANSAKSI'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ExpenseTracking;