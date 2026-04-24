import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Users, Clock, FileEdit, Plus, 
    Filter, TrendingUp, CheckCircle2, 
    XCircle, AlertCircle, DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HRDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchHRStats = async () => {
        try {
            const { data } = await api.get('/hr/stats');
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHRStats();
        const interval = setInterval(fetchHRStats, 5000);
        return () => clearInterval(interval);
    }, []);

    // Placeholder trend as backend doesn't have daily attendance aggregation yet
    const trendData = [
        { name: 'Today', attendance: stats?.presentToday || 0 },
        { name: 'Pending', attendance: stats?.pendingLeaves || 0 }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-inter">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">MTBMS HR Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1 italic">Real-time workforce intelligence and attendance tracking</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <HRStatCard title="Total Staff" value={stats?.totalEmployees || 0} icon={<Users size={20} />} color="bg-blue-50 text-blue-600" />
                <HRStatCard title="Present Today" value={stats?.presentToday || 0} icon={<CheckCircle2 size={20} />} color="bg-emerald-50 text-emerald-600" />
                <HRStatCard title="Total Managers" value={stats?.totalManagers || 0} icon={<AlertCircle size={20} />} color="bg-indigo-50 text-indigo-600" />
                <HRStatCard title="Leaves Pending" value={stats?.pendingLeaves || 0} icon={<Filter size={20} />} color="bg-amber-50 text-amber-600" />
                <HRStatCard title="Payroll Total" value={`₹${(stats?.totalPayroll || 0).toLocaleString()}`} icon={<DollarSign size={20} />} color="bg-slate-900 text-white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest mb-8">Daily Workforce Pulse</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Area type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={3} fill="url(#colorAttend)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest mb-6">Monthly Budget</h3>
                        <div className="space-y-5">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Allocated Budget</p>
                                <p className="text-xl font-black text-slate-900">₹{(stats?.budget?.totalAmount || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-[#CE2626]/5 rounded-xl">
                                <p className="text-[10px] font-black text-[#CE2626] uppercase tracking-widest mb-2">Remaining Balance</p>
                                <p className="text-xl font-black text-[#CE2626]">₹{(stats?.budget?.remainingAmount || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-xl shadow-xl text-white">
                        <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">HR Notice</h3>
                        <p className="text-sm font-medium leading-relaxed">System-wide staff performance review is scheduled for this month. Ensure all ratings are updated.</p>
                        <button className="mt-6 w-full py-3 bg-[#CE2626] hover:bg-rose-700 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-rose-500/20">MANAGE WORKFORCE</button>
                    </div>
                </div>
            </div>

            {/* Recent HR Activity Log Placeholder */}
            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest">HR Pulse Engine</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Live Sync Active</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Attendance Sync', status: 'Optimal', color: 'text-emerald-500' },
                        { label: 'Payroll Engine', status: 'Standby', color: 'text-amber-500' },
                        { label: 'Recruitment Pipe', status: 'Active', color: 'text-blue-500' }
                    ].map((m, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{m.label}</p>
                            <p className={`text-sm font-black ${m.color} uppercase tracking-tighter italic`}>{m.status}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
