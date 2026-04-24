import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Package, Users, ShoppingCart, DollarSign, Activity, 
    ArrowUpRight, ArrowDownRight, Clock, Plus, Filter,
    Briefcase, FileText, CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const StatCard = ({ title, value, icon, trend, subtext }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-[#CE2626] rounded-xl flex items-center justify-center">
                {icon}
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('This Week');

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/dashboard/stats');
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    // Transform monthlySales for chart
    const chartData = stats?.monthlySales || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header + Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic">MTBMS Dashboard</h1>
                    <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">Real-time performance metrics across all units</p>
                </div>
                
                <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                    {['Today', 'This Week', 'This Month'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 md:px-5 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                filter === f 
                                ? 'bg-[#CE2626] text-white shadow-lg' 
                                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard 
                    title="Gross Revenue" 
                    value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} 
                    icon={<DollarSign size={20} />} 
                    trend={14.2}
                />
                <StatCard 
                    title="Net Profit" 
                    value={`₹${(stats?.totalProfit || 0).toLocaleString()}`} 
                    icon={<Activity size={20} />} 
                    trend={8.5}
                />
                <StatCard 
                    title="Active Employees" 
                    value={stats?.employeeCount || 0} 
                    icon={<Users size={20} />} 
                />
                <StatCard 
                    title="Total Materials" 
                    value={stats?.totalMaterials || 0} 
                    icon={<Package size={20} />} 
                    trend={-2.4}
                />
            </div>

            {/* Small summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-[#CE2626] p-6 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-rose-500/10 transition-transform hover:scale-[1.02]">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Pending Orders</p>
                        <h4 className="text-2xl font-black mt-2 text-white">{stats?.pendingOrders || 0}</h4>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <ShoppingCart size={18} />
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-slate-900/10 transition-transform hover:scale-[1.02]">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Completed Sales</p>
                        <h4 className="text-2xl font-black mt-2 text-white">{stats?.completedOrders || 0}</h4>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <CheckCircle2 size={18} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm transition-transform hover:scale-[1.02]">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Tickets</p>
                        <h4 className="text-2xl font-black mt-2 text-slate-900">{stats?.supportTickets || 0}</h4>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <Activity size={18} />
                    </div>
                </div>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Charts Area */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-wider">Sales Volume History</h3>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                    <ArrowUpRight size={12} /> Live
                                </span>
                            </div>
                        </div>
                        <div className="h-[280px] md:h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#CE2626" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#CE2626" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: 'none', 
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }} 
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#CE2626" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Recent activity</h3>
                            <button className="text-[10px] font-black text-[#CE2626] uppercase tracking-widest hover:underline">View all</button>
                        </div>
                        <div className="space-y-8 relative">
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-50"></div>
                            {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((log, i) => (
                                <div key={i} className="relative pl-9 group">
                                    <div className={`absolute left-0 w-[24px] h-[24px] bg-white border-2 border-slate-100 rounded-lg z-10 flex items-center justify-center transition-all group-hover:border-[#CE2626]`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#CE2626]"></div>
                                    </div>
                                    <p className="text-xs font-black text-slate-800 tracking-tight leading-none uppercase">{log.action}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Recent Activity</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">System Pulse</h3>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping absolute inset-0 opacity-40"></div>
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full relative"></div>
                                </div>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">All protocols active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
