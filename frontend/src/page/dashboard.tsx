import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700">Today's Revenue</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">$12,450</p>
                </div>
                {/* Tambahkan konten lainnya */}
            </div>
        </div>
    );
};

export default Dashboard;