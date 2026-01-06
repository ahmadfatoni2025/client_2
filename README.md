# SPPG System (Satuan Pelayanan Pemenuhan Gizi)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.2-purple.svg)
![Supabase](https://img.shields.io/badge/Supabase-DB-green.svg)

SPPG System adalah platform manajemen modern yang dirancang untuk mengelola inventaris, nutrisi, operasional dapur, dan keuangan dalam satu ekosistem yang terintegrasi. Dibangun dengan estetika premium dan performa tinggi menggunakan teknologi web terbaru.

## 🚀 Fitur Utama

### 1. Management Inventaris (Gudang)
Modul komprehensif untuk mengelola aset gudang secara real-time.
- **Stock Opname**: Pencatatan stok barang dengan dukungan sinkronisasi real-time.
- **Executive Summary**: Dashboard ringkasan stok, peringatan stok rendah, dan antrian pesanan.
- **Order Management**: Pembuatan dan pelacakan pesanan (purchase orders) ke pemasok.
- **Supplier Directory**: Manajemen data pemasok/suplayer untuk mempermudah pengadaan.
- **Sync Stock**: Fitur sinkronisasi otomatis untuk memastikan data gudang tetap akurat.

### 2. Manajemen Nutrisi
- Perencanaan dan pemantauan nilai gizi untuk setiap menu.
- Database nutrisi bahan baku yang terintegrasi dengan stok gudang.

### 3. Operasional Dapur
- Monitoring status persiapan makanan.
- Alur kerja efisien dari pemesanan hingga penyajian.

### 4. Keuangan & Laporan
- **Laporan Keuangan**: Pencatatan arus kas dan biaya operasional.
- **Analitik & Reporting**: Visualisasi data performa sistem untuk pengambilan keputusan strategis.

### 5. Fitur Pendukung
- **Barcode/QR Scanner**: Mendukung pemindaian langsung untuk mempercepat proses input barang.
- **Premium UI/UX**: Antarmuka modern dengan dukungan glassmorphism, animasi halus, dan mode responsif.
- **Search Global**: Fitur pencarian cepat di seluruh modul aplikasi.

## 🛠️ Tech Stack

### Frontend
- **React 19**: Library core untuk UI.
- **Vite**: Build tool super cepat.
- **Tailwind CSS**: Styling framework dengan kustomisasi mendalam.
- **Lucide React**: Set ikon modern yang konsisten.
- **Radix UI**: Komponen UI aksesibel (Progress, Select, Tabs, dll).
- **Recharts**: Library chart untuk visualisasi data laporan.

### Backend
- **Node.js & Express**: Server proxy untuk mengelola request API.
- **Supabase**: Database PostgreSQL as a Service dengan integrasi real-time.
- **Generic API Routing**: Arsitektur backend fleksibel yang mendukung operasi CRUD ke semua tabel Supabase secara dinamis.

## 📦 Struktur Proyek

```text
MBG - Copy/
├── frontend/             # Aplikasi React (Client-side)
│   ├── src/
│   │   ├── components/   # Komponen UI & Modul (Gudang, Navbar, UI)
│   │   ├── page/         # Halaman utama aplikasi
│   │   └── App.tsx       # Routing & Entrypoint
├── backend/              # Node.js Server (Proxy Supabase)
│   ├── server.cjs        # Main server logic
│   └── .env              # Konfigurasi Supabase
└── README.md             # Dokumentasi proyek
```

## 🏁 Memulai

### Prasyarat
- Node.js (versi terbaru direkomendasikan)
- Akun Supabase (untuk database)

### Instalasi & Menjalankan

1. **Clone repositori**
   ```bash
   git clone <repository-url>
   ```

2. **Setup Backend**
   - Masuk ke folder `backend`
   - Buat file `.env` dan isi dengan:
     ```env
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_KEY=your_supabase_service_key
     PORT=3001
     ```
   - Jalankan backend:
     ```bash
     npm install
     npm start
     ```

3. **Setup Frontend**
   - Masuk ke folder `frontend`
   - Jalankan frontend:
     ```bash
     npm install
     npm run dev
     ```
   - Buka `http://localhost:5173` di browser Anda.

---

© 2026 MBG Group. Developed with ❤️ for better nutrition management.
