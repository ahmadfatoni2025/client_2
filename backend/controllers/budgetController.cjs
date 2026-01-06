// Perhatikan: pakai .cjs di akhir
const supabase = require('../config/supabase.cjs');

// 1. GET: Ambil Data Anggaran
exports.getBudgets = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('view_realisasi_anggaran')
      .select('*')
      .order('tahun_anggaran', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ status: 'success', data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// 2. POST: Tambah Anggaran Baru
exports.createBudget = async (req, res) => {
  try {
    const { tahun, kategori, pagu_dana } = req.body;

    // Validasi input
    if (!tahun || !kategori || !pagu_dana) {
      return res.status(400).json({ message: "Data tahun, kategori, dan pagu dana wajib diisi!" });
    }

    // Insert ke tabel 'anggaran'
    const { data, error } = await supabase
      .from('anggaran')
      .insert([{ 
        tahun_anggaran: tahun, 
        kategori: kategori, 
        pagu_dana: pagu_dana,
        status: 'disetujui'
      }])
      .select();

    if (error) throw error;

    return res.status(201).json({ status: 'success', message: "RAB berhasil dibuat", data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};