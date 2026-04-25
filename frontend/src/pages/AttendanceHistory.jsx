import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, Calendar, CheckCircle, XCircle, Search, Filter, Loader2 } from 'lucide-react';

const AttendanceHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [todayRecord, setTodayRecord] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/attendance/my');
            setHistory(data);
            
            const today = new Date().toISOString().split('T')[0];
            const todayRec = data.find(r => new Date(r.date).toISOString().split('T')[0] === today);
            setTodayRecord(todayRec);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            await api.post('/attendance/checkin');
            fetchHistory();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-in failure');
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post('/attendance/checkout');
            fetchHistory();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-out failure');
        }
    };

    const filteredHistory = history.filter(item => 
        new Date(item.date).toLocaleDateString().includes(filterDate)
    );

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#9B8EC7]" size={40} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-inter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 uppercase tracking-tight">Attendance Logs</h1>
                    <p className="text-sm text-slate-500 mt-1 italic">Historical shift verification and status tracking</p>
                </div>
                <div className="flex gap-4">
                    {!todayRecord ? (
                        <button 
                            onClick={handleCheckIn}
                            className="px-8 py-3 bg-[#9B8EC7] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#7E74C9] transition-all shadow-xl shadow-indigo-500/10"
                        >
                            Execute Check-In
                        </button>
                    ) : !todayRecord.checkOut ? (
                        <button 
                            onClick={handleCheckOut}
                            className="px-8 py-3 bg-[#CE2626] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/10"
                        >
                            Terminate Shift
                        </button>
                    ) : (
                        <div className="px-8 py-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl">
                            Shift Verified
                        </div>
                    )}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Filter by date..."
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="bg-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#9B8EC7]/10 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-[0.15em] text-slate-400">
                        <tr>
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Shift Start</th>
                            <th className="px-8 py-5">Shift End</th>
                            <th className="px-8 py-5 text-center">Duration</th>
                            <th className="px-8 py-5 text-right">Verification</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredHistory.map((row) => {
                            const duration = row.checkIn && row.checkOut 
                                ? Math.round((new Date(row.checkOut) - new Date(row.checkIn)) / (1000 * 60 * 60) * 10) / 10
                                : '-';
                            
                            return (
                                <tr key={row._id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                                    <td className="px-8 py-5 font-bold text-slate-900">{new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                                    <td className="px-8 py-5 font-medium text-slate-600 italic">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-slate-300" />
                                            {row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-medium text-slate-600 italic">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-slate-300" />
                                            {row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center text-slate-400 font-bold">{duration} hrs</td>
                                    <td className="px-8 py-5 text-right flex justify-end">
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            row.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {row.status === 'Present' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {row.status}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {history.length === 0 && (
                    <div className="p-20 text-center text-slate-400 font-bold italic uppercase tracking-widest opacity-20">No Shift Records Found</div>
                )}
            </div>
        </div>
    );
};

export default AttendanceHistory;
