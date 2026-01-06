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
    // Load data dari storage dengan error handling
    const [tasks, setTasks] = useState<Task[]>(() => {
        try {
            const savedData = localStorage.getItem('mbg-dapur-tasks');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Validasi data yang di-load
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    return parsedData;
                }
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
        return initialTasks;
    });

    const [filter, setFilter] = useState<string>('Semua');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Auto Save dengan error handling
    useEffect(() => {
        try {
            localStorage.setItem('mbg-dapur-tasks', JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }, [tasks]);

    // Fungsi Reset Data
    const resetData = () => {
        if (window.confirm("Yakin mau reset semua status kembali ke awal?")) {
            setTasks(initialTasks);
            try {
                localStorage.removeItem('mbg-dapur-tasks');
            } catch (error) {
                console.error('Error removing data from localStorage:', error);
            }
        }
    };

    const filterOptions = ['Semua', 'Persiapan', 'Memasak', 'Packing', 'Siap Kirim'];

    const advanceStatus = (id: number) => {
        setTasks(tasks.map(task => {
            if (task.id === id) {
                let nextStatus: Task['status'];
                switch (task.status) {
                    case 'Persiapan':
                        nextStatus = 'Memasak';
                        break;
                    case 'Memasak':
                        nextStatus = 'Packing';
                        break;
                    case 'Packing':
                        nextStatus = 'Siap Kirim';
                        break;
                    case 'Siap Kirim':
                    default:
                        nextStatus = task.status; // Tetap di status yang sama
                        break;
                }
                return { ...task, status: nextStatus };
            }
            return task;
        }));
    };

    const filteredTasks = filter === 'Semua' ? tasks : tasks.filter(task => task.status === filter);

    const getCount = (statusName: string) => {
        if (statusName === 'Semua') {
            return tasks.length;
        }
        return tasks.filter(t => t.status === statusName).length;
    };

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case "Persiapan":
                return "text-gray-400";
            case "Memasak":
                return "text-orange-500";
            case "Packing":
                return "text-blue-500";
            case "Siap Kirim":
                return "text-green-500";
            default:
                return "text-gray-400";
        }
    };

    const getButtonLabel = (status: Task['status']) => {
        switch (status) {
            case "Persiapan":
                return "Mulai Masak";
            case "Memasak":
                return "Mulai Packing";
            case "Packing":
                return "Siap Kirim";
            case "Siap Kirim":
                return "Terselesaikan";
            default:
                return "Proses";
        }
    };

    // Hitung total target
    const totalTarget = tasks.reduce((sum, task) => sum + task.target, 0);

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Page Header Area - Consistent with Inventory */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
                                <ChefHat size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Kitchen Operations</h1>
                                <p className="text-sm text-gray-500 font-medium mt-1">Industrial Production Control Terminal</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={resetData}
                                className="text-[11px] font-black uppercase tracking-widest px-4 py-2 border border-gray-200 rounded-xl bg-white text-red-500 hover:border-red-500 transition-all flex items-center gap-2"
                            >
                                <RotateCcw size={14} /> Reset State
                            </button>
                            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">Total Output</p>
                                    <p className="font-black text-gray-900 leading-none">{totalTarget.toLocaleString()} <span className="text-[10px] opacity-40 uppercase">Pax</span></p>
                                </div>
                                <Package className="text-orange-500" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Sub Navigation Tabs - Underline Style */}
                    <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
                        {filterOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => setFilter(option)}
                                className={`flex items-center gap-2 px-1 py-3 text-sm font-bold border-b-2 transition-all duration-200 whitespace-nowrap relative
                                    ${filter === option
                                        ? 'border-gray-900 text-gray-900'
                                        : 'border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-200'
                                    }`}
                            >
                                {option}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black
                                    ${filter === option ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {getCount(option)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group p-10 bg-white border border-gray-100 rounded-[40px] space-y-10 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden flex flex-col h-full
                                ${task.status === 'Siap Kirim' ? 'ring-2 ring-green-600/10' : ''}`}
                        >
                            {task.status === 'Siap Kirim' && <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500" />}
                            {task.status === 'Memasak' && <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500" />}

                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(task.status).replace('text-', 'bg-')}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight tracking-tight group-hover:text-orange-600 transition-colors uppercase">
                                        {task.menu}
                                    </h3>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl flex items-center gap-1.5">
                                    <Clock size={14} className="text-gray-400" />
                                    <span className="text-[10px] font-black text-gray-400">{task.startTime}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 p-8 rounded-[32px] space-y-6 flex-grow">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Distribution Target</span>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-blue-500" />
                                        <span className="text-sm font-black text-gray-700">{task.destination}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Batch Progress</span>
                                            <span className="text-lg font-black text-gray-900">{task.target.toLocaleString()} <span className="text-[10px] opacity-40 uppercase">Units</span></span>
                                        </div>
                                        <span className="font-black text-gray-900 text-xs">
                                            {task.status === 'Siap Kirim' ? '100%' :
                                                task.status === 'Packing' ? '80%' :
                                                    task.status === 'Memasak' ? '40%' : '10%'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700
                                                ${task.status === 'Siap Kirim' ? 'bg-green-500 w-full' :
                                                    task.status === 'Packing' ? 'bg-blue-500 w-4/5' :
                                                        task.status === 'Memasak' ? 'bg-orange-500 w-2/5' :
                                                            'bg-gray-400 w-[10%]'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <button
                                    onClick={() => setSelectedTask(task)}
                                    className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-transparent hover:border-gray-200"
                                >
                                    <Package size={14} /> Open Recipe & Manifest
                                </button>

                                <button
                                    onClick={() => advanceStatus(task.id)}
                                    disabled={task.status === 'Siap Kirim'}
                                    className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex justify-center items-center gap-3
                                        ${task.status === 'Siap Kirim'
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                                            : 'bg-black text-white hover:bg-zinc-800 shadow-black/10 active:scale-[0.98]'
                                        }`}
                                >
                                    {task.status !== 'Siap Kirim' && <ChefHat size={16} />}
                                    {getButtonLabel(task.status)}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Modal Resep - Consistent with StockOpname Registry Form */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative border border-white/20">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-orange-600" />

                        <button
                            onClick={() => setSelectedTask(null)}
                            className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-2xl transition-all z-10"
                        >
                            <X size={24} className="text-gray-400" />
                        </button>

                        <div className="p-10 pb-6">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20">
                                    <ChefHat size={28} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-black tracking-tighter uppercase">{selectedTask.menu}</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Official Production Manifest & Guidelines</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-3">
                                    <Package size={16} className="text-orange-600" />
                                    <span className="text-[11px] font-black text-orange-900 uppercase tracking-widest">
                                        Target: {selectedTask.target.toLocaleString()} Units
                                    </span>
                                </div>
                                <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
                                    <MapPin size={16} className="text-blue-600" />
                                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">
                                        Loc: {selectedTask.destination}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 pb-10 overflow-y-auto space-y-10">
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full" />
                                        Raw Materials Inventory
                                    </h3>
                                    <div className="grid gap-2">
                                        {selectedTask.ingredients.map((ing, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-orange-200" />
                                                <span className="text-xs font-bold text-gray-600">{ing}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                                        Standard Cook Procedures
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedTask.instructions.map((step, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-black text-white font-black text-[10px]">
                                                    {idx + 1}
                                                </span>
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed pt-1">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="px-10 py-5 bg-black hover:bg-zinc-800 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                Dismiss Terminal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dapur;