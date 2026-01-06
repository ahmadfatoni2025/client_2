import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    Card, CardContent, CardHeader, CardTitle,
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
    Tabs, TabsContent, TabsList, TabsTrigger,
    Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Badge, Progress, Button
} from '@/components/ui';

// Type definitions untuk data TKPI
interface Nutrient {
    id: string;
    name: string;
    unit: string;
    value: number;
    dailyValue?: number; // % AKG (Angka Kecukupan Gizi)
    category: 'makro' | 'vitamin' | 'mineral' | 'lainnya';
}

interface FoodItem {
    id: string;
    name: string;
    indonesianName: string;
    category: string;
    bdd: number; // Berat Dapat Dimakan (%)
    nutrients: Nutrient[];
    servingSize: number; // gram per sajian
    source: string;
    lastUpdated: string;
}

interface ComparisonItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface AdjustedNutrient extends Nutrient {
    adjustedValue: number;
    adjustedDailyValue?: number;
}

const NutritionLabel: React.FC = () => {
    // Sample data TKPI - moved outside or memoized to avoid dependency issues
    const sampleFoods: FoodItem[] = useMemo(() => [
        {
            id: 'nasi-putih',
            name: 'White Rice',
            indonesianName: 'Nasi Putih',
            category: 'Serealia dan Olahan',
            bdd: 100,
            servingSize: 100,
            source: 'TKPI 2017',
            lastUpdated: '2023-01-15',
            nutrients: [
                { id: 'energi', name: 'Energi', unit: 'kkal', value: 129, dailyValue: 6, category: 'makro' },
                { id: 'protein', name: 'Protein', unit: 'g', value: 2.7, dailyValue: 5, category: 'makro' },
                { id: 'lemak', name: 'Lemak', unit: 'g', value: 0.3, dailyValue: 0, category: 'makro' },
                { id: 'karbohidrat', name: 'Karbohidrat', unit: 'g', value: 28, dailyValue: 9, category: 'makro' },
                { id: 'serat', name: 'Serat', unit: 'g', value: 0.2, category: 'makro' },
                { id: 'vit-b1', name: 'Vitamin B1', unit: 'mg', value: 0.05, dailyValue: 4, category: 'vitamin' },
                { id: 'vit-b2', name: 'Vitamin B2', unit: 'mg', value: 0.02, dailyValue: 2, category: 'vitamin' },
                { id: 'kalsium', name: 'Kalsium', unit: 'mg', value: 3, dailyValue: 0, category: 'mineral' },
                { id: 'fosfor', name: 'Fosfor', unit: 'mg', value: 33, dailyValue: 5, category: 'mineral' },
                { id: 'zat-besi', name: 'Zat Besi', unit: 'mg', value: 0.4, dailyValue: 3, category: 'mineral' }
            ]
        },
        {
            id: 'ayam-goreng',
            name: 'Fried Chicken',
            indonesianName: 'Ayam Goreng',
            category: 'Daging dan Olahan',
            bdd: 75,
            servingSize: 100,
            source: 'TKPI 2017',
            lastUpdated: '2023-02-20',
            nutrients: [
                { id: 'energi', name: 'Energi', unit: 'kkal', value: 298, dailyValue: 15, category: 'makro' },
                { id: 'protein', name: 'Protein', unit: 'g', value: 25.7, dailyValue: 51, category: 'makro' },
                { id: 'lemak', name: 'Lemak', unit: 'g', value: 20.3, dailyValue: 34, category: 'makro' },
                { id: 'karbohidrat', name: 'Karbohidrat', unit: 'g', value: 0, dailyValue: 0, category: 'makro' },
                { id: 'serat', name: 'Serat', unit: 'g', value: 0, category: 'makro' },
                { id: 'vit-a', name: 'Vitamin A', unit: 'IU', value: 120, dailyValue: 2, category: 'vitamin' },
                { id: 'vit-d', name: 'Vitamin D', unit: 'IU', value: 15, dailyValue: 4, category: 'vitamin' },
                { id: 'kalsium', name: 'Kalsium', unit: 'mg', value: 12, dailyValue: 1, category: 'mineral' },
                { id: 'zat-besi', name: 'Zat Besi', unit: 'mg', value: 1.2, dailyValue: 10, category: 'mineral' },
                { id: 'natrium', name: 'Natrium', unit: 'mg', value: 450, dailyValue: 20, category: 'mineral' }
            ]
        },
        {
            id: 'tempe',
            name: 'Tempeh',
            indonesianName: 'Tempe',
            category: 'Kacang-kacangan dan Olahan',
            bdd: 100,
            servingSize: 100,
            source: 'TKPI 2017',
            lastUpdated: '2023-03-10',
            nutrients: [
                { id: 'energi', name: 'Energi', unit: 'kkal', value: 150, dailyValue: 8, category: 'makro' },
                { id: 'protein', name: 'Protein', unit: 'g', value: 18.3, dailyValue: 37, category: 'makro' },
                { id: 'lemak', name: 'Lemak', unit: 'g', value: 8.8, dailyValue: 15, category: 'makro' },
                { id: 'karbohidrat', name: 'Karbohidrat', unit: 'g', value: 9.1, dailyValue: 3, category: 'makro' },
                { id: 'serat', name: 'Serat', unit: 'g', value: 1.4, category: 'makro' },
                { id: 'vit-b1', name: 'Vitamin B1', unit: 'mg', value: 0.19, dailyValue: 16, category: 'vitamin' },
                { id: 'vit-b2', name: 'Vitamin B2', unit: 'mg', value: 0.23, dailyValue: 18, category: 'vitamin' },
                { id: 'kalsium', name: 'Kalsium', unit: 'mg', value: 155, dailyValue: 16, category: 'mineral' },
                { id: 'zat-besi', name: 'Zat Besi', unit: 'mg', value: 4.0, dailyValue: 33, category: 'mineral' },
                { id: 'kalium', name: 'Kalium', unit: 'mg', value: 237, dailyValue: 5, category: 'mineral' }
            ]
        },
        {
            id: 'bayam',
            name: 'Spinach',
            indonesianName: 'Bayam',
            category: 'Sayuran',
            bdd: 80,
            servingSize: 100,
            source: 'TKPI 2017',
            lastUpdated: '2023-04-05',
            nutrients: [
                { id: 'energi', name: 'Energi', unit: 'kkal', value: 16, dailyValue: 1, category: 'makro' },
                { id: 'protein', name: 'Protein', unit: 'g', value: 3.5, dailyValue: 7, category: 'makro' },
                { id: 'lemak', name: 'Lemak', unit: 'g', value: 0.5, dailyValue: 1, category: 'makro' },
                { id: 'karbohidrat', name: 'Karbohidrat', unit: 'g', value: 0.8, dailyValue: 0, category: 'makro' },
                { id: 'serat', name: 'Serat', unit: 'g', value: 0.8, category: 'makro' },
                { id: 'vit-a', name: 'Vitamin A', unit: 'IU', value: 8100, dailyValue: 162, category: 'vitamin' },
                { id: 'vit-c', name: 'Vitamin C', unit: 'mg', value: 41, dailyValue: 68, category: 'vitamin' },
                { id: 'kalsium', name: 'Kalsium', unit: 'mg', value: 267, dailyValue: 27, category: 'mineral' },
                { id: 'zat-besi', name: 'Zat Besi', unit: 'mg', value: 3.9, dailyValue: 33, category: 'mineral' },
                { id: 'kalium', name: 'Kalium', unit: 'mg', value: 558, dailyValue: 12, category: 'mineral' }
            ]
        }
    ], []);

    const sampleComparisonData: ComparisonItem[] = useMemo(() => [
        { name: 'Nasi Putih', calories: 129, protein: 2.7, carbs: 28, fat: 0.3 },
        { name: 'Ayam Goreng', calories: 298, protein: 25.7, carbs: 0, fat: 20.3 },
        { name: 'Tempe', calories: 150, protein: 18.3, carbs: 9.1, fat: 8.8 },
        { name: 'Bayam', calories: 16, protein: 3.5, carbs: 0.8, fat: 0.5 },
        { name: 'Telur Ayam', calories: 154, protein: 12.4, carbs: 0.7, fat: 10.8 }
    ], []);

    const [selectedFood, setSelectedFood] = useState<string>('nasi-putih');
    const [servingSize, setServingSize] = useState<number>(100);
    const [foodData, setFoodData] = useState<FoodItem[]>([]);
    const [currentFood, setCurrentFood] = useState<FoodItem | null>(null);
    const [comparisonData, setComparisonData] = useState<ComparisonItem[]>([]);
    const [activeTab, setActiveTab] = useState<string>('nutrition');

    useEffect(() => {
        // Use a functional update to avoid unnecessary re-renders or sync effects
        setFoodData(sampleFoods);
        setComparisonData(sampleComparisonData);

        const food = sampleFoods.find(f => f.id === selectedFood);
        if (food) {
            setCurrentFood(food);
        } else if (sampleFoods.length > 0) {
            setCurrentFood(sampleFoods[0]);
        }
    }, [selectedFood, sampleFoods, sampleComparisonData]);

    const handleFoodChange = (foodId: string) => {
        setSelectedFood(foodId);
        const food = foodData.find(f => f.id === foodId);
        if (food) {
            setCurrentFood(food);
            setServingSize(food.servingSize);
        }
    };

    const handleServingSizeChange = (value: number) => {
        let val = value;
        if (val < 1) val = 1;
        if (val > 1000) val = 1000;
        setServingSize(val);
    };

    const adjustedNutrients = useMemo((): AdjustedNutrient[] => {
        if (!currentFood) return [];

        const factor = servingSize / 100;
        return currentFood.nutrients.map(nutrient => ({
            ...nutrient,
            adjustedValue: parseFloat((nutrient.value * factor).toFixed(2)),
            adjustedDailyValue: nutrient.dailyValue ?
                parseFloat(((nutrient.dailyValue * factor)).toFixed(1)) :
                undefined
        }));
    }, [currentFood, servingSize]);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'makro': return '#3B82F6'; // blue
            case 'vitamin': return '#10B981'; // green
            case 'mineral': return '#F59E0B'; // amber
            default: return '#8B5CF6'; // purple
        }
    };

    const macroNutrients = adjustedNutrients.filter(n => n.category === 'makro');

    const macroPieData = useMemo(() =>
        macroNutrients
            .filter(n => ['protein', 'lemak', 'karbohidrat'].includes(n.id))
            .map(n => ({
                name: n.name,
                value: n.adjustedValue,
                color: n.id === 'protein' ? '#10B981' :
                    n.id === 'lemak' ? '#EF4444' : '#3B82F6'
            })),
        [macroNutrients]
    );

    const radarData = useMemo(() => [
        { nutrient: 'Vit A', value: currentFood?.nutrients.find(n => n.id === 'vit-a')?.value || 0 },
        { nutrient: 'Vit C', value: currentFood?.nutrients.find(n => n.id === 'vit-c')?.value || 0 },
        { nutrient: 'Vit B1', value: currentFood?.nutrients.find(n => n.id === 'vit-b1')?.value || 0 },
        { nutrient: 'Kalsium', value: currentFood?.nutrients.find(n => n.id === 'kalsium')?.value || 0 },
        { nutrient: 'Zat Besi', value: currentFood?.nutrients.find(n => n.id === 'zat-besi')?.value || 0 },
        { nutrient: 'Kalium', value: currentFood?.nutrients.find(n => n.id === 'kalium')?.value || 0 }
    ].filter(item => item.value > 0), [currentFood]);

    const resetServingSize = () => {
        if (currentFood) {
            setServingSize(currentFood.servingSize);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-white transition-colors duration-500">
            <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl animate-in fade-in duration-700">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block p-1 bg-linear-to-r from-blue-600 to-indigo-500 rounded-full mb-4 shadow-xl shadow-blue-500/20">
                        <div className="bg-white rounded-full p-2">
                            <div className="w-12 h-12 bg-linear-to-r from-blue-600 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl font-black">TKPI</span>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                        Database TKPI Indonesia
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto italic">
                        Tabel Komposisi Pangan Indonesia - Sumber data gizi resmi dari Kementerian Kesehatan RI
                    </p>
                </div>

                {/* Kontrol Pilihan Makanan */}
                <Card className="mb-8 shadow-2xl border-none rounded-4xl overflow-hidden transition-all hover:shadow-blue-500/5">
                    <div className="bg-linear-to-r from-blue-600 to-indigo-500 h-2"></div>
                    <CardHeader className="px-10 py-8">
                        <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                            Pilih Bahan Pangan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-10 pb-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    Pangan
                                </label>
                                <Select value={selectedFood} onValueChange={handleFoodChange}>
                                    <SelectTrigger className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 transition-all">
                                        <SelectValue placeholder="Pilih bahan pangan" />
                                    </SelectTrigger>
                                    <SelectContent className=" border-gray-100">
                                        {foodData.map(food => (
                                            <SelectItem
                                                key={food.id}
                                                value={food.id}
                                                className="focus:bg-blue-50 py-3"
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 rounded-full mr-3 shrink-0"
                                                        style={{
                                                            backgroundColor: getCategoryColor(
                                                                food.nutrients[0]?.category || 'makro'
                                                            )
                                                        }}
                                                    />
                                                    <div>
                                                        <div className="font-bold text-gray-900">{food.indonesianName}</div>
                                                        <div className="text-[10px] uppercase font-black text-gray-400">{food.category}</div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Ukuran Saji (gram)
                                    </label>
                                    <button
                                        onClick={resetServingSize}
                                        className="text-[10px] font-black text-blue-600 uppercase tracking-wider hover:underline"
                                    >
                                        Reset
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="number"
                                        value={servingSize}
                                        onChange={(e) => handleServingSizeChange(Number(e.target.value))}
                                        min="1"
                                        max="1000"
                                        className="h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-lg text-gray-900 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    />
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest shrink-0">gram</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-end">
                                <div className="flex items-center gap-5 p-4 bg-blue-50 rounded-[2rem] border border-blue-100">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <span className="text-blue-600 font-black">BDD</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-gray-900 leading-none">
                                            {currentFood?.bdd}%
                                        </div>
                                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                                            Dapat Dimakan
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Informasi Utama */}
                {currentFood && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Summary Card */}
                        <Card className="lg:col-span-1 shadow-2xl border-none rounded-4xl p-8 flex flex-col justify-between overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                            <div className="relative z-10">
                                <Badge className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg mb-6 uppercase tracking-widest font-black text-[9px] border-none px-3 py-1">
                                    TKPI 2017
                                </Badge>
                                <h2 className="text-3xl font-black text-gray-900 leading-tight uppercase tracking-tight mb-2">
                                    {currentFood.indonesianName}
                                </h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-8">
                                    {currentFood.category}
                                </p>
                            </div>

                            <div className="space-y-4 pt-8 border-t relative z-10">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update</span>
                                    <span className="text-xs font-bold">{currentFood.lastUpdated}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source</span>
                                    <span className="text-xs font-bold">{currentFood.source}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Stats Grid */}
                        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                {
                                    label: 'Energi',
                                    id: 'energi',
                                    unit: 'kkal',
                                    color: 'to-blue-500',
                                    from: 'from-blue-600'
                                },
                                {
                                    label: 'Protein',
                                    id: 'protein',
                                    unit: 'g',
                                    color: 'to-emerald-500',
                                    from: 'from-emerald-600'
                                },
                                {
                                    label: 'Karbohidrat',
                                    id: 'karbohidrat',
                                    unit: 'g',
                                    color: 'to-amber-500',
                                    from: 'from-amber-600'
                                },
                                {
                                    label: 'Lemak',
                                    id: 'lemak',
                                    unit: 'g',
                                    color: 'to-red-500',
                                    from: 'from-red-600'
                                }
                            ].map((stat, index) => {
                                const nutrient = adjustedNutrients.find(n => n.id === stat.id);
                                return (
                                    <Card
                                        key={index}
                                        className="bg-white p-8 rounded-4xl border-none shadow-xl hover:shadow-2xl transition-all group cursor-default"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {stat.label}
                                            </span>
                                            <div className={`w-8 h-8 rounded-xl bg-linear-to-br ${stat.from} ${stat.color} opacity-20 group-hover:opacity-100 transition-all shadow-lg`}></div>
                                        </div>
                                        <div className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">
                                            {nutrient?.adjustedValue || 0} <span className="text-xs text-gray-400 ml-1 uppercase">{stat.unit}</span>
                                        </div>
                                        {nutrient?.adjustedDailyValue !== undefined && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">% AKG</span>
                                                    <span className="text-sm font-black text-gray-900">{nutrient.adjustedDailyValue}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 bg-linear-to-r ${stat.from} ${stat.color}`}
                                                        style={{ width: `${Math.min(nutrient.adjustedDailyValue, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tabs Visualisasi */}
                <Tabs defaultValue="nutrition" value={activeTab} onValueChange={setActiveTab} className="bg-transparent pt-4">
                    <TabsList className="bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-gray-100 mb-10 w-fit mx-auto transition-all shadow-sm">
                        <TabsTrigger value="nutrition" className="px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all">📋 Label Gizi</TabsTrigger>
                        <TabsTrigger value="charts" className="px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all">📊 Visualisasi</TabsTrigger>
                        <TabsTrigger value="comparison" className="px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all">⚖️ Perbandingan</TabsTrigger>
                    </TabsList>

                    <TabsContent value="nutrition" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none shadow-2xl rounded-4xl overflow-hidden mb-20">
                            <CardHeader className="bg-gray-50/50 p-10 border-b flex flex-row items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Informasi Nilai Gizi</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Per sajian {servingSize}g • Standarisasi TKPI</p>
                                </div>
                                <Button variant="outline" className="rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-white">Export Report</Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/30 hover:bg-transparent border-b">
                                            <TableHead className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Komposisi Nutrisi</TableHead>
                                            <TableHead className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Kandungan</TableHead>
                                            <TableHead className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">% AKG*</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {adjustedNutrients.map((n) => (
                                            <TableRow key={n.id} className="hover:bg-blue-50/30 border-b transition-colors">
                                                <TableCell className="px-10 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(n.category) }} />
                                                        <span className="font-bold text-gray-700 uppercase tracking-tight">{n.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-10 py-5 text-right font-black text-gray-900">
                                                    {n.adjustedValue} <span className="text-[10px] opacity-40 ml-1">{n.unit}</span>
                                                </TableCell>
                                                <TableCell className="px-10 py-5 text-right">
                                                    {n.adjustedDailyValue !== undefined ? (
                                                        <div className="flex items-center justify-end gap-5">
                                                            <div className="w-32 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(n.adjustedDailyValue, 100)}%` }} />
                                                            </div>
                                                            <span className="font-black text-gray-900 min-w-[30px]">{n.adjustedDailyValue}%</span>
                                                        </div>
                                                    ) : <span className="text-gray-300">-</span>}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="charts" className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Charts here (skipped for brevity but with correct types) */}
                            <Card className=" rounded-4xl border-none shadow-xl p-8">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Macro Distribution</h4>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={macroPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={8}
                                                dataKey="value"
                                                label={false}
                                            >
                                                {macroPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                            <Legend verticalAlign="bottom" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className=" rounded-4xl border-none shadow-xl p-8">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Vitamin & Mineral Profile</h4>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="#333" />
                                            <PolarAngleAxis dataKey="nutrient" />
                                            <Radar name="Value" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default NutritionLabel;