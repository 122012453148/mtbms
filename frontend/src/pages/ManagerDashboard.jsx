import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Package, Users, ClipboardList, 
    AlertTriangle, CheckSquare, TrendingUp,
    ArrowUpRight, Clock, ShieldCheck, Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Day 1', efficiency: 65 },
    { name: 'Day 2', efficiency: 72 },
    { name: 'Day 3', efficiency: 80 },
    { name: 'Day 4', efficiency: 78 },
    { name: 'Day 5', efficiency: 85 },
    { name: 'Day 6', efficiency: 90 },
    { name: 'Day 7', efficiency: 94 },
];

const MgrStat = ({ title, value, sub, icon, trend }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-[#CE2626] rounded-xl flex items-center justify-center">
                {icon}
            </div>
            {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}%</span>}
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">{sub}</p>
    </div>
);

const ManagerDashboard = () => {
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/manager/stats');
                setStats(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, []);

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
                    <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Clock size={16} /> History
                    </button>
                    <button className="bg-[#161E54] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 hover:scale-105">
                        <ShieldCheck size={16} /> System Check
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MgrStat title="Inventory Pool" value={stats?.totalMaterials || 0} sub="Items in tracking" icon={<Package size={20} />} trend="+5" />
                <MgrStat title="Critically Low" value={stats?.lowStockItems || 0} sub="Requires immediate reorder" icon={<AlertTriangle size={20} />} />
                <MgrStat title="Assigned Tasks" value={stats?.tasksPending || 0} sub="Pending completion" icon={<ClipboardList size={20} />} />
                <MgrStat title="Workforce" value={stats?.activeEmployees || 0} sub="Clocked in staff" icon={<Users size={20} />} trend="+2" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-8 uppercase tracking-widest">Team Efficiency Score</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorMgr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#CE2626" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#CE2626" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Area type="monotone" dataKey="efficiency" stroke="#CE2626" strokeWidth={3} fillOpacity={1} fill="url(#colorMgr)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-xl shadow-xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">Active Objectives</h3>
                        <div className="space-y-6">
                            {[
                                { t: "Material Audit", p: 85 },
                                { t: "Weekly Staff Evaluation", p: 40 },
                                { t: "Procurement Finalization", p: 10 }
                            ].map((obj, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span>{obj.t}</span>
                                        <span className="text-[#CE2626]">{obj.p}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="bg-[#CE2626] h-full" style={{ width: `${obj.p}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="mt-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        View Progress Reports
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-6 uppercase tracking-widest">Managerial Log</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                            <p className="text-xs font-semibold text-slate-700">Urgent: STOCK CATEGORY 'VALVES' BELOW 5%</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">2m ago</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <p className="text-xs font-semibold text-slate-700">Team Daily Attendance Completed</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">1h ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
