import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Phone, Mail, MessageSquare, 
    ArrowRight, Trash2, Loader2, 
    Search, Filter, IndianRupee, 
    Building2, User, X, CheckCircle2, 
    Send, ArrowLeft, Star, Calendar, 
    MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const QualifiedMatrix = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            const { data } = await api.get('/leads?status=qualified');
            setLeads(data);
        } catch (error) {
            toast.error('Strategic Intelligence sync failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        socket.on('leadUpdated', fetchData);
        socket.on('leadDeleted', fetchData);
        return () => {
            socket.off('leadUpdated');
            socket.off('leadDeleted');
        };
    }, []);

    const handleAction = async (id, status) => {
        try {
            await api.put(`/leads/${id}`, { status });
            toast.success(`Identity Optimized: ${status.toUpperCase()}`);
            fetchData();
        } catch (error) {
            toast.error('Handshake error during graduation');
        }
    };

    const handleSendForAcquisition = async (id) => {
        try {
            // We can prompt for rate or use default from existing lead data if available
            await api.put(`/leads/${id}/acquisition`, { ratePerTon: 50000 }); // Example rate
            toast.success('Project Deployed to Acquisition Command');
            fetchData();
        } catch (error) {
            toast.error('Deployment protocol failure');
        }
    };

    const getPriority = (lead) => {
        if (lead.budget > 1000000) return { label: 'High', color: 'text-rose-500 bg-rose-50' };
        if (lead.budget > 500000) return { label: 'Medium', color: 'text-amber-500 bg-amber-50' };
        return { label: 'Low', color: 'text-emerald-500 bg-emerald-50' };
    };

    const filtered = leads.filter(l => 
        l.companyName.toLowerCase().includes(search.toLowerCase()) ||
        l.contactPerson?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#CE2626]" size={40} /></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 font-inter">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Qualified Hub</h1>
                    <p className="text-slate-500 font-black mt-2 text-[10px] uppercase tracking-[0.4em] italic">Validated Commercial Identities • Ready for Handshake</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase focus:ring-4 focus:ring-slate-900/5 outline-none w-64 tracking-widest"
                            placeholder="Identify Lead..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Qualified Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                {filtered.map(lead => {
                    const priority = getPriority(lead);
                    return (
                        <div key={lead._id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                            <div className="p-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center font-black text-xl shadow-xl">
                                            {lead.companyName[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{lead.companyName}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 lowercase italic">Contact: {lead.contactPerson}</p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${priority.color}`}>
                                        {priority.label} Priority
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <IndianRupee size={12} className="text-[#CE2626]"/>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Est. Valuation</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-800">₹{lead.budget?.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Star size={12} className="text-amber-500" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Conversion probability</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-800">85%</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Building2 size={12}/>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Payload Window</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-800">{lead.requirement} Tons Steel</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar size={12}/>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Registry Age</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-800">{new Date(lead.updatedAt).toDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 items-center justify-between bg-white border border-slate-100 p-6 rounded-[2rem]">
                                    <div className="flex gap-2">
                                        <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Phone size={14}/></button>
                                        <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Mail size={14}/></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleAction(lead._id, 'prospect')}
                                            className="px-5 py-3 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200"
                                        >
                                            <ArrowLeft size={12} /> Demote
                                        </button>
                                        <button 
                                            onClick={() => handleAction(lead._id, 'customer')}
                                            className="px-5 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <CheckCircle2 size={12} /> Convert
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleSendForAcquisition(lead._id)}
                                    className="w-full py-5 bg-[#CE2626] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Send size={16} /> Deploy to Acquisition Command
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="lg:col-span-2 bg-white p-24 rounded-[4rem] text-center border-4 border-dashed border-slate-50 flex flex-col items-center">
                        <Star className="text-slate-200 mb-6" size={64} />
                        <h2 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Qualified Buffer Clear</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-[0.3em]">Commercial Radar Clean • No leads ready for conversion</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QualifiedMatrix;
