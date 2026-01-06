const supabase = require('../config/supabase.cjs');

exports.getFinancialSummary = async (req, res) => {
  try {
    // 1. Ambil Data Anggaran (Total Pagu)
    const budgetReq = await supabase.from('anggaran').select('pagu_dana');
    
    // 2. Ambil Transaksi BELANJA (Detail)
    const trxReq = await supabase
      .from('transaksi')
      .select('id, tanggal_transaksi, keterangan, nominal, nama_toko')
      .eq('jenis', 'keluar')
      .order('tanggal_transaksi', { ascending: false });

    // 3. Ambil Riwayat GAJI (Detail)
    const payrollReq = await supabase
      .from('riwayat_gaji')
      .select(`
        id, 
        tanggal_proses, 
        total_terima, 
        karyawan (nama_lengkap)
      `)
      .order('tanggal_proses', { ascending: false });

    // Cek Error
    if (budgetReq.error) throw budgetReq.error;
    if (trxReq.error) throw trxReq.error;
    if (payrollReq.error) throw payrollReq.error;

    // --- HITUNG TOTAL (SUMMARY) ---
    const totalAnggaran = budgetReq.data.reduce((acc, curr) => acc + curr.pagu_dana, 0);
    const totalBelanja = trxReq.data.reduce((acc, curr) => acc + curr.nominal, 0);
    const totalGaji = payrollReq.data.reduce((acc, curr) => acc + curr.total_terima, 0);
    
    const totalPengeluaran = totalBelanja + totalGaji;
    const sisaDana = totalAnggaran - totalPengeluaran;

    // --- GABUNGKAN DATA UNTUK TABEL RINCIAN ---
    // Kita format supaya struktur datanya seragam antara Belanja & Gaji
    const listBelanja = trxReq.data.map(item => ({
      id: item.id,
      tanggal: item.tanggal_transaksi,
      kategori: 'Belanja Operasional',
      keterangan: `${item.keterangan} (${item.nama_toko || 'Toko'})`,
      masuk: 0,
      keluar: item.nominal,
      tipe: 'expense'
    }));

    const listGaji = payrollReq.data.map(item => ({
      id: item.id,
      tanggal: item.tanggal_proses,
      kategori: 'Gaji Karyawan',
      keterangan: `Gaji Bulan Ini - ${item.karyawan.nama_lengkap}`,
      masuk: 0,
      keluar: item.total_terima,
      tipe: 'payroll'
    }));

    // Gabung dan Sortir berdasarkan Tanggal Terbaru
    const mutasi = [...listBelanja, ...listGaji].sort((a, b) => 
      new Date(b.tanggal) - new Date(a.tanggal)
    );

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          total_anggaran: totalAnggaran,
          total_pengeluaran: totalPengeluaran,
          sisa_dana: sisaDana,
          detail: { belanja: totalBelanja, gaji: totalGaji }
        },
        mutasi: mutasi // <--- INI DATA BARUNYA
      }
    });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};