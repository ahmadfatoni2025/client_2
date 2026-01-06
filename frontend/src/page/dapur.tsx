import React { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ChefHat, Clock, MapPin, Package, Calendar, ChefHatIcon, CheckCircle2, Play } from 'lucide-react';

type Task = {
    id: number;
    menu: string;
    target: number;
    tujuan: string;
    status: 'Persiapan' | 'Memasak' | 'Packing' | 'Siap Kirim';
    jam_mulai: string;
    bahan?: string;
    instruksi?: string;
};

const Dapur = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('Semua');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const API_URL = 'http://localhost:3001/api/produksi';

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL);
            if (res.data.success) {
                setTasks(res.data.data);
            }
        } catch (err) {
            console.error('Gagal mengambil data produksi:', err);
            setTasks([
                { id: 1, menu: "Nasi Ayam Teriyaki", target: 450, tujuan: "SDN 1 Banjarnegara", status: "Persiapan", jam_mulai: "06:00" },
                { id: 2, menu: "Telur Balado + Tempe", target: 300, tujuan: "SMPN 2 Bawang", status: "Memasak", jam_mulai: "06:30" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const updateStatus = async (id: number, nextStatus: Task['status']) => {
        try {
            const res = await axios.put(`${API_URL}/${id}`, { status: nextStatus });
            if (res.data.success) {
                setTasks(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
            }
        } catch (err) {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
        }
    };

    const advanceStatus = (task: Task) => {
        const statuses: Task['status'][] = ['Persiapan', 'Memasak', 'Packing', 'Siap Kirim'];
        const currentIndex = statuses.indexOf(task.status);
        if (currentIndex < statuses.length - 1) {
            updateStatus(task.id, statuses[currentIndex + 1]);
        }
    };

    const filterOptions = ['Semua', 'Persiapan', 'Memasak', 'Packing', 'Siap Kirim'];
    const filteredTasks = filter === 'Semua' ? tasks : tasks.filter(task => task.status === filter);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Persiapan": return "bg-gray-100 text-gray-600 border-gray-200";
            case "Memasak": return "bg-orange-50 text-orange-700 border-orange-200";
            case "Packing": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Siap Kirim": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            default: return "bg-gray-100";
        }
    };

    const getButtonLabel = (status: string) => {
        switch (status) {
            case "Persiapan": return "Mulai Masak";
            case "Memasak": return "Mulai Packing";
            case "Packing": return "Siap Kirim";
            case "Siap Kirim": return "Selesai";
            default: return "Proses";
        }
    };

    return (
        <div className="p-4 md:p-6 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <ChefHat className="text-orange-600" size={32} />
                            Produksi Dapur MBG
                        </h1>
                        <p className="text-gray-500 mt-1">Monitoring produksi massal & distribusi makanan secara real-time.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Output</p>
                                <p className="font-bold text-gray-900 text-xl leading-none">
                                    {tasks.reduce((acc, t) => acc + t.target, 0).toLocaleString()} Pax
                                </p>
                            </div>
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                                <Package size={24} />
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                            <Calendar className="text-gray-400" size={18} />
                            <span className="text-sm font-semibold text-gray-700">
                                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap justify-start md:justify-center gap-2 bg-gray-100/50 p-1.5 rounded-full border border-gray-100 max-w-3xl py-4 mx-auto overflow-x-auto no-scrollbar">
                    {filterOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setFilter(option)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${filter === option
                                ? 'bg-white text-orange-600 shadow-md transform scale-105'
                                : 'text-gray-500 hover:text-orange-600 hover:bg-white/50'
                                }`}
                        >
                            {option}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === option ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-500'}`}>
                                {option === 'Semua' ? tasks.length : tasks.filter(t => t.status === option).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Grid Kartu */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />)
                    ) : filteredTasks.map((task) => (
                        <div key={task.id} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full overflow-hidden relative">
                            {task.status === 'Siap Kirim' && <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50"></div>}

                            <div className="flex justify-between items-center mb-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(task.status)}`}>
                                    {task.status}
                                </span>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full text-gray-400">
                                    <Clock size={14} />
                                    <span className="text-xs font-bold">{task.jam_mulai}</span>
                                </div>
                            </div>

                            <div className="mb-6 flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{task.menu}</h3>
                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition-colors group-hover:bg-white group-hover:border-orange-100">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-widest mb-0.5">Tujuan Distribusi</span>
                                        <span className="text-gray-800 font-bold text-sm">{task.tujuan}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                    <span className="text-gray-400">Target: {task.target} Porsi</span>
                                    <span className="text-gray-900">
                                        {task.status === 'Siap Kirim' ? '100' : task.status === 'Packing' ? '75' : task.status === 'Memasak' ? '40' : '10'}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out
                                            ${task.status === 'Siap Kirim' ? 'bg-gradient-to-r from-emerald-400 to-green-500 w-full' :
                                                task.status === 'Packing' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 w-[75%]' :
                                                    task.status === 'Memasak' ? 'bg-gradient-to-r from-orange-400 to-red-500 w-[40%]' :
                                                        'bg-gray-300 w-[10%]'}`}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button
                                    onClick={() => setSelectedTask(task)}
                                    className="py-3 px-4 text-xs font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-gray-600 rounded-2xl transition-all border border-transparent hover:border-gray-200"
                                >
                                    Detail Resep
                                </button>
                                <button
                                    onClick={() => advanceStatus(task)}
                                    disabled={task.status === 'Siap Kirim'}
                                    className={`py-3 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2
                                        ${task.status === 'Siap Kirim'
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200 shadow-none'
                                            : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20 hover:-translate-y-0.5'
                                        }`}
                                >
                                    {task.status === 'Siap Kirim' ? <CheckCircle2 size={14} /> : <Play size={12} fill="white" />}
                                    {getButtonLabel(task.status)}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Detail */}
                {selectedTask && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-white animate-in zoom-in-95 duration-300">

                            <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                                        <ChefHatIcon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedTask.menu}</h2>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                                            Target: <span className="text-orange-600">{selectedTask.target} Porsi</span>
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTask(null)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-600 transition-all border border-transparent hover:border-gray-200">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Bahan Baku
                                        </h3>
                                        <ul className="space-y-3">
                                            {(selectedTask.bahan || "Ayam Fillet, Beras Premium, Saus Teriyaki, Sayuran Segar").split(',').map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-600 border border-gray-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                                    {item.trim()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            Prosedur
                                        </h3>
                                        <div className="space-y-4">
                                            {(selectedTask.instruksi || "Siapkan bahan, Masak nasi, Olah protein, Packing porsi").split(',').map((step, i) => (
                                                <div key={i} className="flex gap-4 group">
                                                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 font-black text-xs border border-gray-200 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-gray-600 text-sm font-medium leading-relaxed pt-1.5">{step.trim()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex justify-end">
                                <button onClick={() => setSelectedTask(null)} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-900/10">
                                    Selesai Meninjau
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dapur;
