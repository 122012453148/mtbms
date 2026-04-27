import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Package, Users, ClipboardList, 
    AlertTriangle, CheckSquare, TrendingUp,
    ArrowUpRight, Clock, ShieldCheck, Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MgrStat = ({ title, value, sub, icon, trend }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-[#CE2626] group-hover:text-white transition-colors">
                {icon}
            </div>
            {trend && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    {trend}%
                </span>
            )}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-xl font-bold text-slate-900">{value}</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-medium italic opacity-70">{sub}</p>
        </div>
    </div>
);

const ManagerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/manager/stats');
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

    // Transform monthlyRevenue for chart
    const chartData = stats?.monthlyRevenue || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-inter">
            {/* Control Center */}
            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">MTBMS Manager Dashboard</h1>
                    <p className="text-[10px] md:text-sm text-slate-500 mt-2 font-black uppercase tracking-widest opacity-60">Cross-operational performance and task distribution</p>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button 
                        onClick={() => navigate('/manager-tasks')}
                        className="flex-1 lg:flex-none bg-[#CE2626] text-white px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> <span>Initialize Task</span>
                    </button>
                    <button className="flex-1 lg:flex-none bg-[#161E54] text-white px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105">
                        <ShieldCheck size={16} /> <span>System Check</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MgrStat title="Team Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} sub="Direct sales generated" icon={<TrendingUp size={20} />} trend="+12" />
                <MgrStat title="Workforce" value={stats?.teamCount || 0} sub="Staff under supervision" icon={<Users size={20} />} />
                <MgrStat title="Active Tasks" value={stats?.pendingTasks || 0} sub="Pending completion" icon={<ClipboardList size={20} />} />
                <MgrStat title="Task Success" value={stats?.completedTasks || 0} sub="Completed milestones" icon={<CheckSquare size={20} />} trend="+5" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-8 uppercase tracking-widest">Monthly Revenue Trend</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorMgr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#CE2626" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#CE2626" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#CE2626" strokeWidth={3} fillOpacity={1} fill="url(#colorMgr)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-xl shadow-xl flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">Project Distribution</h3>
                    <div className="space-y-6 flex-1 overflow-y-auto">
                        {stats?.projectBreakdown?.map((proj, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="truncate">{proj._id}</span>
                                    <span className="text-[#CE2626]">₹{proj.total.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                    <div className="bg-[#CE2626] h-full" style={{ width: `${Math.min((proj.total / (stats.totalRevenue || 1)) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Pulse</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Operational Analytics Active</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest">Team Performance Engine</h3>
                    <button className="text-[10px] font-black text-[#CE2626] uppercase hover:underline">View Deep Logs</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Sync Status</p>
                        <p className="text-xs font-black text-emerald-500 uppercase tracking-widest italic">All systems green</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Milestones Hit</p>
                        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest italic">85% Quarterly Target</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Staff Activity</p>
                        <p className="text-xs font-black text-amber-500 uppercase tracking-widest italic">Peak efficiency active</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
