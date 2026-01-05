import React, { useState, useEffect } from 'react';
import { X, ChefHat, Clock, MapPin, Package, Save, RotateCcw } from 'lucide-react';

// Tipe data
type Task = {
  id: number;
  menu: string;
  target: number;
  destination: string;
  status: 'Persiapan' | 'Memasak' | 'Packing' | 'Siap Kirim';
  startTime: string;
  ingredients: string[];
  instructions: string[];
};

const initialTasks: Task[] = [
  { 
    id: 1, 
    menu: "Paket Nasi Ayam Teriyaki + Sayur", 
    target: 450, 
    destination: "SDN 1 Banjarnegara", 
    status: "Persiapan",
    startTime: "06:00",
    ingredients: [
      "Beras: 50 kg",
      "Daging Ayam Fillet: 45 kg",
      "Bawang Bombay: 5 kg",
      "Saus Teriyaki: 10 Liter",
      "Wortel & Buncis: 20 kg"
    ],
    instructions: [
      "Cuci bersih beras, masak dengan rice cooker industri.",
      "Potong ayam dadu, marinasi dengan saus teriyaki selama 30 menit.",
      "Tumis bawang bombay hingga layu, masukkan ayam.",
      "Rebus sayuran terpisah (blanching) agar tetap segar.",
      "Campurkan ayam dengan sisa saus, masak hingga matang sempurna."
    ]
  },
  { 
    id: 2, 
    menu: "Paket Telur Balado + Tempe", 
    target: 300, 
    destination: "SMPN 2 Bawang", 
    status: "Memasak",
    startTime: "06:30",
    ingredients: [
      "Telur Ayam: 300 butir (rebus)",
      "Tempe: 50 papan (potong tebal)",
      "Cabai Merah Giling: 3 kg",
      "Tomat Merah: 2 kg",
      "Bawang Merah & Putih: 1 kg"
    ],
    instructions: [
      "Rebus telur hingga matang, kupas kulitnya, goreng sebentar (berkulit).",
      "Goreng tempe hingga kuning keemasan, sisihkan.",
      "Tumis bumbu balado (cabai, bawang, tomat) hingga minyak keluar.",
      "Masukkan telur dan tempe ke dalam bumbu, aduk rata dengan api kecil.",
      "Tambahkan sedikit air dan garam/gula secukupnya."
    ]
  },
  { 
    id: 3, 
    menu: "Snack Buah Potong & Susu", 
    target: 800, 
    destination: "TK Aisyiyah 1", 
    status: "Packing",
    startTime: "07:00",
    ingredients: [
      "Semangka Tanpa Biji: 100 buah",
      "Melon: 80 buah",
      "Susu UHT Kotak: 800 pcs",
      "Cup Plastik: 800 pcs"
    ],
    instructions: [
      "Cuci bersih semua buah dengan air mengalir.",
      "Kupas dan potong dadu ukuran sekali suap (bite size).",
      "Masukkan buah ke dalam cup plastik, tutup rapat.",
      "Siapkan susu UHT, cek tanggal kadaluarsa.",
      "Susun dalam box distribusi per kelas."
    ]
  },
];

