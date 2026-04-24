import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Calendar, CheckCircle, XCircle, 
    Loader2, AlertCircle, User,
    FileText, Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const ManagerLeaveRequests = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState(null);

    const fetchAllLeaves = async () => {
        try {
            const { data } = await api.get('/leaves/fetch-all');
            setLeaves(data);
        } catch (error) {
            console.error('Fetch Leaves Error:', error);
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(`Data synchronization failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllLeaves();
        
        // socket.on('leaveCreated', () => {
        //     fetchAllLeaves();
        // });

        // socket.on('leaveUpdated', (updatedLeave) => {
        //     setLeaves(prev => prev.map(l => l._id === updatedLeave._id ? updatedLeave : l));
        // });

        // return () => {
        //     socket.off('leaveCreated');
        //     socket.off('leaveUpdated');
        // };
    }, []);

    const handleAction = async (id, status) => {
        try {
            await api.put(`/leaves/${id}`, { status });
            toast.success(`Leave request ${status} successfully`);
            fetchAllLeaves();
            if (selectedLeave?._id === id) setSelectedLeave(null);
        } catch (error) {
            console.error('Update Leave Error:', error);
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(`Mission update failed: ${errorMsg}`);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 font-inter">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Operational Absence Management</h1>
                <p className="text-sm text-slate-500 mt-1 italic">Review and authorize personnel leave protocols</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Awaiting Action', count: leaves.filter(l => l.status === 'pending').length, color: 'text-amber-500' },
                    { label: 'Authorized Today', count: leaves.filter(l => l.status === 'approved').length, color: 'text-emerald-500' },
                    { label: 'Protocol Denied', count: leaves.filter(l => l.status === 'rejected').length, color: 'text-rose-500' },
                    { label: 'Total Requests', count: leaves.length, color: 'text-slate-900' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <h4 className={`text-2xl font-black ${stat.color}`}>{stat.count}</h4>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-6">Staff Associate</th>
                                <th className="px-6 py-6">Leave Category</th>
                                <th className="px-6 py-6">Operational Window</th>
                                <th className="px-6 py-6 text-center">Protocol Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {leaves.map((leave) => (
                                <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <User size={14} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{leave.userId?.name || leave.userId?.username || 'Unknown User'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{leave.userId?.role || 'Staff'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-bold text-xs uppercase tracking-widest text-slate-500">{leave.type}</td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <Clock size={12} className="text-[#CE2626]" />
                                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end items-center gap-4">
                                            {leave.status !== 'pending' && (
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Reviewed By</p>
                                                    <p className="text-[10px] font-bold text-slate-600">{leave.reviewedBy?.name || leave.reviewedBy?.username || 'System'}</p>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setSelectedLeave(leave)}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                {leave.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleAction(leave._id, 'approved')}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(leave._id, 'rejected')}
                                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedLeave && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-black text-xs uppercase tracking-widest text-slate-900">Leave Rationalization Report</h3>
                            <button onClick={() => setSelectedLeave(null)} className="text-slate-400 hover:text-slate-900 transition-colors font-black">X</button>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Staff Member</p>
                                    <p className="text-sm font-bold text-slate-900">{selectedLeave.userId?.name || selectedLeave.userId?.username}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{selectedLeave.userId?.role}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Leave Category</p>
                                    <p className="text-sm font-bold text-[#CE2626] uppercase">{selectedLeave.type}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Windows Start</p>
                                    <p className="text-sm font-bold text-slate-600">{new Date(selectedLeave.fromDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Window Completion</p>
                                    <p className="text-sm font-bold text-slate-600">{new Date(selectedLeave.toDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Staff Rationalization (Reason)</p>
                                <div className="p-6 bg-slate-50 rounded-2xl text-xs font-medium text-slate-600 border border-slate-100 leading-relaxed italic">
                                    "{selectedLeave.reason}"
                                </div>
                            </div>

                            {selectedLeave.status !== 'pending' && (
                                <div className="pt-6 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization Audit</p>
                                    <p className="text-xs font-bold text-slate-900">Reviewed by: {selectedLeave.reviewedBy?.name || selectedLeave.reviewedBy?.username || 'System'}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{new Date(selectedLeave.reviewedAt).toLocaleString()}</p>
                                </div>
                            )}
                            
                            {selectedLeave.status === 'pending' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => handleAction(selectedLeave._id, 'approved')}
                                        className="flex-1 bg-emerald-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                    >
                                        Authorize Request
                                    </button>
                                    <button 
                                        onClick={() => handleAction(selectedLeave._id, 'rejected')}
                                        className="flex-1 bg-rose-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20"
                                    >
                                        Deny Request
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerLeaveRequests;
