const supabase = require('../config/supabase.cjs');

// Fungsi untuk Mencatat Transaksi Baru (Belanja)
exports.createTransaction = async (req, res) => {
  try {
    const { 
      id_anggaran, 
      tanggal, 
      keterangan, 
      nominal, 
      geo_lat, 
      geo_long,
      nama_toko 
    } = req.body;

    // 1. Validasi Data Wajib
    if (!id_anggaran || !tanggal || !nominal || !keterangan) {
      return res.status(400).json({ 
        status: 'error', 
        message: "Data wajib (Anggaran, Tanggal, Nominal, Keterangan) tidak lengkap!" 
      });
    }

    // 2. Insert ke Tabel 'transaksi'
    const { data, error } = await supabase
      .from('transaksi')
      .insert([{
        id_anggaran: id_anggaran,
        tanggal_transaksi: tanggal,
        keterangan: keterangan,
        nominal: parseFloat(nominal),
        jenis: 'keluar',        // Default 'keluar' karena ini menu belanja
        lokasi_lat: geo_lat,    // Latitude (bisa null jika GPS mati)
        lokasi_long: geo_long,  // Longitude
        nama_toko: nama_toko,
        diinput_oleh: null      // Nanti diisi user ID jika sudah ada Auth
      }])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return res.status(201).json({ 
      status: 'success', 
      message: "Transaksi belanja berhasil disimpan", 
      data: data 
    });

  } catch (err) {
    return res.status(500).json({ 
      status: 'error', 
      message: err.message 
    });
  }
};