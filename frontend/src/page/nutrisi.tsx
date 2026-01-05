import React from 'react';
import NutritionLabel from '../components/ui/NutritionLabel';

const Nutrisi: React.FC = () => {
    return (
        <>
            <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Nutrisi</h1>
                <p className="text-gray-600">Halaman Nutrisi - Kelola nutrisi bisnis Anda di sini.</p>
            </div>
            <div className="p-8 border border-gray-200 rounded-lg">
                <NutritionLabel />
            </div>
        </>
    );
};

export default Nutrisi;
