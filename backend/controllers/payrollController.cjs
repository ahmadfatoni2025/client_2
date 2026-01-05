const supabase = require('../config/supabase.cjs');

// 1. Ambil Data Karyawan
exports.getEmployees = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('karyawan')
      .select('*')
      .order('nama_lengkap', { ascending: true });

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// 2. Tambah Karyawan Baru
exports.addEmployee = async (req, res) => {
  try {
    const { nama, jabatan, gaji_pokok, no_rekening, nama_bank } = req.body;

    // Validasi
    if (!nama || !gaji_pokok) {
      return res.status(400).json({ message: "Nama dan Gaji Pokok wajib diisi!" });
    }

    const { data, error } = await supabase
      .from('karyawan')
      .insert([{
        nama_lengkap: nama,
        jabatan: jabatan || 'Staff',
        gaji_pokok: parseFloat(gaji_pokok),
        no_rekening: no_rekening || '-',
        nama_bank: nama_bank || '-',
        status_aktif: true
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ status: 'success', message: 'Karyawan berhasil disimpan', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// 3. Generate Gaji Massal (Payroll Run)
exports.generatePayroll = async (req, res) => {
  try {
    const { periode } = req.body; // Contoh: "2026-02-01"

    // A. Ambil karyawan aktif
    const { data: employees, error: errEmp } = await supabase
      .from('karyawan')
      .select('*')
      .eq('status_aktif', true);
    
    if (errEmp) throw errEmp;
    if (!employees || employees.length === 0) {
      return res.status(400).json({ message: "Tidak ada karyawan aktif untuk digaji." });
    }

    // B. Siapkan data gaji (Logic sederhana: Full Gaji Pokok)
    // Nanti bisa dikembangin pakai potongan absensi
    const payrollData = employees.map(emp => ({
      id_karyawan: emp.id,
      periode_bulan: periode,
      total_terima: emp.gaji_pokok, 
      status: 'dibayar',
      tanggal_proses: new Date().toISOString()
    }));

    // C. Insert ke riwayat_gaji
    const { data, error } = await supabase
      .from('riwayat_gaji')
      .insert(payrollData)
      .select();

    if (error) throw error;

    res.status(201).json({ 
      status: 'success', 
      message: `Sukses transfer gaji ke ${employees.length} karyawan!`, 
      data 
    });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// 4. Lihat History Gaji
exports.getPayrollHistory = async (req, res) => {
  try {
    // Join tabel riwayat_gaji dengan karyawan
    const { data, error } = await supabase
      .from('riwayat_gaji')
      .select(`
        *,
        karyawan (
          nama_lengkap,
          nama_bank,
          no_rekening
        )
      `)
      .order('tanggal_proses', { ascending: false });

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};