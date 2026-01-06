import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Plus, Send, ShieldCheck, Globe, Star, ChevronRight } from 'lucide-react';

const TambahPemasok = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/pemasok', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.success) {
                alert('Pemasok berhasil ditambahkan!');
                setFormData({ name: '', email: '', phone: '', address: '' });
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal menambahkan pemasok.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col xl:flex-row gap-10">
                {/* Left: Interactive Form */}
                <div className="w-full xl:w-[500px]">
                    <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden transition-colors">
                        <div className="px-8 py-7 border-b border-gray-100 bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20 transform -rotate-1 group-hover:rotate-0 transition-transform">
                                    <Plus size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-black tracking-tight">Register Supplier</h2>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">Partner Onboarding</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-7">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1">
                                    <User size={12} className="text-black" /> Identity
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. PT. Global Logistik Sejahtera"
                                    className="w-full px-5 py-4 bg-[#fcfcfc] border border-gray-200 rounded-2xl focus:ring-0 focus:border-black focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-sm"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1">
                                        <Mail size={12} className="text-black" /> Business Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contact@company.com"
                                        className="w-full px-5 py-4 bg-[#fcfcfc] border border-gray-200 rounded-2xl focus:ring-0 focus:border-black focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1">
                                        <Phone size={12} className="text-black" /> Contact
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+62 21 555 0123"
                                        className="w-full px-5 py-4 bg-[#fcfcfc] border border-gray-200 rounded-2xl focus:ring-0 focus:border-black focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1">
                                    <MapPin size={12} className="text-black" /> Official Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Building A, Fl. 4, Industrial Area Kav. 12"
                                    className="w-full px-5 py-4 bg-[#fcfcfc] border border-gray-200 rounded-2xl focus:ring-0 focus:border-black focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-sm"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative flex items-center justify-center gap-3 bg-black text-white py-5 px-4 rounded-2xl font-black text-sm shadow-2xl shadow-black/10 hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                        AUTH & CREATE PARTNER
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Premium Context & Features */}
                <div className="flex-1 flex flex-col gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FeatureCard
                            icon={<ShieldCheck size={28} className="text-black" />}
                            title="Validated Partner"
                            desc="Every entry is encrypted and verified against our procurement standards."
                        />
                        <FeatureCard
                            icon={<Star size={28} className="text-yellow-500" />}
                            title="Tier-1 Network"
                            desc="Categorize your top-performing suppliers for prioritized stock requests."
                        />
                        <FeatureCard
                            icon={<Globe size={28} className="text-blue-500" />}
                            title="Region Coverage"
                            desc="Add localization tags to optimize logistics and delivery timelines."
                        />
                        <div className="bg-black rounded-3xl p-8 flex flex-col justify-between text-white overflow-hidden relative group border border-transparent transition-colors">
                            <ChevronRight size={80} className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity" />
                            <div>
                                <h4 className="text-lg font-black tracking-tight mb-2">Vendor Portal</h4>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Coming Soon: Connect directly with suppliers.</p>
                            </div>
                            <div className="mt-8 flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center"><User size={10} /></div>)}
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">+12 Partners</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto bg-gray-50 border border-gray-100 rounded-3xl p-8 transition-colors">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quick Integration Guide</h4>
                        <div className="space-y-4">
                            <GuideStep step="01" text="Input legal business name correctly." />
                            <GuideStep step="02" text="Attach active email for automated purchase orders." />
                            <GuideStep step="03" text="Define warehouse distance for shipping estimates." />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

const FeatureCard = ({ icon, title, desc }: FeatureCardProps) => (
    <div className="bg-white border border-gray-100 p-8 rounded-[32px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="mb-6 w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center transition-colors">{icon}</div>
        <h4 className="text-base font-black text-black mb-2">{title}</h4>
        <p className="text-[12px] text-gray-500 leading-relaxed font-semibold">{desc}</p>
    </div>
);

interface GuideStepProps {
    step: string;
    text: string;
}

const GuideStep = ({ step, text }: GuideStepProps) => (
    <div className="flex items-center gap-4">
        <span className="text-[10px] font-black text-black/20 font-mono tracking-tighter">{step}</span>
        <p className="text-[11px] font-bold text-gray-600">{text}</p>
    </div>
);

export default TambahPemasok;
