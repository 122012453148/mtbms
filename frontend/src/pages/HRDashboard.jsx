import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Users, Clock, FileEdit, Plus, 
    Filter, TrendingUp, CheckCircle2, 
    XCircle, AlertCircle, DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', attendance: 95 },
    { name: 'Tue', attendance: 92 },
    { name: 'Wed', attendance: 98 },
    { name: 'Thu', attendance: 90 },
    { name: 'Fri', attendance: 88 },
    { name: 'Sat', attendance: 82 },
    { name: 'Sun', attendance: 85 },
];

const HRStatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
            </div>
        </div>
    </div>
);

const HRDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchHRStats();
    }, []);

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
                <HRStatCard title="Absent" value={stats?.absentToday || 0} icon={<XCircle size={20} />} color="bg-rose-50 text-rose-600" />
                <HRStatCard title="Leaves Pending" value={stats?.pendingLeaves || 0} icon={<AlertCircle size={20} />} color="bg-amber-50 text-amber-600" />
                <HRStatCard title="Payroll Total" value={`$${(stats?.totalPayroll || 0).toLocaleString()}`} icon={<DollarSign size={20} />} color="bg-slate-900 text-white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest mb-8">Weekly Attendance Trend (%)</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
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
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest mb-6">Action Items</h3>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-xs font-bold text-slate-800">New Leave Request</p>
                                    <p className="text-[10px] text-slate-400 font-medium">David Wilson (Vacation)</p>
                                </div>
                                <button className="text-[10px] font-black text-[#CE2626] hover:underline">REVIEW</button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Payroll Finalization</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Cycle: April 2026</p>
                                </div>
                                <button className="text-[10px] font-black text-[#CE2626] hover:underline">EXECUTE</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-xl shadow-xl text-white">
                        <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">HR Notice</h3>
                        <p className="text-sm font-medium leading-relaxed">System-wide staff performance review is scheduled for next Monday. Ensure all ratings are updated.</p>
                        <button className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase transition-all">BROADCAST INFO</button>
                    </div>
                </div>
            </div>

            {/* Recent HR Activity */}
            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest mb-8">HR Event Logs</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Target Entity</th>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm italic">
                            {[
                                { action: "Employee Registered", entity: "Mark Spencer", time: "10:15 AM", status: "Success" },
                                { action: "Salary Disbursed", entity: "HR Team (Batch)", time: "09:30 AM", status: "Completed" },
                                { action: "Leave Rejected", entity: "John Doe", time: "Yesterday", status: "Manual Override" }
                            ].map((evt, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4 font-bold text-slate-700 not-italic">{evt.action}</td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">{evt.entity}</td>
                                    <td className="px-6 py-4 text-slate-400 text-xs">{evt.time}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-tighter">{evt.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
