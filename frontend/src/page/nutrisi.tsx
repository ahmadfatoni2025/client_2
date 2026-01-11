import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient"; // Import client
import {
  Apple,
  Search,
  Pin,
  PinOff,
  Loader2,
  Calculator,
  Plus,
  Trash2,
  X,
  Utensils,
} from "lucide-react";

// Interface sesuai kolom Database (Snake_case di DB -> CamelCase/Mapped di FE)
interface FoodNutrient {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_pinned: boolean; // Sesuai nama kolom di DB
}

interface MenuItem extends FoodNutrient {
  grams: number;
}

const Nutrisi: React.FC = () => {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodNutrient[]>([]);
  const [pinnedItems, setPinnedItems] = useState<FoodNutrient[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculator State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // --- 1. Fetch Pinned Items on Mount ---
  const fetchPinnedItems = async () => {
    const { data, error } = await supabase
      .from("nutrition_foods")
      .select("*")
      .eq("is_pinned", true)
      .order("name", { ascending: true });

    if (data) setPinnedItems(data);
    if (error) console.error("Error fetch pinned:", error);
  };

  useEffect(() => {
    fetchPinnedItems();
  }, []);

  // --- 2. Search Logic ---
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Kalau kosong, jangan cari (hemat request)
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("nutrition_foods")
        .select("*")
        .ilike("name", `%${searchQuery}%`) // Case insensitive search
        .order("name");

      if (error) throw error;
      // Filter agar yang sudah ada di pinned tidak muncul ganda di hasil search (opsional)
      if (data) setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Toggle Pin (Update DB) ---
  const togglePin = async (item: FoodNutrient) => {
    const newStatus = !item.is_pinned;

    // Optimistic Update UI
    const updateLocalList = (list: FoodNutrient[]) =>
      list.map((i) => (i.id === item.id ? { ...i, is_pinned: newStatus } : i));

    setPinnedItems((prev) => {
      if (newStatus) return [...prev, { ...item, is_pinned: true }];
      return prev.filter((i) => i.id !== item.id);
    });
    setSearchResults(updateLocalList);

    // Update DB
    const { error } = await supabase
      .from("nutrition_foods")
      .update({ is_pinned: newStatus })
      .eq("id", item.id);

    if (error) {
      console.error("Gagal update pin:", error);
      fetchPinnedItems(); // Revert jika gagal
    }
  };

  // --- 4. Insert Manual Data ---
  const handleSaveNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("nutrition_foods")
        .insert([{ ...newItem, is_pinned: true }]) // Otomatis pin item baru
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPinnedItems((prev) => [data, ...prev]);
        setIsModalOpen(false);
        setNewItem({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    } catch (err) {
      alert("Gagal menyimpan data.");
      console.error(err);
    }
  };

  // --- Calculator Logic ---
  const addToMenu = (item: FoodNutrient) => {
    const existing = menuItems.find((m) => m.id === item.id);
    if (existing) {
      setMenuItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, grams: m.grams + 50 } : m)),
      );
    } else {
      setMenuItems((prev) => [...prev, { ...item, grams: 100 }]);
    }
  };

  const updateGrams = (id: number, grams: number) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, grams: grams } : m)),
    );
  };

  const removeFromMenu = (id: number) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  const totals = useMemo(() => {
    return menuItems.reduce(
      (acc, item) => {
        const ratio = item.grams / 100;
        return {
          calories: acc.calories + item.calories * ratio,
          protein: acc.protein + item.protein * ratio,
          carbs: acc.carbs + item.carbs * ratio,
          fat: acc.fat + item.fat * ratio,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [menuItems]);

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Apple className="text-emerald-600" size={32} />
              Database & Kalkulator Gizi
            </h1>
            <p className="text-gray-500 mt-1">
              Tools Ahli Gizi untuk manajemen menu MBG (Terintegrasi Database).
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-200 transition-colors"
            >
              <Plus size={18} />
              Tambah Data Manual
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Search & Table */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search
                  className="text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                  size={20}
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari makanan di database..."
                className="w-full bg-white border border-gray-100 rounded-2xl pl-14 pr-32 py-4 text-base font-medium shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-emerald-600 text-white px-6 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Cari"
                )}
              </button>
            </form>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Utensils size={18} className="text-emerald-600" />
                  Daftar Bahan Makanan
                </h3>
                <span className="text-xs text-gray-400 font-medium">
                  Per 100 gram
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-4">Nama</th>
                      <th className="px-4 py-4 text-center">Kalori</th>
                      <th className="px-4 py-4 text-center">Prot</th>
                      <th className="px-4 py-4 text-center">Karbo</th>
                      <th className="px-4 py-4 text-center">Lemak</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {/* Gabungkan Pinned dan Search Results (hilangkan duplikat by ID) */}
                    {[
                      ...pinnedItems,
                      ...searchResults.filter(
                        (r) => !pinnedItems.find((p) => p.id === r.id),
                      ),
                    ].map((item) => (
                      <tr
                        key={item.id}
                        className="group hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-700 flex items-center gap-2">
                          {item.is_pinned && (
                            <Pin
                              size={12}
                              className="text-emerald-600 fill-emerald-600"
                            />
                          )}
                          {item.name}
                        </td>
                        <td className="px-4 py-4 text-center text-gray-600">
                          {item.calories}
                        </td>
                        <td className="px-4 py-4 text-center text-blue-600 font-semibold">
                          {item.protein}
                        </td>
                        <td className="px-4 py-4 text-center text-amber-600 font-semibold">
                          {item.carbs}
                        </td>
                        <td className="px-4 py-4 text-center text-gray-500 font-semibold">
                          {item.fat}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => togglePin(item)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {item.is_pinned ? (
                                <PinOff size={16} />
                              ) : (
                                <Pin size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => addToMenu(item)}
                              className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Calculator */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden sticky top-6">
              <div className="bg-emerald-900 px-6 py-5 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <Calculator size={20} className="text-amber-400" />
                  Kalkulator Menu
                </h3>
                <span className="text-xs bg-emerald-800 px-2 py-1 rounded-md text-emerald-100">
                  {menuItems.length} Item
                </span>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                {menuItems.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Utensils size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm">Belum ada item dipilih.</p>
                  </div>
                ) : (
                  menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-800 line-clamp-1">
                          {item.name}
                        </span>
                        <button
                          onClick={() => removeFromMenu(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
                            <input
                              type="number"
                              value={item.grams}
                              onChange={(e) =>
                                updateGrams(item.id, Number(e.target.value))
                              }
                              className="w-full outline-none text-right font-bold text-emerald-700"
                            />
                            <span className="text-xs text-gray-400">g</span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 w-16">
                          {((item.calories * item.grams) / 100).toFixed(0)} kcal
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total Summary */}
              <div className="bg-gray-50 border-t border-gray-100 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Total Energi</span>
                    <span className="font-black text-gray-900 text-lg">
                      {totals.calories.toFixed(0)}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        kcal
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{
                        width: `${Math.min((totals.calories / 700) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <div className="text-blue-700 font-bold text-sm">
                      {totals.protein.toFixed(1)}g
                    </div>
                    <div className="text-[10px] text-blue-400 uppercase font-bold">
                      Prot
                    </div>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg">
                    <div className="text-amber-700 font-bold text-sm">
                      {totals.carbs.toFixed(1)}g
                    </div>
                    <div className="text-[10px] text-amber-400 uppercase font-bold">
                      Carb
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <div className="text-gray-700 font-bold text-sm">
                      {totals.fat.toFixed(1)}g
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">
                      Fat
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Insert */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900">Tambah Data Makanan</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveNewItem} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nama Makanan
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Kalori
                    </label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={newItem.calories || ""}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          calories: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">
                      Protein
                    </label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newItem.protein || ""}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          protein: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-500 uppercase mb-1">
                      Karbo
                    </label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none"
                      value={newItem.carbs || ""}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          carbs: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Lemak
                    </label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-500 outline-none"
                      value={newItem.fat || ""}
                      onChange={(e) =>
                        setNewItem({ ...newItem, fat: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  Simpan Data
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nutrisi;
