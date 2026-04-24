import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Calendar, Clock, CheckCircle, XCircle, 
    Plus, Loader2, AlertCircle, Bookmark
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const socket = io('https://mtbms.onrender.com');

const LeavePage = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Sick',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const fetchLeaves = async () => {
        try {
            const { data } = await api.get('/leaves/my');
            setLeaves(data);
        } catch (error) {
            toast.error('Sync failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchLeaves();
            socket.emit('join', user._id);

            socket.on('leaveCreated', () => {
                fetchLeaves();
            });

            socket.on('leaveUpdated', (updatedLeave) => {
                setLeaves(prev => prev.map(l => l._id === updatedLeave._id ? updatedLeave : l));
            });

            return () => {
                socket.off('leaveCreated');
                socket.off('leaveUpdated');
            };
        }
    }, [user]);

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leaves', formData);
            toast.success('Leave Request Transmitted');
            setShowApplyModal(false);
            setFormData({ type: 'Sick', fromDate: '', toDate: '', reason: '' });
            fetchLeaves();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    return (
        <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 font-inter pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Absence Protocol Hub</h1>
                    <p className="text-[10px] md:text-sm text-slate-500 font-medium mt-1 italic uppercase tracking-wider">Managing <span className="text-[#CE2626] font-black">{leaves.length}</span> time-off cycles</p>
                </div>
                <button 
                    onClick={() => setShowApplyModal(true)}
                    className="w-full lg:w-auto px-10 py-4 bg-[#CE2626] text-white rounded-2xl text-[10px] md:text-xs font-black shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] italic flex items-center justify-center gap-3"
                >
                    <Plus size={18} /> Apply Leave
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Pending Validation', count: leaves.filter(l => l.status === 'pending').length, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Authorized Cycles', count: leaves.filter(l => l.status === 'approved').length, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Rejected Protocol', count: leaves.filter(l => l.status === 'rejected').length, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Total Volume', count: leaves.length, color: 'text-slate-900', bg: 'bg-slate-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                        <div className={`absolute top-0 right-0 w-3 h-full ${stat.bg} opacity-50`}></div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-4">{stat.label}</p>
                        <h4 className={`text-2xl md:text-3xl font-black ${stat.color} tracking-tighter italic`}>{stat.count}</h4>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-slate-50/50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                            <tr>
                                <th className="px-8 md:px-10 py-6 md:py-8">Type</th>
                                <th className="px-6 py-6 md:py-8">Time Frame</th>
                                <th className="px-6 py-6 md:py-8">Reason</th>
                                <th className="px-6 py-6 md:py-8 text-center">Status</th>
                                <th className="px-6 py-6 md:py-8">Verified By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {leaves.length > 0 ? leaves.map((leave) => (
                                <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 md:px-10 py-6 md:py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-900 text-white rounded-[1rem] flex items-center justify-center font-black text-xs uppercase shadow-lg shadow-slate-900/10">
                                                {leave.type[0]}
                                            </div>
                                            <div>
                                                <p className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-tight italic">{leave.type} LEAVE</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 md:py-8 font-black text-slate-600 text-xs md:text-sm tracking-tight">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-[#CE2626]" />
                                            {new Date(leave.fromDate).toLocaleDateString()} → {new Date(leave.toDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 md:py-8 italic text-[10px] md:text-xs font-medium text-slate-400 max-w-xs">{leave.reason}</td>
                                    <td className="px-6 py-6 md:py-8 text-center">
                                        <span className={`px-4 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${getStatusColor(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 md:py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-[9px] font-black text-slate-400 shadow-inner">
                                                {leave.reviewedBy?.name?.[0] || '?'}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter italic">
                                                {leave.reviewedBy?.name || 'Waiting...'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
                                            <AlertCircle size={40} className="opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">No absence protocols detected</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showApplyModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
                        <div className="bg-slate-900 p-8 md:p-10 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-black uppercase tracking-[0.2em] text-xs md:text-sm italic">Request Absence</h2>
                                <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">HR Compliance Protocol Active</p>
                            </div>
                            <button onClick={() => setShowApplyModal(false)} className="p-2 bg-white/10 rounded-xl hover:text-[#CE2626] transition-all font-black">X</button>
                        </div>
                        <form onSubmit={handleApply} className="p-8 md:p-12 space-y-6 md:space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Absence Designation</label>
                                <select 
                                    className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Emergency">Emergency Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Engagement Start</label>
                                    <input 
                                        type="date" required className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={formData.fromDate} onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Engagement End</label>
                                    <input 
                                        type="date" required className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={formData.toDate} onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Justification</label>
                                <textarea 
                                    className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight resize-none h-28 focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                    placeholder="State your reasons for absence..."
                                />
                            </div>
                            <button className="w-full py-5 md:py-6 bg-[#CE2626] text-white rounded-[2rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] italic shadow-2xl shadow-rose-500/30 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                TRANSMIT REQUEST
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>

    );
};

export default LeavePage;
