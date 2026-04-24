import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import { 
    Plus, Search, Filter, Loader2, 
    MoreHorizontal, CheckCircle2, XCircle, 
    Clock, Truck, ShieldCheck, UserPlus,
    IndianRupee, Building2, MapPin, Calendar,
    ChevronRight, ArrowRight, Eye, Edit3,
    Upload, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io('https://mtbms.onrender.com');

const COLUMNS = {
    'NEW': { id: 'NEW', title: 'New Deals', color: 'bg-slate-500' },
    'MANAGER VERIFIED': { id: 'MANAGER VERIFIED', title: 'Manager Verified', color: 'bg-blue-600' },
    'ADMIN APPROVED': { id: 'ADMIN APPROVED', title: 'Admin Approved', color: 'bg-purple-600' },
    'TASK ASSIGNED': { id: 'TASK ASSIGNED', title: 'Task Assigned', color: 'bg-amber-600' },
    'IN PROGRESS': { id: 'IN PROGRESS', title: 'In Progress', color: 'bg-rose-600' },
    'COMPLETED': { id: 'COMPLETED', title: 'Completed', color: 'bg-emerald-600' }
};

const columnOrder = ['NEW', 'MANAGER VERIFIED', 'ADMIN APPROVED', 'TASK ASSIGNED', 'IN PROGRESS', 'COMPLETED'];

const AcquisitionBoard = () => {
    const { user } = useAuth();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [staff, setStaff] = useState([]);
    
    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [auditData, setAuditData] = useState({ remarks: '', status: 'VERIFIED', images: [] });
    const [assignee, setAssignee] = useState('');

    const fetchData = async () => {
        try {
            const { data } = await api.get('/acquisition/all');
            setDeals(data);
            
            if (user.role === 'Manager' || user.role === 'Admin') {
                const { data: staffData } = await api.get('/users/staff');
                setStaff(staffData);
            }
        } catch (error) {
            toast.error('Strategic sync failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        socket.on('acquisitionDealCreated', fetchData);
        socket.on('acquisitionDealUpdated', fetchData);
        return () => {
            socket.off('acquisitionDealCreated');
            socket.off('acquisitionDealUpdated');
        };
    }, []);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Restriction: Only Manager/Admin can move beyond NEW
        // Sales can't move after sending
        // This is a simplified check, backend has strict role enforcement
        const newStatus = destination.droppableId;
        
        try {
            // Optimistic update
            const updatedDeals = [...deals];
            const dealIndex = updatedDeals.findIndex(d => d._id === draggableId);
            updatedDeals[dealIndex].status = newStatus;
            setDeals(updatedDeals);

            await api.put(`/acquisition/update-status/${draggableId}`, { status: newStatus });
            toast.success(`Deal Phase: ${newStatus}`);
        } catch (error) {
            toast.error('Handshake failed. Reverting protocol.');
            fetchData();
        }
    };

    const handleCreateDeal = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const dealData = Object.fromEntries(formData.entries());
        
        try {
            await api.post('/acquisition/create', dealData);
            toast.success('Commercial Directive Issued');
            setShowCreateModal(false);
        } catch (error) {
            toast.error('Deal initialization failure');
        }
    };

    const handleManagerReview = async (id, status) => {
        try {
            await api.put(`/acquisition/manager-approve/${id}`, { status });
            toast.success(`Verification Phase: ${status}`);
        } catch (error) {
            toast.error('Authentication gate error');
        }
    };

    const handleAdminApprove = async (id, status) => {
        try {
            await api.put(`/acquisition/admin-approve/${id}`, { status });
            toast.success(`Authorization Phase: ${status}`);
        } catch (error) {
            toast.error('Strategic clearance failure');
        }
    };

    const handleAssign = async () => {
        try {
            await api.put(`/acquisition/assign-task/${selectedDeal._id}`, { assignedEmployee: assignee });
            toast.success('Directive Assigned to Local Unit');
            setShowAssignModal(false);
            setAssignee('');
        } catch (error) {
            toast.error('Assignment protocol breach');
        }
    };

    const handleAudit = async () => {
        try {
            await api.put(`/acquisition/complete/${selectedDeal._id}`, {
                auditStatus: auditData.status,
                auditRemarks: auditData.remarks
            });
            toast.success('Reconnaissance Verified');
            setShowAuditModal(false);
        } catch (error) {
            toast.error('Audit synchronization failure');
        }
    };

    const filteredDeals = deals.filter(d => 
        d.companyName.toLowerCase().includes(search.toLowerCase()) ||
        d.customerName.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#CE2626]" size={40} /></div>;

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-8 animate-in fade-in duration-500 font-inter font-inter">
            {/* Control Center */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Acquisition Board</h1>
                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.4em] italic mt-1">Multi-Tier Fulfillment Command</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase focus:ring-4 focus:ring-slate-900/5 outline-none w-64 tracking-widest"
                            placeholder="Identify Target..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {(user.role === 'Sales' || user.role === 'Admin') && (
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#CE2626] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} /> Initiate Deal
                        </button>
                    )}
                </div>
            </div>

            {/* Kanban Matrix */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                    {columnOrder.map((columnId) => {
                        const column = COLUMNS[columnId];
                        const columnDeals = filteredDeals.filter(d => d.status === columnId);
                        
                        return (
                            <div key={columnId} className="w-80 shrink-0 flex flex-col">
                                <div className="mb-4 flex items-center justify-between px-2">
                                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                        {column.title}
                                    </h2>
                                    <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-lg">
                                        {columnDeals.length}
                                    </span>
                                </div>
                                <Droppable droppableId={columnId}>
                                    {(provided, snapshot) => (
                                        <div 
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 rounded-[2rem] p-4 transition-all duration-300 overflow-y-auto custom-scrollbar ${snapshot.isDraggingOver ? 'bg-slate-100/50' : 'bg-slate-50/50'}`}
                                        >
                                            {columnDeals.map((deal, index) => (
                                                <Draggable key={deal._id} draggableId={deal._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div 
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-4 group hover:shadow-xl hover:border-slate-300 transition-all ${snapshot.isDragging ? 'rotate-2 shadow-2xl scale-105 z-50' : ''}`}
                                                        >
                                                            <div className="space-y-4">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                                                                            {deal.companyName[0]}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight truncate w-32 leading-none">{deal.companyName}</h4>
                                                                            <p className="text-[8px] font-bold text-[#CE2626] uppercase mt-1 tracking-tighter truncate w-32 italic">{deal.projectName}</p>
                                                                        </div>
                                                                    </div>
                                                                    {user.role !== 'Employee' && (
                                                                        <button className="text-slate-300 hover:text-slate-900 transition-colors"><MoreHorizontal size={16} /></button>
                                                                    )}
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Payload</p>
                                                                        <p className="text-[10px] font-black text-slate-800 uppercase">{deal.quantity} T <span className="text-slate-400 font-bold">STEEL</span></p>
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Valuation</p>
                                                                        <p className="text-[10px] font-black text-slate-800 flex items-center gap-0.5">
                                                                            <IndianRupee size={10} className="text-[#CE2626]" />
                                                                            {deal.totalAmount?.toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap gap-2">
                                                                    {deal.status === 'NEW' && user.role === 'Manager' && (
                                                                        <div className="flex gap-1 w-full">
                                                                            <button onClick={() => handleManagerReview(deal._id, 'MANAGER VERIFIED')} className="flex-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">Verify</button>
                                                                            <button onClick={() => handleManagerReview(deal._id, 'REJECTED')} className="flex-1 bg-rose-50 text-rose-600 text-[8px] font-black uppercase py-2 rounded-lg hover:bg-rose-600 hover:text-white transition-all">Reject</button>
                                                                        </div>
                                                                    )}
                                                                    {deal.status === 'MANAGER VERIFIED' && user.role === 'Admin' && (
                                                                        <div className="flex gap-1 w-full">
                                                                            <button onClick={() => handleAdminApprove(deal._id, 'ADMIN APPROVED')} className="flex-1 bg-purple-50 text-purple-600 text-[8px] font-black uppercase py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-all">Approve</button>
                                                                            <button onClick={() => handleAdminApprove(deal._id, 'REJECTED')} className="flex-1 bg-rose-50 text-rose-600 text-[8px] font-black uppercase py-2 rounded-lg hover:bg-rose-600 hover:text-white transition-all">Reject</button>
                                                                        </div>
                                                                    )}
                                                                    {deal.status === 'ADMIN APPROVED' && user.role === 'Manager' && (
                                                                        <button onClick={() => { setSelectedDeal(deal); setShowAssignModal(true); }} className="w-full bg-amber-50 text-amber-600 text-[8px] font-black uppercase py-2 rounded-lg hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-1">
                                                                            <UserPlus size={10} /> Assign Unit
                                                                        </button>
                                                                    )}
                                                                    {(deal.status === 'TASK ASSIGNED' || deal.status === 'IN PROGRESS') && (user.role === 'Employee' || (user.id === deal.assignedEmployee?._id)) && (
                                                                        <button onClick={() => { setSelectedDeal(deal); setShowAuditModal(true); }} className="w-full bg-rose-50 text-rose-600 text-[8px] font-black uppercase py-2 rounded-lg hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1">
                                                                            <Truck size={10} /> Audit Directive
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-black text-slate-400">
                                                                            {deal.createdBy?.name ? deal.createdBy.name[0] : 'S'}
                                                                        </div>
                                                                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{deal.createdBy?.username || 'System'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-slate-300">
                                                                        <Calendar size={10} />
                                                                        <span className="text-[7px] font-bold">{new Date(deal.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {/* Create Deal Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-10 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Initiate Commercial Deal</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 italic">Protocol Alpha-7 Initializer</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white transition-all bg-white/5 p-2 rounded-xl"><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateDeal} className="p-12 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Identifier</label>
                                    <input name="customerName" required className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#CE2626]/10" placeholder="Identity name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity / Company</label>
                                    <input name="companyName" required className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#CE2626]/10" placeholder="Enterprise ID" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Specification</label>
                                    <input name="projectName" required className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#CE2626]/10" placeholder="Operation Target" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Payload Window (Date)</label>
                                    <input type="date" name="deliveryDate" required className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Load (Tons)</label>
                                    <input type="number" name="quantity" step="0.01" required className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest outline-none" placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate / Ton (₹)</label>
                                    <input type="number" name="ratePerTon" required className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest outline-none" placeholder="Rate in INR" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Location</label>
                                <textarea name="address" required className="w-full h-24 p-4 bg-slate-50 border-none rounded-xl text-xs font-bold resize-none outline-none" placeholder="Absolute coordinate details..." />
                            </div>
                            <button type="submit" className="w-full py-6 bg-[#CE2626] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                Execute Terminal Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl p-10 space-y-8 animate-in zoom-in-95">
                        <div className="text-center">
                            <h2 className="text-xl font-black uppercase tracking-tighter">Operational Assignment</h2>
                            <p className="text-[9px] text-slate-400 font-black uppercase mt-1">Target Deal: {selectedDeal?.companyName}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Local Unit (Employee)</label>
                            <select 
                                className="w-full p-5 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                            >
                                <option value="">Select Personnel</option>
                                {staff.map(s => <option key={s._id} value={s._id}>{s.name || s.username} ({s.role})</option>)}
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowAssignModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[9px] font-black uppercase">Abort</button>
                            <button onClick={handleAssign} className="flex-1 py-4 bg-[#CE2626] text-white rounded-2xl text-[9px] font-black uppercase shadow-lg shadow-rose-500/20">Assign Unit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Modal */}
            {showAuditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-md overflow-hidden shadow-2xl p-10 space-y-8 animate-in zoom-in-95">
                        <div className="text-center">
                            <h2 className="text-xl font-black uppercase tracking-tighter italic">Strategic Audit</h2>
                            <p className="text-[9px] text-slate-400 font-black uppercase mt-1">Payload: {selectedDeal?.projectName}</p>
                        </div>
                        <div className="space-y-6">
                            <div className="flex gap-2">
                                <button onClick={() => setAuditData({...auditData, status: 'VERIFIED'})} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase transition-all ${auditData.status === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Verified</button>
                                <button onClick={() => setAuditData({...auditData, status: 'FAILED'})} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase transition-all ${auditData.status === 'FAILED' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Failed</button>
                            </div>
                            <textarea 
                                className="w-full h-32 p-6 bg-slate-50 border-none rounded-3xl text-sm font-bold resize-none outline-none"
                                placeholder="Input reconnaissance remarks..."
                                value={auditData.remarks}
                                onChange={(e) => setAuditData({...auditData, remarks: e.target.value})}
                            />
                            <div className="flex items-center justify-center border-4 border-dashed border-slate-50 rounded-3xl p-8 cursor-pointer hover:bg-slate-50 transition-all">
                                <div className="text-center">
                                    <ImageIcon className="mx-auto text-slate-200" size={32} />
                                    <p className="text-[9px] font-black text-slate-300 uppercase mt-2 tracking-widest italic">Signal Imagery Capture</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowAuditModal(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[2rem] text-[9px] font-black uppercase">Abort</button>
                            <button onClick={handleAudit} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-[9px] font-black uppercase shadow-xl">Commit Audit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcquisitionBoard;
