import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Import client
import {
  ChefHat,
  Clock,
  MapPin,
  Package,
  Calendar,
  Flame,
  Truck,
  X,
  Utensils,
  ArrowRight,
  Timer,
} from "lucide-react";

type Task = {
  id: number;
  menu: string;
  target: number;
  tujuan: string;
  status: "Persiapan" | "Memasak" | "Packing" | "Siap Kirim";
  jam_mulai: string;
  bahan?: string;
  instruksi?: string;
};

const Dapur = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("Semua");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // --- 1. Fetch Real Data ---
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("production_tasks")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      if (data) setTasks(data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // --- 2. Update Status to DB ---
  const updateStatus = async (id: number, nextStatus: Task["status"]) => {
    try {
      // Optimistic Update UI
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)),
      );

      // Request Database
      const { error } = await supabase
        .from("production_tasks")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      console.error("Update failed", err);
      fetchTasks(); // Rollback jika error
    }
  };

  const advanceStatus = (task: Task) => {
    const statuses: Task["status"][] = [
      "Persiapan",
      "Memasak",
      "Packing",
      "Siap Kirim",
    ];
    const currentIndex = statuses.indexOf(task.status);
    if (currentIndex < statuses.length - 1) {
      updateStatus(task.id, statuses[currentIndex + 1]);
    }
  };

  // --- Helpers (Blue Theme) ---
  const filterOptions = [
    "Semua",
    "Persiapan",
    "Memasak",
    "Packing",
    "Siap Kirim",
  ];
  const filteredTasks =
    filter === "Semua" ? tasks : tasks.filter((task) => task.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Persiapan":
        return "text-gray-500 bg-gray-100 border-gray-200";
      case "Memasak":
        return "text-blue-500 bg-blue-50 border-blue-200";
      case "Packing":
        return "text-blue-600 bg-blue-100 border-blue-300";
      case "Siap Kirim":
        return "text-blue-700 bg-blue-200 border-blue-400";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Memasak":
        return <Flame size={14} className="animate-pulse" />;
      case "Packing":
        return <Package size={14} />;
      case "Siap Kirim":
        return <Truck size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getProgressWidth = (status: string) => {
    switch (status) {
      case "Siap Kirim":
        return "100%";
      case "Packing":
        return "75%";
      case "Memasak":
        return "40%";
      default:
        return "10%";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "Siap Kirim":
        return "bg-blue-600";
      case "Packing":
        return "bg-blue-500";
      case "Memasak":
        return "bg-blue-400";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <ChefHat className="text-blue-600" size={32} />
              Dapur Produksi
            </h1>
            <p className="text-gray-500 mt-1">
              Monitoring real-time aktivitas memasak & distribusi.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
              <Calendar className="text-gray-400" size={18} />
              <span className="text-sm font-semibold text-gray-700">
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats & Filter */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20 lg:w-1/4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-blue-500/30">
              <Utensils size={140} />
            </div>
            <div>
              <p className="text-blue-100 font-bold text-xs uppercase tracking-wider mb-1">
                Total Target Hari Ini
              </p>
              <h2 className="text-4xl font-black">
                {tasks.reduce((acc, t) => acc + t.target, 0).toLocaleString()}
              </h2>
              <p className="text-sm font-medium text-blue-200">Porsi Makanan</p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm bg-blue-700/50 p-2 rounded-xl w-fit">
              <Timer size={16} />
              <span>Shift Pagi: 04:00 - 09:00</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-2 flex items-center overflow-x-auto no-scrollbar shadow-sm">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`flex-1 min-w-25 py-4 rounded-2xl text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1
                                    ${
                                      filter === option
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                                    }`}
              >
                <span>{option}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${filter === option ? "bg-blue-800 text-blue-100" : "bg-gray-100"}`}
                >
                  {option === "Semua"
                    ? tasks.length
                    : tasks.filter((t) => t.status === option).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid Task */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-gray-200 rounded-3xl animate-pulse"
                  />
                ))
            : filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border flex items-center gap-2 ${getStatusColor(task.status)}`}
                    >
                      {getStatusIcon(task.status)}
                      {task.status}
                    </span>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        Mulai
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {task.jam_mulai}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 grow">
                    <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                      {task.menu}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="font-medium">{task.tujuan}</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-gray-400">
                          Target: {task.target} Pax
                        </span>
                        <span
                          className={
                            task.status === "Siap Kirim"
                              ? "text-blue-600"
                              : "text-gray-900"
                          }
                        >
                          {task.status === "Siap Kirim"
                            ? "100%"
                            : task.status === "Packing"
                              ? "75%"
                              : task.status === "Memasak"
                                ? "40%"
                                : "10%"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(task.status)}`}
                          style={{ width: getProgressWidth(task.status) }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="py-3 px-4 rounded-xl font-bold text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => advanceStatus(task)}
                        disabled={task.status === "Siap Kirim"}
                        className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${task.status === "Siap Kirim" ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 active:scale-95"}`}
                      >
                        {task.status === "Siap Kirim" ? "Selesai" : "Lanjut"}
                        {task.status !== "Siap Kirim" && (
                          <ArrowRight size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Modal Detail */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {selectedTask.menu}
                  </h2>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mt-1">
                    <MapPin size={14} />
                    Dikirim ke:{" "}
                    <span className="text-gray-900 font-bold">
                      {selectedTask.tujuan}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-wider">
                      <Package size={16} />
                      Bahan Baku Utama
                    </div>
                    <ul className="space-y-3">
                      {(selectedTask.bahan || "Data bahan belum diinput")
                        .split(",")
                        .map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-sm font-bold text-gray-700"
                          >
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                            {item.trim()}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-wider">
                      <ChefHat size={16} />
                      Instruksi Dapur
                    </div>
                    <div className="space-y-4">
                      {(selectedTask.instruksi || "Ikuti SOP standar dapur")
                        .split(",")
                        .map((step, idx) => (
                          <div key={idx} className="flex gap-3 group">
                            <div className="shrink-0 w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {idx + 1}
                            </div>
                            <p className="text-sm text-gray-600 font-medium leading-snug pt-0.5">
                              {step.trim()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  ID Pesanan: #{selectedTask.id}2024
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  Tutup
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