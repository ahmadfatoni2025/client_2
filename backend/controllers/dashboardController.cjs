const supabase = require('../config/supabase.cjs');

exports.getDashboardStats = async (req, res) => {
  try {
    // --- 1. DATA REAL DARI KEUANGAN (Kerjaan Kita) ---
    // Mengambil total Pagu Anggaran & Total Belanja secara paralel
    const [budgetReq, trxReq] = await Promise.all([
      supabase.from('anggaran').select('pagu_dana'),
      supabase.from('transaksi').select('nominal').eq('jenis', 'keluar')
    ]);

    // Hitung Total Anggaran
    const totalAnggaran = budgetReq.data 
      ? budgetReq.data.reduce((acc, curr) => acc + curr.pagu_dana, 0) 
      : 0;

    // Hitung Total Terpakai
    const totalTerpakai = trxReq.data 
      ? trxReq.data.reduce((acc, curr) => acc + curr.nominal, 0) 
      : 0;

    const sisaDana = totalAnggaran - totalTerpakai;
    // Hitung Persentase Serapan (cegah pembagian nol)
    const serapanPersen = totalAnggaran > 0 ? Math.round((totalTerpakai / totalAnggaran) * 100) : 0;


    // --- 2. DATA OPERASIONAL (Simulasi Kerjaan Tim Lain) ---
    // Nanti diganti query database kalau tim lain sudah setor tabel
    const operationalData = {
      total_penerima: 1500,        // Contoh: Data Anak Sekolah
      distribusi_hari_ini: 1450,   // Contoh: Porsi Makan Siang
      kepuasan: 94,                // Contoh: Survey
      stok_kritis: 3               // Contoh: Item gudang mau habis
    };


    // --- 3. LOGIC ALERT SYSTEM ---
    const alerts = [];

    // Alert Real Keuangan
    if (sisaDana < 5000000) {
      alerts.push({ level: 'critical', pesan: '⚠️ Kas Operasional Menipis (Di bawah 5 Juta)!' });
    }
    if (serapanPersen > 90) {
      alerts.push({ level: 'warning', pesan: '⚠️ Anggaran hampir habis (Serapan > 90%).' });
    }

    // Alert Simulasi (Bisa dihapus nanti)
    alerts.push({ level: 'info', pesan: '📅 Jadwal Audit BPK dijadwalkan Senin depan.' });
    alerts.push({ level: 'warning', pesan: '📦 Stok Beras di Gudang tersisa 2 hari.' });

    // Kirim Response
    res.status(200).json({
      status: 'success',
      data: {
        finance: {
          total_anggaran: totalAnggaran,
          terpakai: totalTerpakai,
          sisa: sisaDana,
          serapan: serapanPersen
        },
        operation: operationalData,
        alerts: alerts
      }
    });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};