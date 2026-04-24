import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    CheckCircle2, XCircle, Clock, 
    MoreHorizontal, Loader2, IndianRupee,
    Building2, Calendar, MapPin, 
    MessageSquare, Send, ShieldCheck,
    PlusCircle, User, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const CustomerApprovals = ({ userRole }) => {
    const [deals, setDeals] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState('');
    const [selectedDeal, setSelectedDeal] = useState(null);
    
    // Task Assignment State
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        taskType: 'delivery',
        deadline: ''
    });

    const fetchData = async () => {
        try {
            // Manager sees pending and admin_approved (for tasking)
            // Admin sees manager_review
            const statusFilter = userRole === 'Manager' ? 'pending,admin_approved' : 'manager_review';
            const { data } = await api.get(`/leads?status=customer&approvalStatus=${statusFilter}`);
            setDeals(data);

            if (userRole === 'Manager') {
                const { data: staffData } = await api.get('/users/staff');
                setStaff(staffData);
            }
        } catch (error) {
            toast.error('Strategic Queue synchronization failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        socket.on('leadUpdated', fetchData);
        return () => socket.off('leadUpdated');
    }, []);

    const handleAction = async (id, newStatus) => {
        try {
            const updateData = { approvalStatus: newStatus };
            if (userRole === 'Manager') {
                updateData.managerRemarks = remarks;
                if (newStatus === 'manager_review') updateData.sentToAdmin = true;
            } else {
                updateData.adminRemarks = remarks;
            }

            await api.put(`/leads/${id}/approve`, updateData);
            toast.success(`Protocol Transitioned: ${newStatus.toUpperCase()}`);
            setRemarks('');
            setSelectedDeal(null);
            fetchData();
        } catch (error) {
            toast.error('Authorization Protocol failure');
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', {
                ...taskData,
                leadId: selectedDeal._id
            });
            toast.success('Operational Directive Issued to Field Personnel');
            setShowTaskModal(false);
            setTaskData({ title: '', description: '', assignedTo: '', taskType: 'delivery', deadline: '' });
        } catch (error) {
            toast.error('Directive Transmission Failure');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#CE2626]" size={40} /></div>;

    const reviewDeals = deals.filter(d => d.approvalStatus !== 'admin_approved');
    const approvedDeals = deals.filter(d => d.approvalStatus === 'admin_approved');

    return (
        <div className="space-y-10 animate-in fade-in duration-500 font-inter">
            {/* Header Area */}
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#CE2626]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 text-center md:text-left">
                    <h1 className="text-3xl font-black tracking-tighter uppercase">{userRole} Operational Console</h1>
                    <p className="text-slate-400 font-bold mt-2 text-[10px] uppercase tracking-[0.4em] italic">Deal Verification & Tasking Portal</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="bg-white/5 px-8 py-4 rounded-2xl border border-white/10 backdrop-blur-sm text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Awaiting Review</p>
                        <p className="text-2xl font-black text-amber-500">{reviewDeals.length}</p>
                    </div>
                    {userRole === 'Manager' && (
                        <div className="bg-white/5 px-8 py-4 rounded-2xl border border-white/10 backdrop-blur-sm text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Ready for Tasking</p>
                            <p className="text-2xl font-black text-emerald-500">{approvedDeals.length}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Awaiting Review Section */}
            <div className="space-y-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-4">Strategic Review Queue</h2>
                <div className="grid grid-cols-1 gap-6">
                    {reviewDeals.map(deal => (
                        <DealCard 
                            key={deal._id} 
                            deal={deal} 
                            userRole={userRole} 
                            onAction={handleAction}
                            remarks={remarks}
                            setRemarks={setRemarks}
                            selectedDeal={selectedDeal}
                            setSelectedDeal={setSelectedDeal}
                        />
                    ))}
                    {reviewDeals.length === 0 && <EmptyState message="Review buffer cleared" />}
                </div>
            </div>

            {/* Ready for Tasking Section (Manager Only) */}
            {userRole === 'Manager' && (
                <div className="space-y-6 pb-20">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-4">Operational Tasking Buffer</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {approvedDeals.map(deal => (
                            <div key={deal._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><CheckCircle2 size={24}/></div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{deal.companyName}</h3>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{deal.projectName} • APPROVED</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10 bg-slate-50 px-8 py-4 rounded-2xl">
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Valuation</p>
                                        <p className="text-sm font-black text-slate-800 tracking-tight">₹{deal.budget?.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Payload</p>
                                        <p className="text-sm font-black text-slate-800 tracking-tight">{deal.requirement} Tons</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setSelectedDeal(deal); setShowTaskModal(true); }}
                                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <PlusCircle size={16} /> Issue Directive
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-10 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter italic">Operational Directive</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Target: {selectedDeal?.companyName}</p>
                            </div>
                            <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-white transition-all bg-white/5 p-2 rounded-xl"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAssignTask} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Directive Grade</label>
                                    <select 
                                        className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#CE2626]/10"
                                        value={taskData.taskType}
                                        onChange={(e) => setTaskData({...taskData, taskType: e.target.value})}
                                    >
                                        <option value="delivery">Delivery</option>
                                        <option value="verification">Verification</option>
                                        <option value="audit">Field Audit</option>
                                        <option value="general">General Registry</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Executor ID</label>
                                    <select 
                                        className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#CE2626]/10"
                                        required
                                        value={taskData.assignedTo}
                                        onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}
                                    >
                                        <option value="">Select Personnel</option>
                                        {staff.map(s => (
                                            <option key={s._id} value={s._id}>{s.name || s.username} ({s.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Directive Header</label>
                                <input 
                                    className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest outline-none"
                                    placeholder="e.g. 100 Tons TATA Supply"
                                    required
                                    value={taskData.title}
                                    onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Logistics Detail</label>
                                <textarea 
                                    className="w-full h-24 p-4 bg-slate-50 border-none rounded-xl text-xs font-bold resize-none outline-none"
                                    placeholder="Detailed fulfillment requirements..."
                                    value={taskData.description}
                                    onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fulfillment Deadline</label>
                                <input 
                                    type="date"
                                    className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest outline-none"
                                    required
                                    value={taskData.deadline}
                                    onChange={(e) => setTaskData({...taskData, deadline: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="w-full py-5 bg-[#CE2626] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                Commit Directive to Field
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const DealCard = ({ deal, userRole, onAction, remarks, setRemarks, selectedDeal, setSelectedDeal }) => (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col xl:flex-row hover:shadow-xl transition-all duration-300">
        <div className="p-10 xl:w-1/3 border-b xl:border-b-0 xl:border-r border-slate-50 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-lg">{deal.companyName[0]}</div>
                    <div>
                        <h3 className="font-black text-slate-900 uppercase tracking-tight truncate w-48">{deal.companyName}</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{deal.projectName}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-500">
                        <Building2 size={14} className="text-[#CE2626]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{deal.steelBrand} Supply</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                        <IndianRupee size={14} className="text-[#CE2626]" />
                        <span className="text-sm font-black text-slate-900 tracking-tight">{deal.budget?.toLocaleString()} Valuation</span>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</span>
                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-100">
                        {deal.approvalStatus}
                    </span>
                </div>
            </div>
        </div>

        <div className="p-10 xl:w-2/3 flex flex-col justify-between bg-slate-50/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Logistics Verification</h4>
                    <div className="space-y-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grow">
                        <div className="flex items-start gap-3">
                            <MapPin size={14} className="mt-1 text-slate-300 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{deal.deliveryAddress}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={14} className="text-slate-300" />
                            <p className="text-[10px] font-black text-slate-900 uppercase">{deal.deliveryDate ? new Date(deal.deliveryDate).toDateString() : 'Pending'}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Decision Remarks</h4>
                    <textarea 
                        className="w-full h-28 p-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-[#CE2626]/5 transition-all resize-none outline-none"
                        placeholder="Add authorization remarks here..."
                        value={selectedDeal?._id === deal._id ? remarks : ''}
                        onFocus={() => setSelectedDeal(deal)}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
                {userRole === 'Manager' ? (
                    <button 
                        onClick={() => onAction(deal._id, 'manager_review')}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={16} /> Verify & Pass to Admin
                    </button>
                ) : (
                    <button 
                        onClick={() => onAction(deal._id, 'admin_approved')}
                        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={16} /> Final Protocol Approval
                    </button>
                )}
                <button 
                    onClick={() => onAction(deal._id, 'rejected')}
                    className="px-8 py-4 bg-white text-rose-600 border-2 border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                >
                    <XCircle size={16} /> Reject Deal
                </button>
            </div>
        </div>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="bg-white p-24 rounded-[4rem] text-center border-4 border-dashed border-slate-50 flex flex-col items-center">
        <ShieldCheck className="text-slate-200 mb-6" size={64} />
        <h2 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">{message}</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-[0.3em]">No deals awaiting authorization in the current buffer</p>
    </div>
);

export default CustomerApprovals;
