import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Phone, Mail, MessageSquare, 
    ArrowRight, Trash2, Loader2, 
    Search, Filter, ChevronDown,
    IndianRupee, Building2, User,
    X, CheckCircle2, AlertTriangle,
    Edit3
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const ProspectMatrix = () => {
    const [prospects, setProspects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [notes, setNotes] = useState('');

    const subStatusOptions = ['Interested', 'Negotiation', 'Quotation Sent', 'Follow-up Pending'];

    const fetchData = async () => {
        try {
            const { data } = await api.get('/leads?status=prospect');
            setProspects(data);
        } catch (error) {
            toast.error('Strategic Intelligence sync failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        socket.on('leadUpdated', (updatedLead) => {
            if (updatedLead.status === 'prospect') {
                setProspects(prev => prev.map(p => p._id === updatedLead._id ? updatedLead : p));
            } else {
                setProspects(prev => prev.filter(p => p._id !== updatedLead._id));
            }
        });

        socket.on('leadDeleted', (id) => {
            setProspects(prev => prev.filter(p => p._id !== id));
        });

        return () => {
            socket.off('leadUpdated');
            socket.off('leadDeleted');
        };
    }, []);

    const handleUpdateSubStatus = async (id, subStatus) => {
        try {
            await api.put(`/leads/${id}`, { subStatus });
            toast.success(`Pipeline Phase: ${subStatus}`);
        } catch (error) {
            toast.error('Sync failure');
        }
    };

    const handleConvertToQualified = async (id) => {
        if (!window.confirm('Graduate this identity to Qualified Phase?')) return;
        try {
            await api.put(`/leads/${id}`, { status: 'qualified' });
            toast.success('Identity Optimized: Qualified');
        } catch (error) {
            toast.error('Handshake error during graduation');
        }
    };

    const handleMarkAsLost = async (id) => {
        if (!window.confirm('Terminate this prospect identity?')) return;
        try {
            await api.put(`/leads/${id}`, { status: 'lost' });
            toast.error('Identity Terminated: Lost Lead');
        } catch (error) {
            toast.error('Termination protocol failure');
        }
    };

    const handleSaveNotes = async () => {
        try {
            await api.put(`/leads/${selectedLead._id}`, { notes });
            toast.success('Rationalization Logic Stored');
            setShowNotesModal(false);
        } catch (error) {
            toast.error('Storage failure');
        }
    };

    const filteredProspects = prospects.filter(p => 
        p.companyName.toLowerCase().includes(search.toLowerCase()) ||
        p.contactPerson?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#CE2626]" size={40} /></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 font-inter">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Prospect Matrix</h1>
                    <p className="text-slate-500 font-black mt-2 text-[10px] uppercase tracking-[0.4em] italic">Active Commercial Engagements • Verified Identities</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase focus:ring-4 focus:ring-slate-900/5 outline-none w-64 tracking-widest"
                            placeholder="Identify Prospect..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 gap-6 pb-20">
                {filteredProspects.map(prospect => (
                    <div 
                        key={prospect._id}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 group overflow-hidden"
                    >
                        <div className="flex flex-col lg:flex-row">
                            {/* Identity Pillar */}
                            <div className="p-8 lg:w-1/4 flex border-b lg:border-b-0 lg:border-r border-slate-50 bg-slate-50/20">
                                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shrink-0 group-hover:scale-110 transition-transform">
                                    {prospect.companyName[0]}
                                </div>
                                <div className="ml-5 overflow-hidden">
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate leading-tight mb-1">{prospect.companyName}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                                        <User size={10} />
                                        {prospect.contactPerson || 'Anonymous'}
                                    </div>
                                    <span className="inline-block mt-3 px-3 py-1 bg-white border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500">
                                        {prospect.source}
                                    </span>
                                </div>
                            </div>

                            {/* Metrics Pillar */}
                            <div className="p-8 lg:w-1/2 grid grid-cols-3 gap-6 items-center border-b lg:border-b-0 lg:border-r border-slate-50">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Operational Load</p>
                                    <p className="text-sm font-black text-slate-900">{prospect.requirement} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tons</span></p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Pipeline Value</p>
                                    <p className="text-sm font-black text-slate-900 flex items-center gap-1">
                                        <IndianRupee size={12} className="text-[#CE2626]" />
                                        {prospect.budget?.toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Commercial Phase</p>
                                    <select 
                                        value={prospect.subStatus}
                                        onChange={(e) => handleUpdateSubStatus(prospect._id, e.target.value)}
                                        className="w-full text-[9px] font-black text-[#CE2626] bg-rose-50 border-none rounded-lg px-3 py-2 uppercase tracking-widest focus:ring-0 cursor-pointer"
                                    >
                                        {subStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Interface Pillar */}
                            <div className="p-8 lg:w-1/4 flex flex-wrap lg:flex-nowrap gap-3 items-center justify-end bg-slate-50/10">
                                <div className="flex gap-2">
                                    <button className="p-3 bg-white text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100" title="Audio Signal">
                                        <Phone size={14} />
                                    </button>
                                    <button className="p-3 bg-white text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100" title="E-Mail">
                                        <Mail size={14} />
                                    </button>
                                    <button 
                                        onClick={() => { setSelectedLead(prospect); setNotes(prospect.notes || ''); setShowNotesModal(true); }}
                                        className="p-3 bg-white text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100" 
                                        title="Intel"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                </div>
                                <div className="flex gap-2 w-full lg:w-auto">
                                    <button 
                                        onClick={() => handleConvertToQualified(prospect._id)}
                                        className="flex-1 lg:flex-none px-5 py-3.5 bg-[#CE2626] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        Qualify <ArrowRight size={12} />
                                    </button>
                                    <button 
                                        onClick={() => handleMarkAsLost(prospect._id)}
                                        className="p-3.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm grow-0 lg:grow-0" 
                                        title="Terminate"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProspects.length === 0 && (
                    <div className="bg-white p-24 rounded-[4rem] text-center border-4 border-dashed border-slate-50 flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 font-black scale-150 opacity-20">?</div>
                        <h2 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Zero Prospects Decrypted</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-[0.3em]">Commercial Radar Clean • No active prospects in range</p>
                    </div>
                )}
            </div>

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-10 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Strategic Intel Storage</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 italic">Prospect: {selectedLead?.companyName}</p>
                            </div>
                            <button onClick={() => setShowNotesModal(false)} className="text-slate-400 hover:text-white transition-all bg-white/5 p-2 rounded-xl"><X size={20} /></button>
                        </div>
                        <div className="p-12 space-y-8">
                            <textarea 
                                className="w-full h-48 p-8 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-slate-900/5 transition-all resize-none outline-none"
                                placeholder="Input strategic rationalization here..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                            <button 
                                onClick={handleSaveNotes}
                                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Update Central Registry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProspectMatrix;
