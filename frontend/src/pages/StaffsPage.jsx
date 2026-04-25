import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Briefcase, ShieldCheck, 
    Search, Mail, Phone, Calendar, 
    X, Terminal, Activity,
    Download
} from 'lucide-react';
import { toast } from 'react-toastify';

// Robust image component with onError fallback
const StaffMemberImage = ({ src, name, className = "w-full h-full object-contain" }) => {
    const [error, setError] = useState(false);

    const getImageUrl = (imgPath) => {
        if (!imgPath) return null;
        if (imgPath.startsWith('http')) return imgPath;
        return `https://mtbms.onrender.com/${imgPath.replace(/\\/g, '/')}`;
    };

    const imageUrl = getImageUrl(src);

    if (error || !imageUrl) {
        return (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-black text-2xl uppercase italic">
                {name?.[0] || 'U'}
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={name}
            className={className}
            onError={() => setError(true)}
        />
    );
};

const StaffsPage = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/staff');
            setStaff(data);
        } catch (error) {
            toast.error('Directory sync failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const roles = ['All', 'Employee', 'Manager', 'HR', 'Sales'];

    const filteredStaff = staff.filter(s => {
        const matchesFilter = filter === 'All' || s.role === filter;
        const matchesSearch =
            s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-inter pb-20">

            {/* ── Command Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-950 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#CE2626] rounded-full blur-[150px] opacity-10 -mr-48 -mt-48 transition-all duration-700 group-hover:opacity-20 animate-pulse" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Staff Intelligence</h1>
                    <p className="text-slate-500 font-black mt-3 uppercase text-[10px] tracking-[0.6em] italic flex items-center gap-2">
                        <Terminal size={14} className="text-[#CE2626]" />
                        Neural Directory &amp; Personnel Access Control
                    </p>
                </div>
                <div className="relative z-10 flex w-full lg:w-auto">
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-6 text-xs font-bold normal-case tracking-widest outline-none focus:ring-4 focus:ring-[#CE2626]/20 transition-all w-full"
                        />
                    </div>
                </div>
            </div>

            {/* ── Role Filter Tabs ── */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
                {roles.map(r => (
                    <button
                        key={r}
                        onClick={() => setFilter(r)}
                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            filter === r
                                ? 'bg-slate-900 text-white shadow-xl scale-105'
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {/* ── Cards Grid ── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-[450px] bg-slate-100 animate-pulse rounded-[2.5rem]" />
                    ))}
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                    <p className="text-lg font-black uppercase italic tracking-widest">No personnel found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {filteredStaff.map(u => (
                        <div
                            key={u._id}
                            onClick={() => setSelectedUser(u)}
                            className="group relative h-[450px] p-[2px] bg-gradient-to-br from-[#CE2626] to-slate-950 rounded-[2.5rem] shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-4 hover:rotate-1"
                        >
                            <div className="bg-slate-950 h-full w-full rounded-[2.3rem] relative flex flex-col">

                                {/* Card Header – red gradient zone */}
                                <div className="min-h-[180px] bg-gradient-to-b from-[#CE2626] via-[#CE2626]/70 to-transparent relative p-6 flex justify-between items-start overflow-visible">
                                    {/* Logo badge */}
                                    <div>
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-black text-white text-sm italic border border-white/10">S</div>
                                    </div>

                                    {/* Profile Photo */}
                                    <div className="relative">
                                        <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-white/30 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2 flex-shrink-0 bg-white">
                                            <StaffMemberImage src={u.profileImage} name={u.name} />
                                        </div>
                                        {/* Online indicator */}
                                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse z-10" />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="flex-1 p-7 flex flex-col justify-end gap-4">
                                    <div>
                                        <p className="text-[9px] font-black text-[#CE2626] uppercase tracking-[0.35em] italic mb-1">Authorized Identity</p>
                                        <h3 className="text-[1.4rem] font-black text-white uppercase leading-tight tracking-wide drop-shadow">
                                            {u.name || u.username}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="px-2.5 py-0.5 bg-white/5 text-white/50 text-[8px] font-black uppercase tracking-widest rounded-md border border-white/5">
                                                {u.role}
                                            </span>
                                            <span className="px-2.5 py-0.5 bg-[#CE2626]/20 text-[#CE2626] text-[8px] font-black uppercase tracking-widest rounded-md border border-[#CE2626]/20">
                                                {u.department || 'Operations'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Barcode Footer */}
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                        <div>
                                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Employee ID</p>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{u.employeeId || 'NX-' + u._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 opacity-30 group-hover:opacity-70 transition-opacity">
                                            <div className="flex gap-[1.5px]">
                                                {[...Array(14)].map((_, i) => (
                                                    <div key={i} className={`bg-white ${i % 3 === 0 ? 'h-8 w-[1px]' : i % 3 === 1 ? 'h-6 w-[2px]' : 'h-7 w-[1.5px]'}`} />
                                                ))}
                                            </div>
                                            <p className="text-[6px] text-white font-mono tracking-wider">{u._id.slice(-10).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover sheen */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[2.3rem]" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Profile Detail Modal ── */}
            {selectedUser && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="bg-white rounded-[4rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-100"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Left – dark profile panel */}
                        <div className="md:w-2/5 bg-slate-950 p-12 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[#CE2626] opacity-5 blur-[100px]" />
                            <div className="relative z-10 w-44 h-44 rounded-full border-4 border-[#CE2626]/30 overflow-hidden shadow-2xl mb-8 flex-shrink-0 bg-white">
                                <StaffMemberImage
                                    src={selectedUser.profileImage}
                                    name={selectedUser.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-1 relative z-10">
                                {selectedUser.name}
                            </h2>
                            <p className="text-[#CE2626] font-black uppercase tracking-[0.4em] text-[10px] mb-8 relative z-10 italic">
                                {selectedUser.role}
                            </p>
                            <div className="flex gap-3 relative z-10">
                                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><Mail size={20} /></button>
                                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><Activity size={20} /></button>
                                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><Download size={20} /></button>
                            </div>
                        </div>

                        {/* Right – details panel */}
                        <div className="flex-1 p-12 space-y-8 overflow-y-auto">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-1 italic">Neural Dossier</p>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Personnel Record</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-2xl flex items-center justify-center transition-all"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Briefcase size={11} /> Department</p>
                                    <p className="text-sm font-black text-slate-900 uppercase italic bg-slate-50 p-4 rounded-xl">{selectedUser.department || 'Not Assigned'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={11} /> Employee ID</p>
                                    <p className="text-sm font-black text-slate-900 uppercase italic bg-slate-50 p-4 rounded-xl">{selectedUser.employeeId || 'Pending'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail size={11} /> Email</p>
                                    <p className="text-sm font-black text-slate-900 lowercase italic bg-slate-50 p-4 rounded-xl break-all">{selectedUser.email || '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Phone size={11} /> Phone</p>
                                    <p className="text-sm font-black text-slate-900 uppercase italic bg-slate-50 p-4 rounded-xl">{selectedUser.phone || 'Classified'}</p>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={11} /> Commission Date</p>
                                    <p className="text-sm font-black text-slate-900 uppercase italic bg-slate-50 p-4 rounded-xl">
                                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] italic shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Acknowledge Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffsPage;
