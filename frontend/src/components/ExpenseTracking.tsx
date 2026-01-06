import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interface
interface Budget {
  id_anggaran: string;
  kategori: string;
  sisa_dana: number;
}

const ExpenseTracking: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id_anggaran: '',
    tanggal: new Date().toISOString().split('T')[0],
    nama_toko: '',
    keterangan: '',
    nominal: ''
  });

  // Type Geo diperjelas
  const [geo, setGeo] = useState<{lat: number | null, long: number | null, status: string}>({
    lat: null, 
    long: null, 
    status: 'idle'
  });

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/finance/budgets');
        setBudgets(res.data.data);
      } catch (err) {
        console.error("Gagal ambil anggaran", err);
      }
    };
    fetchBudgets();
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeo({ ...geo, status: 'error' });
      alert("Browser tidak mendukung Geolocation");
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
      (error) => {
        console.error(error);
        setGeo({ ...geo, status: 'error' });
        alert("Gagal mengambil lokasi. Pastikan GPS aktif!");
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

      alert("✅ Transaksi Belanja Berhasil Disimpan!");
      // Reset Form
      setFormData({
        id_anggaran: '',
        tanggal: new Date().toISOString().split('T')[0],
        nama_toko: '',
        keterangan: '',
        nominal: ''
      });
      setGeo({ lat: null, long: null, status: 'idle' });
      
      // Opsional: Reload untuk refresh dashboard
      window.location.reload(); 

    } catch (error) {
      // FIX TYPE ANY: Cek error axios dengan aman
      let pesan = "Gagal menyimpan transaksi.";
      if (axios.isAxiosError(error) && error.response) {
        pesan = error.response.data.message || pesan;
      }
      console.error(error);
      alert("❌ " + pesan);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-sans text-slate-600">
      
      <div className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50">
        <div className="flex items-center gap-3 mb-8">
          <span className="bg-orange-100 text-orange-600 p-2.5 rounded-xl text-lg">🛒</span>
          <h2 className="text-xl font-bold text-slate-800">Input Belanja & Bukti (E-Receipt)</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Baris 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sumber Anggaran (RAB)</label>
              <select 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
                value={formData.id_anggaran}
                onChange={(e) => setFormData({...formData, id_anggaran: e.target.value})}
              >
                <option value="">-- Pilih Pos Anggaran --</option>
                {budgets.map((b) => (
                  <option key={b.id_anggaran} value={b.id_anggaran}>
                    {b.kategori} (Sisa: Rp {new Intl.NumberFormat('id-ID').format(b.sisa_dana)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal Belanja</label>
              <input 
                type="date" 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
                value={formData.tanggal}
                onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
              />
            </div>
          </div>

          {/* Baris 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Toko / Vendor</label>
              <input 
                type="text" 
                placeholder="Contoh: TB. Makmur Jaya"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
                value={formData.nama_toko}
                onChange={(e) => setFormData({...formData, nama_toko: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nominal Belanja (Rp)</label>
              <input 
                type="number" 
                required
                placeholder="0"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none transition font-bold text-slate-800"
                value={formData.nominal}
                onChange={(e) => setFormData({...formData, nominal: e.target.value})}
              />
            </div>
          </div>

          {/* Baris 3 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keterangan Barang</label>
            <textarea 
              required
              rows={3}
              placeholder="Rincian barang yang dibeli..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
              value={formData.keterangan}
              onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
            ></textarea>
          </div>

          {/* --- FITUR GEOTAGGING (Soft Style) --- */}
          <div className="bg-cyan-50/50 border border-cyan-100 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <label className="text-sm font-bold text-cyan-800 flex items-center gap-2">
                📍 Validasi Lokasi (Audit Trail)
              </label>
              <p className="text-xs text-cyan-600 mt-1">
                Wajib mengambil titik lokasi saat belanja di pasar/toko sebagai bukti fisik.
              </p>
            </div>
            
            <button 
              type="button"
              onClick={handleGetLocation}
              disabled={geo.status === 'loading' || geo.status === 'success'}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                geo.status === 'success' 
                  ? 'bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200' 
                  : 'bg-white border border-cyan-200 text-cyan-600 hover:bg-cyan-500 hover:text-white shadow-sm hover:shadow-cyan-500/30'
              }`}
            >
              {geo.status === 'loading' ? (
                <>📡 Mencari Satelit...</>
              ) : geo.status === 'success' ? (
                <>✅ Lokasi Terkunci</>
              ) : (
                <>📡 Ambil Lokasi GPS</>
              )}
            </button>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-800/20 hover:bg-black hover:-translate-y-1 transition-all duration-300"
            >
              {loading ? 'Menyimpan Transaksi...' : '💾 Simpan Transaksi Belanja'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ExpenseTracking;