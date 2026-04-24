import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Users, Target, Briefcase, 
    TrendingUp, ArrowUpRight, DollarSign,
    Calendar, CheckCircle2, MessageSquare,
    Loader2, Search, Bell, Filter, ChevronDown,
    ArrowUp, ArrowDown
} from 'lucide-react';

const SalesStat = ({ title, value, icon, trend, color, trendUp = true }) => (
    <div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-[0_8px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 group">
        <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-50 text-[#22C55E]' : 'bg-rose-50 text-[#EF4444]'}`}>
                    {trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {trend}
                </div>
            )}
        </div>
        <div className="mt-6">
            <p className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">{title}</p>
            <h3 className="text-2xl font-semibold text-[#1E293B] mt-1 tracking-tight">{value}</h3>
        </div>
    </div>
);

const SalesDashboard = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        activeDeals: 0,
        convertedCustomers: 0,
        totalRevenue: 0,
        pendingFollowups: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/sales/stats');
                if (data) setStats(prev => ({ ...prev, ...data }));
            } catch (error) {
                console.error("Sales intellectual core sync failure:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#6C63FF] mb-4" size={48} />
                <p className="text-[12px] font-medium uppercase text-[#64748B] tracking-widest">Synchronizing Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-inter bg-[#F6F8FC]">
            {/* Header / Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_8px_20px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#6C63FF]/5 to-[#8E7CFF]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight italic">MTBMS Sales Dashboard</h1>
                    <p className="text-[#64748B] font-medium mt-1 text-sm">Welcome back! Here's what's happening with your deals today.</p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <button className="bg-[#F1F5F9] text-[#1E293B] px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-[#E2E8F0] active:scale-95 flex items-center gap-2">
                        Export Intel
                    </button>
                    <button className="bg-gradient-to-r from-[#6C63FF] to-[#8E7CFF] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#6C63FF]/20 hover:scale-105 active:scale-95">
                        Launch Campaign
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <SalesStat title="Lead Volume" value={stats.totalLeads} icon={<Target color="#4C6FFF" />} color="bg-[#4C6FFF]" trend="+15%" />
                <SalesStat title="Active deals" value={stats.activeDeals} icon={<Briefcase color="#F59E0B" />} color="bg-[#F59E0B]" trend="+8" />
                <SalesStat title="Conversions" value={stats.convertedCustomers} icon={<CheckCircle2 color="#22C55E" />} color="bg-[#22C55E]" trend="+4%" />
                <SalesStat title="Net Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign color="#1E293B" />} color="bg-slate-900 text-white" />
                <SalesStat title="Follow-ups" value={stats.pendingFollowups} icon={<MessageSquare color="#EF4444" />} color="bg-[#EF4444]" trend="-2" trendUp={false} />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                <div className="lg:col-span-2 bg-white p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_8px_20px_rgba(0,0,0,0.05)] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#1E293B]">Visitor Insights</h3>
                            <p className="text-xs text-[#64748B]">Monthly commercial activity</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#6C63FF]" />
                                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">New</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Returning</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] rounded-2xl border border-dotted border-[#CBD5E1] py-12">
                        <TrendingUp size={48} className="text-[#CBD5E1] mb-4" />
                        <p className="text-sm font-semibold text-[#94A3B8]">Intelligence Visualization Active</p>
                        <p className="text-[11px] text-[#94A3B8] uppercase tracking-widest mt-2 font-bold italic">Real-time data synchronization enabled</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_8px_20px_rgba(0,0,0,0.05)] flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-[#1E293B]">Target vs Reality</h3>
                        <p className="text-xs text-[#64748B]">Performance analytics</p>
                    </div>
                    <div className="space-y-8 flex-1">
                        <div className="relative pt-12 pb-12 flex items-center justify-center">
                            <div className="text-5xl font-black text-[#1E293B] italic">22.4%</div>
                            <div className="absolute top-0 right-0 p-3 bg-emerald-50 rounded-xl">
                                <ArrowUpRight className="text-[#22C55E]" size={24} />
                            </div>
                        </div>
                        <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9] space-y-4">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
                                <span>Efficiency Index</span>
                                <span className="text-[#6C63FF]">65% Progress</span>
                            </div>
                            <div className="w-full bg-[#E2E8F0] h-3 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-[#6C63FF] to-[#8E7CFF] h-full w-[65%] rounded-full shadow-[0_0_15px_rgba(108,99,255,0.3)] transition-all duration-1000" />
                            </div>
                            <p className="text-[10px] text-[#64748B] font-medium leading-relaxed italic">System verified: Operational velocity exceeded monthly baseline by 4.2%.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
