import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Plus, Search, Filter, Package, 
    Trash2, AlertTriangle, 
    MapPin, Layers, History, 
    Info, X, Calendar, 
    ArrowUpCircle, ArrowDownCircle,
    TrendingUp, Activity, User, Ruler
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const socket = io('https://mtbms.onrender.com');

const MaterialsPage = () => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // Modals
    const [showInitModal, setShowInitModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [history, setHistory] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '', category: 'Steel', quantity: '', 
        location: '', threshold: 50
    });

    const fetchMaterials = async () => {
        try {
            const { data } = await api.get('/materials');
            setMaterials(data);
        } catch (error) { toast.error('Inventory Sync Failure'); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchMaterials();
        socket.on('materialCreated', fetchMaterials);
        socket.on('materialUpdated', fetchMaterials);
        socket.on('materialDeleted', fetchMaterials);
        socket.on('stockHistoryCreated', (newHistory) => {
            if (selectedMaterial && newHistory.materialId === selectedMaterial._id) {
                fetchHistory(selectedMaterial._id);
            }
        });

        return () => {
            socket.off('materialCreated');
            socket.off('materialUpdated');
            socket.off('materialDeleted');
            socket.off('stockHistoryCreated');
        };
    }, [selectedMaterial]);

    const fetchHistory = async (id) => {
        try {
            const { data } = await api.get(`/materials/history/${id}`);
            setHistory(data);
        } catch (error) { toast.error('History Retrieval Error'); }
    };

    const handleOpenHistory = (material) => {
        setSelectedMaterial(material);
        fetchHistory(material._id);
        setShowHistoryModal(true);
    };

    const handleInitResource = async (e) => {
        e.preventDefault();
        try {
            await api.post('/materials', formData);
            toast.success('Inventory Record Initialized');
            setShowInitModal(false);
            setFormData({ name: '', category: 'Steel', quantity: '', location: '', threshold: 50 });
            fetchMaterials();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Initialization failed');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'IN STOCK': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'LOW STOCK': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'CRITICAL': return 'bg-rose-50 text-[#CE2626] border-rose-100';
            case 'OUT OF STOCK': return 'bg-slate-900 text-white border-slate-800';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    const filteredMaterials = materials.filter(m => {
        const matchesSearch = (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (m.location || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = statusFilter === 'All' || m.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: materials.length,
        inStock: materials.filter(m => m.status === 'IN STOCK').length,
        lowStock: materials.filter(m => m.status === 'LOW STOCK').length,
        critical: materials.filter(m => m.status === 'CRITICAL').length
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-[#CE2626]">SYNCING INVENTORY...</div>;

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 font-inter pb-20">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 text-center lg:text-left">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Inventory Dashboard</h1>
                    <p className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] mt-1 italic">Real-time Stock Monitoring & Movement Tracking</p>
                </div>
                <div className="relative z-10 flex justify-center lg:justify-end gap-4 w-full lg:w-auto">
                    <button 
                        onClick={() => setShowInitModal(true)}
                        className="w-full lg:w-auto px-6 md:px-8 py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                        <Plus size={16} /> Initialize Stock
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Asset Classes', val: stats.total, icon: <Package size={20} />, color: 'text-blue-600 bg-blue-50' },
                    { label: 'In Stock', val: stats.inStock, icon: <TrendingUp size={20} />, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Low Alert', val: stats.lowStock, icon: <AlertTriangle size={20} />, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Critical Alert', val: stats.critical, icon: <Activity size={20} />, color: 'text-[#CE2626] bg-rose-50' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center gap-4 md:gap-8 relative overflow-hidden group">
                        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${s.color} relative z-10 group-hover:scale-110 transition-transform flex-shrink-0`}>{s.icon}</div>
                        <div className="relative z-10">
                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-none tracking-tighter">{s.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Hub */}
            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6 md:gap-8 items-center justify-between">
                <div className="relative flex-1 w-full lg:max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter stock or location..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-4 md:py-5 bg-slate-50 border-none rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                    />
                </div>
                <div className="flex flex-wrap justify-center gap-2 w-full lg:w-auto">
                    {['All', 'IN STOCK', 'LOW STOCK', 'CRITICAL'].map(f => (
                        <button 
                            key={f} onClick={() => setStatusFilter(f)}
                            className={`flex-1 sm:flex-none px-4 md:px-6 py-3 md:py-4 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === f ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stock Registry */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto table-container">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-100">
                            <tr>
                                <th className="px-6 md:px-12 py-6 md:py-10">Material Identity</th>
                                <th className="px-4 md:px-8 py-6 md:py-10 text-center">Net Vol (MT)</th>
                                <th className="px-4 md:px-8 py-6 md:py-10">Stock Health</th>
                                <th className="px-4 md:px-8 py-6 md:py-10 italic">Location</th>
                                <th className="px-6 md:px-12 py-6 md:py-10 text-right">Records</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredMaterials.map((item) => (
                                <tr key={item._id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => handleOpenHistory(item)}>
                                    <td className="px-6 md:px-12 py-6 md:py-10">
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 text-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center font-black text-lg md:text-xl shadow-lg group-hover:rotate-6 transition-transform flex-shrink-0">
                                                {item.name ? item.name[0] : 'S'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm md:text-base uppercase tracking-tight italic">{item.name || 'Unnamed Asset'}</p>
                                                <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{item.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-6 md:py-10 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter leading-none">{item.quantity}</p>
                                            <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase mt-2 tracking-widest italic">Metric Tons</p>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-6 md:py-10">
                                        <div className={`px-4 md:px-5 py-2 rounded-xl border text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] inline-flex items-center gap-2 ${getStatusColor(item.status)} whitespace-nowrap`}>
                                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${item.status === 'LOW STOCK' || item.status === 'CRITICAL' ? 'bg-current' : 'hidden'}`}></div>
                                            {item.status}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-6 md:py-10">
                                        <div className="flex items-center gap-2 md:gap-3 text-slate-400">
                                            <MapPin size={12} className="text-[#CE2626] flex-shrink-0"/>
                                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{item.location || 'Central Depot'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-12 py-6 md:py-10 text-right">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleOpenHistory(item); }}
                                            className="p-3 md:p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl md:rounded-2xl transition-all hover:bg-white hover:shadow-md"
                                        >
                                            <History size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals Implementations */}
            {showInitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 my-auto">
                        <div className="p-6 md:p-10 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg md:text-xl font-black uppercase italic tracking-widest text-[#CE2626]">Initialize Asset</h3>
                                <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Management Protocol v5.0</p>
                            </div>
                            <button onClick={() => setShowInitModal(false)} className="p-2 md:p-3 bg-white/10 rounded-xl hover:text-[#CE2626] transition-all"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleInitResource} className="p-6 md:p-12 space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Material Designation</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" placeholder="e.g. GRADE-A STEEL"/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Opening Stock (MT)</label>
                                    <input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black outline-none focus:ring-4 focus:ring-slate-900/5" placeholder="0.00"/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Alert Floor (MT)</label>
                                    <input type="number" required value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black outline-none focus:ring-4 focus:ring-slate-900/5" placeholder="50"/>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Warehouse Grid</label>
                                    <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase outline-none focus:ring-4 focus:ring-slate-900/5" placeholder="e.g. DEPOT-7 NORTH"/>
                                </div>
                            </div>
                            <button className="w-full py-5 md:py-6 bg-[#CE2626] text-white rounded-xl md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.5em] italic shadow-2xl shadow-rose-500/30 hover:scale-[1.02] transition-all mt-2">
                                Authorize Global Registry
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showHistoryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-6 md:p-12 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic truncate max-w-[300px]">{selectedMaterial?.name}</h2>
                                    <span className={`w-fit px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(selectedMaterial?.status)}`}>
                                        {selectedMaterial?.status}
                                    </span>
                                </div>
                                <p className="text-[8px] md:text-[9px] font-black text-slate-400 tracking-[0.5em] uppercase mt-2 italic flex items-center gap-2">
                                    <Activity size={10} className="text-[#CE2626]"/> Kinetic Log
                                </p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="p-3 md:p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl md:rounded-2xl transition-all hover:rotate-90"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                                <div className="p-6 md:p-8 bg-slate-900 text-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp size={64}/></div>
                                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em] relative z-10">Current Inventory</p>
                                    <h4 className="text-3xl md:text-4xl font-black italic relative z-10">{selectedMaterial?.quantity} <span className="text-xs uppercase NOT-italic opacity-40 ml-1">MT</span></h4>
                                </div>
                                <div className="p-6 md:p-8 bg-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-inner">
                                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Safety Threshold</p>
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-xl md:text-2xl font-black text-slate-900 italic">{selectedMaterial?.threshold} <span className="text-[10px] NOT-italic opacity-30">MT</span></h4>
                                        <Ruler size={14} className="text-[#CE2626] opacity-30"/>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-[0.5em] border-l-4 border-[#CE2626] pl-4 md:pl-6 italic">Movement Archive</h4>
                                <div className="relative space-y-6 pt-4">
                                    {history.map((log, i) => (
                                        <div key={log._id} className="relative pl-10 md:pl-12 group">
                                            {i !== history.length - 1 && <div className="absolute left-[15px] md:left-[19px] top-10 bottom-[-24px] w-[2px] bg-slate-50" />}
                                            
                                            <div className="absolute left-0 top-0">
                                                <div className={`w-8 h-8 md:w-10 md:h-10 ${log.type === 'ADD' ? 'bg-emerald-500' : 'bg-rose-600'} text-white rounded-xl md:rounded-2xl flex items-center justify-center border-4 border-white shadow-xl transition-all`}>
                                                    {log.type === 'ADD' ? <ArrowUpCircle size={16}/> : <ArrowDownCircle size={16}/>}
                                                </div>
                                            </div>

                                            <div className="bg-slate-50/40 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-50/50 group-hover:bg-slate-50 transition-all">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center flex-wrap gap-4">
                                                        <p className={`text-xl md:text-2xl font-black italic tracking-tighter ${log.type === 'ADD' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {log.type === 'ADD' ? '+' : '-'}{Math.abs(log.quantity)} <span className="text-[9px] uppercase NOT-italic opacity-40">MT</span>
                                                        </p>
                                                        <div className={`px-2 py-1 rounded-lg text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] ${log.type === 'ADD' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                            {log.type === 'ADD' ? 'Replenishment' : 'Extraction'}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                        <div className="flex items-center gap-3">
                                                            <User size={12} className="text-slate-300"/>
                                                            <p className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase italic truncate">{log.performedBy?.name}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Calendar size={12} className="text-slate-300"/>
                                                            <p className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase italic whitespace-nowrap">{new Date(log.date).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialsPage;
