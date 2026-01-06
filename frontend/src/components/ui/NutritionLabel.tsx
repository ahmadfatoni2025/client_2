import React, { useState, useEffect, useMemo } from 'react';
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
} from '@/components/ui'; // Asumsi menggunakan shadcn/ui

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
    const [selectedFood, setSelectedFood] = useState<string>('nasi-putih');
    const [servingSize, setServingSize] = useState<number>(100);
    const [foodData, setFoodData] = useState<FoodItem[]>([]);
    const [currentFood, setCurrentFood] = useState<FoodItem | null>(null);
    const [comparisonData, setComparisonData] = useState<ComparisonItem[]>([]);
    const [activeTab, setActiveTab] = useState<string>('nutrition');

    // Sample data TKPI
    const sampleFoods: FoodItem[] = [
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
    ];

    // Comparison data untuk grafik
    const sampleComparisonData: ComparisonItem[] = [
        { name: 'Nasi Putih', calories: 129, protein: 2.7, carbs: 28, fat: 0.3 },
        { name: 'Ayam Goreng', calories: 298, protein: 25.7, carbs: 0, fat: 20.3 },
        { name: 'Tempe', calories: 150, protein: 18.3, carbs: 9.1, fat: 8.8 },
        { name: 'Bayam', calories: 16, protein: 3.5, carbs: 0.8, fat: 0.5 },
        { name: 'Telur Ayam', calories: 154, protein: 12.4, carbs: 0.7, fat: 10.8 }
    ];

    useEffect(() => {
        setFoodData(sampleFoods);
        setComparisonData(sampleComparisonData);

        const food = sampleFoods.find(f => f.id === selectedFood);
        setCurrentFood(food || sampleFoods[0]);
    }, [selectedFood]);

    const handleFoodChange = (foodId: string) => {
        setSelectedFood(foodId);
        const food = foodData.find(f => f.id === foodId);
        if (food) {
            setCurrentFood(food);
            // Reset serving size ke default saat ganti makanan
            setServingSize(food.servingSize);
        }
    };

    const handleServingSizeChange = (value: number) => {
        if (value < 1) value = 1;
        if (value > 1000) value = 1000;
        setServingSize(value);
    };

    const calculateAdjustedNutrients = useMemo((): AdjustedNutrient[] => {
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

    const adjustedNutrients = calculateAdjustedNutrients;
    const macroNutrients = adjustedNutrients.filter(n => n.category === 'makro');


    // Data untuk pie chart (Makronutrien)
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

    // Data untuk radar chart (Vitamin & Mineral)
    const radarData = useMemo(() => [
        { nutrient: 'Vit A', value: currentFood?.nutrients.find(n => n.id === 'vit-a')?.value || 0 },
        { nutrient: 'Vit C', value: currentFood?.nutrients.find(n => n.id === 'vit-c')?.value || 0 },
        { nutrient: 'Vit B1', value: currentFood?.nutrients.find(n => n.id === 'vit-b1')?.value || 0 },
        { nutrient: 'Kalsium', value: currentFood?.nutrients.find(n => n.id === 'kalsium')?.value || 0 },
        { nutrient: 'Zat Besi', value: currentFood?.nutrients.find(n => n.id === 'zat-besi')?.value || 0 },
        { nutrient: 'Kalium', value: currentFood?.nutrients.find(n => n.id === 'kalium')?.value || 0 }
    ].filter(item => item.value > 0), [currentFood]);

    // Fungsi untuk reset ukuran sajian
    const resetServingSize = () => {
        if (currentFood) {
            setServingSize(currentFood.servingSize);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Header dengan gradient modern */}
                <div className="text-center mb-12">
                    <div className="inline-block p-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full mb-4">
                        <div className="bg-white rounded-full p-2">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">TKPI</span>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-3">
                        Database TKPI Indonesia
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Tabel Komposisi Pangan Indonesia - Sumber data gizi resmi dari Kementerian Kesehatan RI
                    </p>
                </div>

                {/* Kontrol Pilihan Makanan dengan card modern */}
                <Card className="mb-8 shadow-sm border-slate-100 rounded-3xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-1.5"></div>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-800">
                            Pilih Bahan Pangan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Pangan
                                </label>
                                <Select value={selectedFood} onValueChange={handleFoodChange}>
                                    <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                        <SelectValue placeholder="Pilih bahan pangan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {foodData.map(food => (
                                            <SelectItem
                                                key={food.id}
                                                value={food.id}
                                                className="focus:bg-blue-50"
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 rounded-full mr-3"
                                                        style={{
                                                            backgroundColor: getCategoryColor(
                                                                food.nutrients[0]?.category || 'makro'
                                                            )
                                                        }}
                                                    />
                                                    <div>
                                                        <div className="font-medium">{food.indonesianName}</div>
                                                        <div className="text-xs text-gray-500">{food.category}</div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ukuran Saji (gram)
                                    </label>
                                    <Button
                                        onClick={resetServingSize}
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        Reset
                                    </Button>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Input
                                        type="number"
                                        value={servingSize}
                                        onChange={(e) => handleServingSizeChange(Number(e.target.value))}
                                        min="1"
                                        max="1000"
                                        className="h-12 border-gray-300 focus:border-blue-500"
                                    />
                                    <span className="text-gray-500 text-sm">gram</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center">
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-blue-600 font-bold">BDD</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-800">
                                            {currentFood?.bdd}%
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Berat Dapat Dimakan
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Informasi Bahan Pangan */}
                {currentFood && (
                    <Card className="mb-8 shadow-lg border-0 rounded-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-white p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-3 h-8 rounded-full bg-gradient-to-b from-blue-500 to-teal-400"></div>
                                        <h2 className="text-3xl font-bold text-gray-800">
                                            {currentFood.indonesianName}
                                        </h2>
                                    </div>
                                    <div className="flex items-center space-x-4 text-gray-600">
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            Update: {currentFood.lastUpdated}
                                        </span>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {currentFood.category}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                                        TKPI 2017
                                    </Badge>
                                </div>
                            </div>

                            {/* Stats Grid dengan animasi hover */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    {
                                        label: 'Energi',
                                        value: adjustedNutrients.find(n => n.id === 'energi')?.adjustedValue || 0,
                                        unit: 'kkal',
                                        color: 'bg-gradient-to-r from-blue-500 to-blue-400',
                                        dailyValue: adjustedNutrients.find(n => n.id === 'energi')?.adjustedDailyValue
                                    },
                                    {
                                        label: 'Protein',
                                        value: adjustedNutrients.find(n => n.id === 'protein')?.adjustedValue || 0,
                                        unit: 'g',
                                        color: 'bg-gradient-to-r from-green-500 to-green-400',
                                        dailyValue: adjustedNutrients.find(n => n.id === 'protein')?.adjustedDailyValue
                                    },
                                    {
                                        label: 'Karbohidrat',
                                        value: adjustedNutrients.find(n => n.id === 'karbohidrat')?.adjustedValue || 0,
                                        unit: 'g',
                                        color: 'bg-gradient-to-r from-amber-500 to-amber-400',
                                        dailyValue: adjustedNutrients.find(n => n.id === 'karbohidrat')?.adjustedDailyValue
                                    },
                                    {
                                        label: 'Lemak',
                                        value: adjustedNutrients.find(n => n.id === 'lemak')?.adjustedValue || 0,
                                        unit: 'g',
                                        color: 'bg-gradient-to-r from-red-500 to-red-400',
                                        dailyValue: adjustedNutrients.find(n => n.id === 'lemak')?.adjustedDailyValue
                                    }
                                ].map((stat, index) => (
                                    <div
                                        key={index}
                                        className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-600">
                                                {stat.label}
                                            </span>
                                            <div className={`w-8 h-8 rounded-lg ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-800 mb-1">
                                            {stat.value} {stat.unit}
                                        </div>
                                        {stat.dailyValue !== undefined && (
                                            <div className="flex items-center">
                                                <Progress
                                                    value={stat.dailyValue}
                                                    className="w-full h-2"
                                                    indicatorClassName={`${stat.dailyValue > 100 ? 'bg-red-500' :
                                                        stat.dailyValue > 50 ? 'bg-amber-500' : 'bg-green-500'
                                                        }`}
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-600 min-w-[45px]">
                                                    {stat.dailyValue}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Tabs untuk Visualisasi Berbeda */}
                <Tabs defaultValue="nutrition" value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid grid-cols-4 mb-6 bg-gray-100 p-1 rounded-xl">
                        {[
                            { value: 'nutrition', label: 'Label Gizi', icon: '📋' },
                            { value: 'charts', label: 'Visualisasi', icon: '📊' },
                            { value: 'comparison', label: 'Perbandingan', icon: '⚖️' },
                            { value: 'database', label: 'Database', icon: '🗃️' }
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg py-3"
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* TAB 1: Label Gizi */}
                    <TabsContent value="nutrition">
                        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-gray-800">
                                            Informasi Nilai Gizi
                                        </CardTitle>
                                        <p className="text-sm text-gray-500">
                                            Per sajian {servingSize}g • Berdasarkan Database TKPI
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.print()}
                                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                    >
                                        Export PDF
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-6 border-2 border-gray-200 rounded-lg m-6">
                                    <div className="text-center mb-8 pb-6 border-b border-gray-200">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                            INFORMASI NILAI GIZI
                                        </h3>
                                        <div className="flex items-center justify-center space-x-4 text-gray-600">
                                            <span>{currentFood?.indonesianName}</span>
                                            <span>•</span>
                                            <span>Per {servingSize} gram</span>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent border-b border-gray-200">
                                                    <TableHead className="font-semibold text-gray-700 py-4 w-1/2">
                                                        Komposisi
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        Jumlah
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        %AKG*
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {adjustedNutrients.map((nutrient) => (
                                                    <TableRow
                                                        key={nutrient.id}
                                                        className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                                                    >
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center">
                                                                <div
                                                                    className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                                                                    style={{ backgroundColor: getCategoryColor(nutrient.category) }}
                                                                />
                                                                <span className="font-medium text-gray-700">
                                                                    {nutrient.name}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right font-semibold text-gray-800">
                                                            {nutrient.adjustedValue.toFixed(1)} {nutrient.unit}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right">
                                                            {nutrient.adjustedDailyValue !== undefined ? (
                                                                <div className="flex items-center justify-end space-x-3">
                                                                    <Progress
                                                                        value={nutrient.adjustedDailyValue}
                                                                        className="w-24 h-2"
                                                                        indicatorClassName={
                                                                            nutrient.adjustedDailyValue > 100 ? 'bg-red-500' :
                                                                                nutrient.adjustedDailyValue > 50 ? 'bg-amber-500' : 'bg-green-500'
                                                                        }
                                                                    />
                                                                    <span className="font-semibold text-gray-700 min-w-[45px]">
                                                                        {nutrient.adjustedDailyValue}%
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-600 mb-1">
                                                *Persen AKG berdasarkan kebutuhan energi 2150 kkal
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Kebutuhan energi Anda mungkin lebih tinggi atau lebih rendah
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 2: Visualisasi Chart */}
                    <TabsContent value="charts">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Pie Chart Makronutrien */}
                            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                                    <CardTitle className="text-lg font-semibold text-gray-800">
                                        Komposisi Makronutrien
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={macroPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    label={({ name, percent }: { name?: string, percent?: number }) =>
                                                        `${name || ''}\n${((percent || 0) * 100).toFixed(1)}%`
                                                    }
                                                    labelLine={false}
                                                >
                                                    {macroPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: any) => [`${value}g`, 'Jumlah']}
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-sm text-gray-600">{value}</span>
                                                    )}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Radar Chart Vitamin & Mineral */}
                            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                                    <CardTitle className="text-lg font-semibold text-gray-800">
                                        Vitamin & Mineral
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={radarData}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis
                                                    dataKey="nutrient"
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={30}
                                                    domain={[0, 'auto']}
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                />
                                                <Radar
                                                    name={currentFood?.indonesianName}
                                                    dataKey="value"
                                                    stroke="#3B82F6"
                                                    fill="#3B82F6"
                                                    fillOpacity={0.3}
                                                    strokeWidth={2}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                    formatter={(value: any) => [value, 'Nilai']}
                                                />
                                                <Legend />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bar Chart Nutrisi Penting */}
                            <Card className="lg:col-span-2 border-0 shadow-lg rounded-2xl overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                                    <CardTitle className="text-lg font-semibold text-gray-800">
                                        Perbandingan Nilai Gizi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={adjustedNutrients.slice(0, 8)}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis
                                                    dataKey="name"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                                />
                                                <YAxis
                                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                                />
                                                <Tooltip
                                                    formatter={(value: any, _name: any, props: any) => [
                                                        `${value.toFixed(1)} ${props.payload.unit}`,
                                                        props.payload.name
                                                    ]}
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                                <Legend
                                                    formatter={(value) => (
                                                        <span className="text-sm text-gray-600">{value}</span>
                                                    )}
                                                />
                                                <Bar
                                                    dataKey="adjustedValue"
                                                    name="Jumlah"
                                                    fill="#3B82F6"
                                                    radius={[4, 4, 0, 0]}
                                                    opacity={0.8}
                                                />
                                                <Bar
                                                    dataKey="adjustedDailyValue"
                                                    name="% AKG"
                                                    fill="#10B981"
                                                    radius={[4, 4, 0, 0]}
                                                    opacity={0.8}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* TAB 3: Perbandingan Antar Pangan */}
                    <TabsContent value="comparison">
                        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                                <CardTitle className="text-xl font-semibold text-gray-800">
                                    Perbandingan Kandungan Gizi
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                    Per 100 gram sajian
                                </p>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-8">
                                    {/* Bar Chart Perbandingan */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={comparisonData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    />
                                                    <YAxis
                                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            borderRadius: '8px',
                                                            border: '1px solid #e5e7eb',
                                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                    <Legend
                                                        formatter={(value) => (
                                                            <span className="text-sm text-gray-600">{value}</span>
                                                        )}
                                                    />
                                                    <Bar
                                                        dataKey="calories"
                                                        name="Kalori (kkal)"
                                                        fill="#FF6B6B"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                    <Bar
                                                        dataKey="protein"
                                                        name="Protein (g)"
                                                        fill="#4ECDC4"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                    <Bar
                                                        dataKey="carbs"
                                                        name="Karbohidrat (g)"
                                                        fill="#FFD166"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                    <Bar
                                                        dataKey="fat"
                                                        name="Lemak (g)"
                                                        fill="#118AB2"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Tabel Perbandingan */}
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                    <TableHead className="font-semibold text-gray-700 py-4">
                                                        Pangan
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        Energi (kkal)
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        Protein (g)
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        Lemak (g)
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        Karbohidrat (g)
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        Serat (g)
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {foodData.map((food) => (
                                                    <TableRow
                                                        key={food.id}
                                                        className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${food.id === selectedFood ? 'bg-blue-50' : ''
                                                            }`}
                                                        onClick={() => handleFoodChange(food.id)}
                                                    >
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center">
                                                                <div
                                                                    className={`w-3 h-3 rounded-full mr-3 ${food.id === selectedFood ? 'ring-2 ring-blue-500' : ''
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor: getCategoryColor(
                                                                            food.nutrients[0]?.category || 'makro'
                                                                        )
                                                                    }}
                                                                />
                                                                <div>
                                                                    <div className="font-medium text-gray-800">
                                                                        {food.indonesianName}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {food.category}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right font-semibold text-gray-800">
                                                            {food.nutrients.find(n => n.id === 'energi')?.value}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right font-semibold text-gray-800">
                                                            {food.nutrients.find(n => n.id === 'protein')?.value.toFixed(1)}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right font-semibold text-gray-800">
                                                            {food.nutrients.find(n => n.id === 'lemak')?.value.toFixed(1)}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right font-semibold text-gray-800">
                                                            {food.nutrients.find(n => n.id === 'karbohidrat')?.value.toFixed(1)}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right font-semibold text-gray-800">
                                                            {food.nutrients.find(n => n.id === 'serat')?.value.toFixed(1) || '0.0'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 4: Database Explorer */}
                    <TabsContent value="database">
                        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                                <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-gray-800">
                                            Database TKPI Explorer
                                        </CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Jelajahi seluruh database bahan pangan
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
                                            {foodData.length} bahan pangan tersedia
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {/* Statistik Database */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { value: '300+', label: 'Jenis Pangan', color: 'from-blue-500 to-blue-400' },
                                            { value: '40+', label: 'Parameter Gizi', color: 'from-green-500 to-green-400' },
                                            { value: '8', label: 'Kategori Pangan', color: 'from-amber-500 to-amber-400' },
                                            { value: '2017', label: 'Edisi Terbaru', color: 'from-purple-500 to-purple-400' }
                                        ].map((stat, index) => (
                                            <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                                <div className={`h-1 w-full rounded-full bg-gradient-to-r ${stat.color} mb-4`}></div>
                                                <div className="text-2xl font-bold text-gray-800 mb-1">
                                                    {stat.value}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {stat.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tabel Database */}
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50">
                                                    <TableHead className="font-semibold text-gray-700 py-4">
                                                        Nama Pangan
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4">
                                                        Kategori
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        BDD (%)
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        Energi (kkal)
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        Protein (g)
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-gray-700 py-4 text-right">
                                                        Aksi
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {foodData.map((food) => (
                                                    <TableRow
                                                        key={food.id}
                                                        className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${food.id === selectedFood ? 'bg-blue-50' : ''
                                                            }`}
                                                    >
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center">
                                                                <div
                                                                    className={`w-3 h-3 rounded-full mr-3 ${food.id === selectedFood ? 'ring-2 ring-blue-500' : ''
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor: getCategoryColor(
                                                                            food.nutrients[0]?.category || 'makro'
                                                                        )
                                                                    }}
                                                                />
                                                                <div>
                                                                    <div className="font-medium text-gray-800">
                                                                        {food.indonesianName}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {food.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-gray-50 text-gray-700 border-gray-200"
                                                            >
                                                                {food.category}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right">
                                                            <div className="inline-flex items-center">
                                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                                    <div
                                                                        className="bg-green-500 h-2 rounded-full"
                                                                        style={{ width: `${food.bdd}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="font-medium text-gray-800">
                                                                    {food.bdd}%
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right font-semibold text-gray-800">
                                                            {food.nutrients.find(n => n.id === 'energi')?.value}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right font-semibold text-gray-800">
                                                            {food.nutrients.find(n => n.id === 'protein')?.value.toFixed(1)}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right">
                                                            <Button
                                                                onClick={() => {
                                                                    handleFoodChange(food.id);
                                                                    setActiveTab('nutrition');
                                                                }}
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                            >
                                                                Lihat Detail
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Footer Informasi */}
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-gray-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">TKPI</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">
                                    Tentang Database TKPI:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <p className="text-sm text-gray-600">
                                            Database resmi komposisi pangan Indonesia dari Kementerian Kesehatan RI
                                        </p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <p className="text-sm text-gray-600">
                                            Digunakan sebagai acuan utama dalam perhitungan gizi di Indonesia
                                        </p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <p className="text-sm text-gray-600">
                                            Mengandung data 300+ jenis pangan dengan 40+ parameter gizi
                                        </p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <p className="text-sm text-gray-600">
                                            Update terakhir: TKPI 2017 (Panganku 4.0)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NutritionLabel;