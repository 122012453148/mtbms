import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Package, Users, ClipboardList, 
    AlertTriangle, CheckSquare, TrendingUp,
    ArrowUpRight, Clock, ShieldCheck, Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">MTBMS Manager Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Cross-operational performance and task distribution</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate('/manager-tasks')}
                        className="bg-[#CE2626] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <Plus size={16} /> INITIALIZE TASK
                    </button>
                    <button className="bg-[#161E54] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 hover:scale-105">
                        <ShieldCheck size={16} /> System Check
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
