import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Users, Target, Briefcase, 
    TrendingUp, ArrowUpRight, DollarSign,
    Calendar, CheckCircle2, MessageSquare,
    Loader2, Search, Bell, Filter, ChevronDown,
    ArrowUp, ArrowDown, Clock
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area,
    CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';

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
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/sales/stats');
            setStats(data);
        } catch (error) {
            console.error("Sales intellectual core sync failure:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#CE2626] mb-4" size={48} />
                <p className="text-[12px] font-medium uppercase text-[#64748B] tracking-widest">Synchronizing Intelligence...</p>
            </div>
        );
    }

    const leadTrend = stats?.monthlyLeads || [];

    return (
        <div className="space-y-8 font-inter bg-[#F6F8FC]">
            {/* Header / Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_8px_20px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#CE2626]/5 to-[#CE2626]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight italic">MTBMS Sales Dashboard</h1>
                    <p className="text-[#64748B] font-medium mt-1 text-sm">Welcome back! Here's what's happening with your leads today.</p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <button className="bg-gradient-to-r from-[#CE2626] to-[#161E54] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95">
                        Launch Campaign
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <SalesStat title="Lead Volume" value={stats?.totalLeads || 0} icon={<Target color="#4C6FFF" />} color="bg-[#4C6FFF]" trend="+15%" />
                <SalesStat title="Active Leads" value={stats?.activeLeads || 0} icon={<Briefcase color="#F59E0B" />} color="bg-[#F59E0B]" trend="+8" />
                <SalesStat title="Conversions" value={stats?.convertedCustomers || 0} icon={<CheckCircle2 color="#22C55E" />} color="bg-[#22C55E]" trend="+4%" />
                <SalesStat title="Net Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={<DollarSign color="#1E293B" />} color="bg-slate-900 text-white" />
                <SalesStat title="Auto Refresh" value="Active" icon={<Clock color="#EF4444" />} color="bg-[#EF4444]" />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                <div className="lg:col-span-2 bg-white p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_8px_20px_rgba(0,0,0,0.05)] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#1E293B]">Lead Inflow History</h3>
                            <p className="text-xs text-[#64748B]">Monthly lead acquisition trend</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={leadTrend}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#CE2626" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#CE2626" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Area type="monotone" dataKey="count" stroke="#CE2626" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_8px_20px_rgba(0,0,0,0.05)] flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-[#1E293B]">Pipeline Breakdown</h3>
                        <p className="text-xs text-[#64748B]">Distribution of leads by status</p>
                    </div>
                    <div className="space-y-6 flex-1 overflow-y-auto">
                        {stats?.pipelineDistribution?.map((p, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[#64748B]">
                                    <span>{p._id}</span>
                                    <span className="text-[#CE2626]">{p.count}</span>
                                </div>
                                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-[#CE2626] to-[#161E54] h-full transition-all duration-1000" 
                                        style={{ width: `${(p.count / (stats.totalLeads || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-6 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute inset-0"></div>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full relative"></div>
                            </div>
                            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Live Pulse Engine Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
