import React, { useState, useEffect, useCallback } from 'react';
import { Package, Truck, Calendar, Hash, FileText, Send, Info } from 'lucide-react';

interface Supplier {
  id: string | number;
  name: string;
}

const Order = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    supplier_id: '',
    quantity: '',
    order_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/pemasok');
      const result = await response.json();
      if (result.success) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        alert('Order berhasil ditambahkan!');
        setFormData({
          product_name: '',
          supplier_id: '',
          quantity: '',
          order_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Gagal menambahkan order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Form Side */}
        <div className="w-full lg:w-[450px]">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-black tracking-tight">Formulir Pesanan</h2>
                  <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Input Stock procurement</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <FileText size={14} /> Nama Produk
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  placeholder="e.g. Beras Premium Crystal"
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 font-medium text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Hash size={14} /> Jumlah
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Calendar size={14} /> Tanggal
                  </label>
                  <input
                    type="date"
                    name="order_date"
                    value={formData.order_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Truck size={14} /> Pilih Pemasok
                </label>
                <div className="relative">
                  <select
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all appearance-none font-medium text-sm cursor-pointer"
                    required
                  >
                    <option value="" className="">-- Pilih Supplier --</option>
                    {suppliers.map((s: Supplier) => (
                      <option key={s.id} value={s.id} className="">{s.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Truck size={14} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Catatan Pengadaan
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Detail instruksi atau spesifikasi..."
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all resize-none text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative flex items-center justify-center gap-3 bg-black text-white py-4 px-4 rounded-xl font-bold shadow-xl shadow-black/10 hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    Kirim Pesanan Baru
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Info/Guide Side */}
        <div className="flex-1 space-y-6 w-full">
          <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden group shadow-xl shadow-blue-500/10">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Truck size={120} />
            </div>
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-2xl font-black tracking-tight mb-2">Automated Ordering</h3>
              <p className="text-blue-100/80 text-sm max-w-[300px] mb-6 italic">Sistem akan secara otomatis mencatat pengadaan baru ke dalam log histori logistik.</p>
              <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">System Balanced</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuideCard
              icon={<Info size={20} className="text-blue-600" />}
              title="Pilih Supplier"
              desc="Pastikan supplier sudah terdaftar di tab Manage Supplier terlebih dahulu."
            />
            <GuideCard
              icon={<Hash size={20} className="text-purple-600" />}
              title="Validasi Jumlah"
              desc="Gunakan satuan standar (kg, pcs, box) untuk memudahkan pelacakan stok."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface GuideCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const GuideCard = ({ icon, title, desc }: GuideCardProps) => (
  <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl hover:border-black/10 transition-all group">
    <div className="mb-4 p-3 bg-gray-50 w-fit rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
    <h4 className="text-sm font-bold text-black mb-1">{title}</h4>
    <p className="text-xs text-gray-500 leading-relaxed font-medium">{desc}</p>
  </div>
);

export default Order;
