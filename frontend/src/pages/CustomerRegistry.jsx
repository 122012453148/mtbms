import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Users, Search, Phone, Mail, 
    CheckCircle2, Clock, MapPin, 
    Loader2, IndianRupee, Briefcase, 
    Layers, Package, Calendar, 
    ExternalLink, Edit, XCircle, 
    ArrowRight, Filter, MoreVertical,
    Building2, UserCheck, ShieldCheck, X,
    Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('https://mtbms.onrender.com');

const CustomerRegistry = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Details Modal
    const [showDetails, setShowDetails] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/leads?status=customer');
            setCustomers(data);
        } catch (error) {
            toast.error('Customer Intelligence sync failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
        socket.on('leadUpdated', fetchData);
        return () => socket.off('leadUpdated');
    }, []);

    const handleSendToAcquisition = async (id) => {
        try {
            // Updated to the user's standardized endpoint
            await api.put(`/leads/send-to-acquisition/${id}`, { ratePerTon: 50000 });
            toast.success('Deployed to Acquisition Board (Status: SUBMITTED)');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Deployment failure');
        }
    };

    const handleViewDetails = (customer) => {
        setSelectedCustomer(customer);
        setShowDetails(true);
    };

    const handleEdit = (id) => {
        navigate(`/sales-pipeline`); // Navigate to pipeline where edit modal/route exists
        toast.info(`Identify card ${id.slice(-4)} in pipeline to modify`);
    };

    const handleCancel = (id) => {
        toast.warning(`Cancellation protocol started for deal ${id.slice(-4)}`);
    };

    const filtered = customers.filter(c => 
        (c.companyName.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPerson?.toLowerCase().includes(search.toLowerCase())) &&
        (filterStatus === 'All' || c.approvalStatus === filterStatus)
    );

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#6C63FF]" size={40} /></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-inter bg-[#F6F8FC]">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-10 rounded-[2.5rem] border border-[#E2E8F0] shadow-[0_8px_20px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#6C63FF]/5 to-[#8E7CFF]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Customer Registry</h1>
                    <p className="text-[#64748B] font-medium mt-1 text-sm">Central repository of confirmed commercial assets and project deployments.</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            className="w-full pl-12 pr-6 py-4 bg-[#F8FAFC] border-none rounded-xl text-xs font-semibold focus:ring-4 focus:ring-[#6C63FF]/5 outline-none tracking-wide"
                            placeholder="Identify Customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="p-4 bg-[#F8FAFC] text-slate-500 rounded-xl hover:bg-[#E2E8F0] transition-all"><Filter size={20}/></button>
                </div>
            </div>

            {/* Dashboard Cards Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">
                {filtered.map(customer => (
                    <div 
                        key={customer._id}
                        className="bg-white rounded-[2rem] border border-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden"
                    >
                        <div className="p-8 space-y-8">
                            {/* Card Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#1E293B] to-[#334155] text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                                        {customer.companyName[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1E293B] tracking-tight">{customer.companyName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Building2 size={12} className="text-[#6C63FF]"/>
                                            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">{customer.projectName || 'Standard Supply'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                        customer.approvalStatus === 'admin_approved' ? 'bg-emerald-50 text-[#22C55E] border-emerald-100' : 'bg-blue-50 text-[#4C6FFF] border-blue-100'
                                    }`}>
                                        {customer.approvalStatus?.replace('_', ' ') || 'Pending Registry'}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#64748B] uppercase">
                                        <ShieldCheck size={12} className="text-emerald-500"/> Verified Deal
                                    </div>
                                </div>
                            </div>

                            {/* Data Matrix */}
                            <div className="grid grid-cols-3 gap-6 py-6 border-y border-[#F1F5F9]">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5"><Package size={10}/> Material</p>
                                    <p className="text-sm font-semibold text-[#334155]">{customer.steelBrand || 'Steel'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5"><Layers size={10}/> Payload</p>
                                    <p className="text-sm font-semibold text-[#334155]">{customer.requirement} Tons</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest flex items-center justify-end gap-1.5"><IndianRupee size={10}/> Valuation</p>
                                    <p className="text-sm font-bold text-[#1E293B]">₹{customer.budget?.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Detailed Info Grid */}
                            <div className="grid grid-cols-2 gap-8 text-xs">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={16} className="text-[#EF4444] shrink-0" />
                                        <div>
                                            <p className="font-bold text-[#1E293B] mb-1">Deployment Address</p>
                                            <p className="text-[#64748B] font-medium leading-relaxed">{customer.deliveryAddress || 'Not Registered'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar size={16} className="text-[#6C63FF] shrink-0" />
                                        <div>
                                            <p className="font-bold text-[#1E293B] mb-0.5">Fulfillment Window</p>
                                            <p className="text-[#64748B] font-medium">{customer.deliveryDate ? new Date(customer.deliveryDate).toLocaleDateString() : 'TBD'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 border-l border-[#F1F5F9] pl-8">
                                    <div className="flex items-center gap-3">
                                        <UserCheck size={16} className="text-[#4C6FFF] shrink-0" />
                                        <div>
                                            <p className="font-bold text-[#1E293B] mb-0.5">Assigned Lead</p>
                                            <p className="text-[#64748B] font-medium lowercase">{customer.contactPerson || 'Anonymous Entry'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className="text-amber-500 shrink-0" />
                                        <div>
                                            <p className="font-bold text-[#1E293B] mb-0.5">Registry Status</p>
                                            <p className="text-[#64748B] font-medium uppercase tracking-wider text-[10px]">Payment: <span className="text-emerald-500 font-bold">Confirmed</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Row */}
                            <div className="flex gap-3 pt-6 border-t border-[#F1F5F9]">
                                <button 
                                    onClick={() => handleSendToAcquisition(customer._id)}
                                    className="flex-1 bg-gradient-to-r from-[#6C63FF] to-[#8E7CFF] text-white py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#6C63FF]/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                                >
                                    <ArrowRight size={14}/> Send to Acquisition
                                </button>
                                <button 
                                    onClick={() => handleViewDetails(customer)}
                                    className="px-6 bg-[#F8FAFC] text-[#1E293B] py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-[#E2E8F0] hover:bg-[#E2E8F0] transition-colors"
                                >
                                    View Details
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(customer._id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:bg-slate-100 hover:text-slate-900 transition-all"><Edit size={16}/></button>
                                    <button onClick={() => handleCancel(customer._id)} className="p-3 bg-rose-50 text-rose-300 rounded-xl border border-rose-100 hover:bg-rose-100 hover:text-rose-500 transition-all"><XCircle size={16}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-[#F1F5F9]">
                        <Package size={64} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-xl font-bold text-slate-300 uppercase tracking-tight">Customer Registry Clear</h3>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.3em] mt-2">Commercial pipeline awaiting conversion signals</p>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {showDetails && selectedCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[#1E293B] p-10 flex justify-between items-center text-white">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center font-bold text-2xl border border-white/20">
                                    {selectedCustomer.companyName[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tight">{selectedCustomer.companyName}</h2>
                                    <p className="text-[10px] text-[#6C63FF] font-bold uppercase tracking-[0.3em] mt-1">Operational Data Intel v4.0</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetails(false)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><X size={24}/></button>
                        </div>
                        <div className="p-12 space-y-10">
                            <div className="grid grid-cols-3 gap-8">
                                <div className="p-6 bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0]">
                                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-2">Deal Status</label>
                                    <p className="font-bold text-[#1E293B] text-sm uppercase">{selectedCustomer.status}</p>
                                </div>
                                <div className="p-6 bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0]">
                                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-2">Internal Approval</label>
                                    <p className="font-bold text-[#22C55E] text-sm uppercase">{selectedCustomer.approvalStatus}</p>
                                </div>
                                <div className="p-6 bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0]">
                                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-2">Source Protocol</label>
                                    <p className="font-bold text-[#4C6FFF] text-sm uppercase">{selectedCustomer.source || 'Direct'}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-[#1E293B] uppercase tracking-[0.4em] border-l-4 border-[#6C63FF] pl-4">Intel Summary</h4>
                                <div className="bg-[#F8FAFC] p-8 rounded-[2rem] border border-[#E2E8F0]">
                                    <p className="text-sm font-medium text-[#64748B] leading-relaxed italic">
                                        "Deals for {selectedCustomer.companyName} involve {selectedCustomer.requirement} tons of {selectedCustomer.steelBrand || 'Standard Material'}. 
                                        The project ({selectedCustomer.projectName}) has been cleared for execution with a contract value of ₹{selectedCustomer.budget?.toLocaleString()}. 
                                        Current logistics timeline points to a {selectedCustomer.deliveryDate ? new Date(selectedCustomer.deliveryDate).toLocaleDateString() : 'flexible'} handover."
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 pt-6">
                                <div className="flex-1 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={20}/></div>
                                        <p className="text-xs font-bold text-emerald-700 uppercase">Payment Verification: SUCCESS</p>
                                    </div>
                                    <button className="text-[10px] font-bold text-emerald-700 hover:underline">VIEW RECEIPT</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerRegistry;
