import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Plus, MoreHorizontal, User, 
    Phone, Mail, IndianRupee, 
    Loader2, Search, Filter, X,
    Building2, Target, Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { BASE_URL } from '../config';

const socket = io(BASE_URL);

const PipelineBoard = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const stages = [
        { id: 'lead', label: 'LEAD' },
        { id: 'prospect', label: 'PROSPECT' },
        { id: 'qualified', label: 'QUALIFIED' },
        { id: 'customer', label: 'CUSTOMER' }
    ];

    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        source: 'Website',
        requirement: '',
        budget: '',
        priority: 'Medium',
        notes: ''
    });

    const fetchData = async () => {
        try {
            const { data } = await api.get('/leads');
            setLeads(data);
        } catch (error) {
            toast.error('Pipeline synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 

        socket.on('leadCreated', (lead) => {
            setLeads(prev => [lead, ...prev]);
        });

        socket.on('leadUpdated', (updatedLead) => {
            setLeads(prev => prev.map(l => l._id === updatedLead._id ? updatedLead : l));
        });

        socket.on('leadDeleted', (deletedId) => {
            setLeads(prev => prev.filter(l => l._id !== deletedId));
        });

        return () => {
            socket.off('leadCreated');
            socket.off('leadUpdated');
            socket.off('leadDeleted');
        };
    }, []);

    const handleDragStart = (e, leadId) => {
        e.dataTransfer.setData('leadId', leadId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, newStatus) => {
        const leadId = e.dataTransfer.getData('leadId');
        try {
            // Optimistic Update
            setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
            
            await api.put(`/leads/${leadId}`, { status: newStatus });
            toast.success(`Pipeline Stage Updated: ${newStatus.toUpperCase()}`);
        } catch (error) {
            toast.error('Handshake error during migration');
            fetchData(); // Rollback on error
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post('/leads', formData);
            setLeads(prev => [data, ...prev]);
            toast.success('Lead Captured Successfully');
            setShowModal(false);
            setFormData({
                companyName: '',
                contactPerson: '',
                phone: '',
                email: '',
                source: 'Website',
                requirement: '',
                budget: '',
                priority: 'Medium',
                notes: ''
            });
        } catch (error) {
            toast.error('Lead Capture Protocol Failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#CE2626]" size={40} /></div>;

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-inter pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Lead Pipeline</h1>
                    <p className="text-[10px] md:text-sm text-slate-500 mt-1 italic font-medium uppercase tracking-widest">Accelerate commercial velocity via drag & drop</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] md:text-xs font-black normal-case tracking-widest focus:ring-4 focus:ring-slate-900/5 outline-none" placeholder="Search pipeline..." />
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="w-full sm:w-auto bg-[#CE2626] text-white px-8 py-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-rose-500/20"
                    >
                        <Plus size={18} /> Add Lead
                    </button>
                </div>
            </div>

            {/* Scrollable Column Container */}
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar h-[calc(100vh-280px)] min-h-[500px]">
                {stages.map(stage => (
                    <div 
                        key={stage.id} 
                        className="flex flex-col bg-slate-50/50 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 p-4 md:p-6 min-w-[280px] md:min-w-[320px] lg:flex-1"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        <div className="flex items-center justify-between mb-6 px-3">
                            <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic">{stage.label}</h3>
                            <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-xl shadow-lg">
                                {leads.filter(l => l.status === stage.id).length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar pr-1">
                            {leads.filter(l => l.status === stage.id).map(lead => (
                                <div 
                                    key={lead._id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead._id)}
                                    className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-[#CE2626] transition-all"></div>
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex-1 pr-4">
                                            <h4 className="text-sm md:text-base font-black text-slate-900 leading-tight uppercase group-hover:text-[#CE2626] transition-colors italic">{lead.companyName}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{lead.contactPerson || 'Anonymous'}</p>
                                        </div>
                                        <button className="p-1.5 text-slate-200 hover:text-slate-900 transition-all"><MoreHorizontal size={18} /></button>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-2 mb-8">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{lead.source}</span>
                                        {lead.priority && (
                                            <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                                                lead.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                                lead.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                                {lead.priority}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-900 font-black text-base md:text-lg tracking-tighter">
                                            <IndianRupee size={14} className="text-[#CE2626]" />
                                            {lead.budget?.toLocaleString()}
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-9 h-9 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-inner"><Phone size={14} /></div>
                                            <div className="w-9 h-9 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-inner"><Mail size={14} /></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {leads.filter(l => l.status === stage.id).length === 0 && (
                                <div className="h-40 flex flex-col items-center justify-center border-4 border-dashed border-slate-50 rounded-[2.5rem] p-8 opacity-20 group">
                                    <Target className="text-slate-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">No Leads</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Lead Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
                        <div className="bg-slate-900 p-8 md:p-12 flex justify-between items-center text-white relative">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#CE2626]/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">Capture Identity</h2>
                                <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 italic">Lead Ingestion Protocol</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="relative z-10 p-3 bg-white/5 rounded-2xl hover:text-[#CE2626] transition-all"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6 md:space-y-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                <div className="space-y-2 col-span-full">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Corporate Designation</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-[#CE2626]" size={18} />
                                        <input 
                                            required placeholder="e.g. GLOBAL LOGISTICS CORP"
                                            className="w-full pl-16 pr-6 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-900/5 transition-all"
                                            value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Liaison Profile</label>
                                    <input 
                                        placeholder="FULL NAME"
                                        className="w-full px-6 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Digital Comms Link</label>
                                    <input 
                                        type="email" placeholder="EMAIL ADDRESS"
                                        className="w-full px-6 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Frequency Signal</label>
                                    <input 
                                        placeholder="PHONE FREQUENCY"
                                        className="w-full px-6 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Intel Vector</label>
                                    <select 
                                        className="w-full px-6 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}
                                    >
                                        <option>Website</option>
                                        <option>Referral</option>
                                        <option>LinkedIn</option>
                                        <option>Direct</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Payload Required (T)</label>
                                    <input 
                                        type="number" placeholder="00.00"
                                        className="w-full px-6 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={formData.requirement} onChange={e => setFormData({...formData, requirement: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Estimated Valuation</label>
                                    <input 
                                        type="number" placeholder="₹00.00"
                                        className="w-full px-6 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Priority Matrix</label>
                                    <select 
                                        className="w-full px-6 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                                    >
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>

                                <div className="space-y-2 col-span-full">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Operational Context</label>
                                    <textarea 
                                        placeholder="Rationalize lead context..."
                                        className="w-full px-6 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight h-28 resize-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                disabled={submitting}
                                type="submit"
                                className="w-full py-5 md:py-6 bg-[#CE2626] text-white rounded-[2rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] italic shadow-2xl shadow-rose-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Commit to Pipeline'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PipelineBoard;