const Dapur = () => {
  // --- BAGIAN BARU: LOAD DATA DARI STORAGE ---
  // Saat pertama kali dibuka, cek dulu: "Ada data simpanan gak?"
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedData = localStorage.getItem('mbg-dapur-tasks');
    if (savedData) {
      return JSON.parse(savedData);
    } else {
      return initialTasks;
    }
  });

  const [filter, setFilter] = useState<string>('Semua');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // --- BAGIAN BARU: AUTO SAVE ---
  // Setiap kali 'tasks' berubah (diklik tombol proses), simpan ke localStorage
  useEffect(() => {
    localStorage.setItem('mbg-dapur-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Fungsi Reset Data (Darurat kalau mau balik ke awal)
  const resetData = () => {
    if(confirm("Yakin mau reset semua status kembali ke awal?")) {
        setTasks(initialTasks);
        localStorage.removeItem('mbg-dapur-tasks');
    }
  };

  const filterOptions = ['Semua', 'Persiapan', 'Memasak', 'Packing', 'Siap Kirim'];

  const advanceStatus = (id: number, currentStatus: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        let nextStatus: Task['status'] = task.status;
        if (currentStatus === 'Persiapan') nextStatus = 'Memasak';
        else if (currentStatus === 'Memasak') nextStatus = 'Packing';
        else if (currentStatus === 'Packing') nextStatus = 'Siap Kirim';
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  const filteredTasks = filter === 'Semua' ? tasks : tasks.filter(task => task.status === filter);
  const getCount = (statusName: string) => statusName === 'Semua' ? tasks.length : tasks.filter(t => t.status === statusName).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Persiapan": return "bg-gray-100 text-gray-600 border-gray-200";
      case "Memasak": return "bg-orange-50 text-orange-700 border-orange-200";
      case "Packing": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Siap Kirim": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-100";
    }
  };

  const getButtonLabel = (status: string) => {
    switch (status) {
      case "Persiapan": return "🔥 Mulai Masak";
      case "Memasak": return "📦 Mulai Packing";
      case "Packing": return "🚚 Panggil Driver";
      case "Siap Kirim": return "✅ Selesai";
      default: return "Proses";
    }
  };

  return (
    <div className="p-6 min-h-screen text-gray-800 bg-gray-50 font-sans relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="text-orange-600" size={32} />
            Produksi Dapur MBG
          </h1>
          <p className="text-gray-500 mt-1">Monitoring produksi massal & distribusi makanan</p>
        </div>
        
        <div className="flex gap-2">
            {/* Tombol Reset (Kecil di pojok) */}
            <button 
                onClick={resetData}
                className="bg-white hover:bg-red-50 text-red-500 border border-red-200 p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors"
                title="Reset Data ke Awal"
            >
                <RotateCcw size={16}/> Reset
            </button>

            <div className="bg-white px-5 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Target</p>
                <p className="font-bold text-orange-600 text-xl leading-none">2.250 Pax</p>
            </div>
            <Package className="text-orange-400" size={24} />
            </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-1">
        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all flex items-center gap-2 relative top-[1px]
              ${filter === option 
                ? 'bg-white text-orange-600 border border-gray-200 border-b-white shadow-sm z-10' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
          >
            {option}
            <span className={`px-2 py-0.5 rounded-full text-xs 
              ${filter === option ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'}`}>
              {getCount(option)}
            </span>
          </button>
        ))}
      </div>

      {/* Grid Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className={`bg-white rounded-xl p-5 border transition-all shadow-sm hover:shadow-md flex flex-col h-full
            ${task.status === 'Siap Kirim' ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-orange-300'}`}>
            
            <div className="flex justify-between items-center mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                {task.status.toUpperCase()}
              </span>
              <span className="text-gray-400 text-xs flex items-center gap-1 font-medium bg-gray-100 px-2 py-1 rounded">
                <Clock size={12} /> {task.startTime}
              </span>
            </div>

            <div className="mb-4 flex-grow">
                <h3 className="text-lg font-bold mb-2 text-gray-800 leading-tight">{task.menu}</h3>
                <div className="flex items-start gap-2 text-sm text-gray-600 mt-3 p-2 rounded-md bg-gray-50 border border-gray-100">
                    <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-bold">Tujuan Distribusi</span>
                      <span className="text-blue-700 font-semibold">{task.destination}</span>
                    </div>
                </div>
            </div>

            <div className="mb-5">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 text-xs">Progress ({task.target} Porsi)</span>
                    <span className="font-bold text-gray-900 text-xs">
                        {task.status === 'Siap Kirim' ? '100%' : task.status === 'Packing' ? '80%' : task.status === 'Memasak' ? '40%' : '10%'}
                    </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500
                        ${task.status === 'Siap Kirim' ? 'bg-green-500 w-full' : 
                          task.status === 'Packing' ? 'bg-blue-500 w-4/5' : 
                          task.status === 'Memasak' ? 'bg-orange-500 w-2/5' :
                          'bg-gray-300 w-[10%]'}`}
                    ></div>
                </div>
            </div>

            <div className="space-y-3 mt-auto">
                <button 
                  onClick={() => setSelectedTask(task)}
                  className="w-full py-2 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                  📜 Lihat Resep & Bahan
                </button>

                <button 
                    onClick={() => advanceStatus(task.id, task.status)}
                    disabled={task.status === 'Siap Kirim'}
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-sm flex justify-center items-center gap-2
                        ${task.status === 'Siap Kirim' 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                            : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200'
                        }`}
                >
                    {getButtonLabel(task.status)}
                </button>
            </div>

          </div>
        ))}
      </div>

      {/* --- MODAL RESEP TETAP SAMA --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTask.menu}</h2>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                   <Package size={16}/> Target Produksi: <span className="font-semibold text-orange-600">{selectedTask.target} Porsi</span>
                </p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 border border-gray-200"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">🥬 Bahan Baku Utama</h3>
                  <ul className="space-y-3">
                    {selectedTask.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg text-sm text-gray-700 border border-green-100">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-green-400 flex-shrink-0" />{ing}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">🍳 Instruksi Masak</h3>
                  <div className="space-y-4">
                    {selectedTask.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-xs border border-orange-200">{idx + 1}</span>
                        <p className="text-gray-600 leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedTask(null)} className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium">Tutup Resep</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dapur;