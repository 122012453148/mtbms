import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Calendar, Users, Clock, Filter, 
    Download, Search, Loader2, CheckCircle, 
    XCircle, AlertCircle, MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';

const HRAttendance = () => {
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchAttendance();
    }, [date]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/attendance/today?date=${date}`);
            setAttendances(data);
        } catch (error) {
            toast.error('Strategic sync failure');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        present: attendances.length,
        late: attendances.filter(a => a.status === 'Late').length,
        onField: attendances.filter(a => a.location === 'Field').length,
    };

    return (
        <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 font-inter pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-50 shadow-sm">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Attendance Protocol</h1>
                    <p className="text-slate-400 font-black mt-2 italic uppercase text-[9px] md:text-[10px] tracking-[0.3em]">Real-time workforce synchronization</p>
                </div>
                <div className="flex w-full lg:w-auto">
                    <div className="relative w-full lg:w-64">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#CE2626]" size={20} />
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-16 pr-8 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-slate-900/5 transition-all cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
                {[
                    { label: 'Workforce Present', count: stats.present, color: 'text-emerald-500', icon: <CheckCircle size={24}/>, bg: 'bg-emerald-50' },
                    { label: 'Latency Detected', count: stats.late, color: 'text-amber-500', icon: <Clock size={24}/>, bg: 'bg-amber-50' },
                    { label: 'Field Operations', count: stats.onField, color: 'text-indigo-500', icon: <MapPin size={24}/>, bg: 'bg-indigo-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-50 shadow-sm relative overflow-hidden group transition-all hover:shadow-xl">
                        <div className={`absolute top-0 right-0 p-6 ${stat.color} opacity-10 group-hover:scale-125 transition-transform duration-500`}>
                            {stat.icon}
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-6 italic">{stat.label}</p>
                        <h4 className={`text-4xl md:text-5xl font-black ${stat.color} tracking-tighter italic`}>{stat.count}</h4>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[4rem] border border-slate-50 shadow-2xl overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-6">
                        <div className="relative">
                            <Loader2 className="animate-spin text-[#CE2626]" size={48} />
                            <div className="absolute inset-0 bg-rose-500/10 blur-2xl rounded-full"></div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-slate-300 animate-pulse">Syncing logs...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                <tr>
                                    <th className="px-10 py-8 md:py-10">Associate Identity</th>
                                    <th className="px-8 py-8 md:py-10">Check In</th>
                                    <th className="px-8 py-8 md:py-10">Check Out</th>
                                    <th className="px-8 py-8 md:py-10 text-center">Protocol Status</th>
                                    <th className="px-10 py-8 md:py-10 text-right">Operational Audit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {attendances.map((record) => (
                                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-8 md:py-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform">
                                                    {record.userId?.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight italic">{record.userId?.name}</p>
                                                    <p className="text-[9px] font-black text-[#CE2626] uppercase tracking-[0.2em] mt-1">{record.userId?.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 md:py-10">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700 tracking-tight">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '--:--'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 md:py-10">
                                            <span className="text-sm font-black text-slate-700 tracking-tight">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '--:--'}</span>
                                        </td>
                                        <td className="px-8 py-8 md:py-10 text-center">
                                            <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border ${
                                                record.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 md:py-10 text-right">
                                            <button className="text-[9px] font-black text-slate-300 hover:text-white hover:bg-slate-900 transition-all uppercase tracking-[0.2em] border border-slate-100 px-6 py-3 rounded-xl italic">View Logs</button>
                                        </td>
                                    </tr>
                                ))}
                                {attendances.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center gap-6 opacity-20">
                                                <AlertCircle size={56} className="text-slate-400" />
                                                <p className="font-black text-[10px] uppercase tracking-[0.5em] italic">Zero Engagement Logs Detected</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>

    );
};

export default HRAttendance;
