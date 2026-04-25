import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Plus, Users, Mail, Phone, Calendar, 
    X, Building2, Star, TrendingUp, Search,
    Shield, ChevronRight, Award
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Department → color palette map
const DEPT_COLORS = {
    Construction: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
    Logistics:    { bg: 'bg-blue-50',  text: 'text-blue-700',  dot: 'bg-blue-400'  },
    Sales:        { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    HR:           { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
    default:      { bg: 'bg-slate-100', text: 'text-slate-600',  dot: 'bg-slate-400' },
};

const getDeptColor = (dept) => DEPT_COLORS[dept] || DEPT_COLORS.default;

// Performance bar gradient logic
const getPerfColor = (val) => {
    if (val >= 70) return 'from-emerald-400 to-green-500';
    if (val >= 40) return 'from-amber-400 to-yellow-500';
    return 'from-rose-400 to-red-500';
};

const getPerfLabel = (val) => {
    if (val >= 70) return { label: 'Excellent', color: 'text-emerald-600' };
    if (val >= 40) return { label: 'Average',   color: 'text-amber-600'   };
    return                { label: 'Needs Improvement', color: 'text-rose-600' };
};

// Avatar component
const Avatar = ({ name, image, size = 'md', online }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';
    const sizeClass = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-16 h-16 text-lg';
    const dotSize  = size === 'lg' ? 'w-4 h-4 bottom-1 right-1' : 'w-3.5 h-3.5 bottom-0.5 right-0.5';

    // Generate a consistent gradient from the name
    const hue = name ? name.charCodeAt(0) * 17 % 360 : 200;

    return (
        <div className="relative inline-block">
            {image ? (
                <div className={`${sizeClass} rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-white`}>
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-contain rounded-full"
                    />
                </div>
            ) : (
                <div
                    className={`${sizeClass} rounded-full ring-4 ring-white shadow-lg flex items-center justify-center font-black text-white select-none`}
                    style={{ background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${(hue+40)%360},80%,45%))` }}
                >
                    {initials}
                </div>
            )}
            {online !== undefined && (
                <span className={`absolute ${dotSize} rounded-full border-2 border-white shadow-sm ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            )}
        </div>
    );
};

// ─── Employee Card ────────────────────────────────────────────────────────────
const EmployeeCard = ({ employee, onClick }) => {
    const perf = employee.performanceRating ? employee.performanceRating * 20 : Math.floor(30 + (employee.name.charCodeAt(0) % 7) * 10);
    const dept = getDeptColor(employee.department);
    const perfLabel = getPerfLabel(perf);
    const isOnline = employee.isOnline ?? (employee.name.charCodeAt(0) % 3 !== 0); // demo fallback

    return (
        <div
            onClick={() => onClick(employee)}
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl border border-slate-100/80 hover:border-slate-200 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015]"
        >
            {/* Top gradient accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getPerfColor(perf)} opacity-80 rounded-t-2xl`} />

            {/* Card Body */}
            <div className="p-6">
                {/* Header row */}
                <div className="flex items-start justify-between mb-5">
                    <Avatar name={employee.name} image={employee.profileImage} online={isOnline} />
                    <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${dept.bg} ${dept.text}`}>
                            {employee.role}
                        </span>
                        <span className={`text-[10px] font-medium ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {isOnline ? '● Online' : '○ Offline'}
                        </span>
                    </div>
                </div>

                {/* Name & Dept */}
                <div className="mb-5">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-[#161E54] transition-colors">
                        {employee.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${dept.dot}`} />
                        <span className={`text-sm font-semibold ${dept.text}`}>{employee.department || 'Unassigned'}</span>
                    </div>
                </div>

                {/* Contact info */}
                <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs font-medium">
                        <Mail size={13} className="shrink-0 text-slate-400" />
                        <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs font-medium">
                        <Phone size={13} className="shrink-0 text-slate-400" />
                        <span>{employee.contact || employee.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs font-medium">
                        <Calendar size={13} className="shrink-0 text-slate-400" />
                        <span>Joined {new Date(employee.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* Performance bar */}
                <div className="border-t border-slate-50 pt-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Performance</span>
                        <span className={`text-[10px] font-black ${perfLabel.color}`}>{perf}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${getPerfColor(perf)} transition-all duration-700`}
                            style={{ width: `${perf}%` }}
                        />
                    </div>
                    <p className={`text-[9px] font-bold mt-1 ${perfLabel.color}`}>{perfLabel.label}</p>
                </div>
            </div>

            {/* Hover CTA footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 -mt-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">View Full Profile</span>
                <ChevronRight size={14} className="text-slate-400" />
            </div>
        </div>
    );
};

// ─── Profile Modal ────────────────────────────────────────────────────────────
const ProfileModal = ({ employee, onClose }) => {
    if (!employee) return null;
    const perf = employee.performanceRating ? employee.performanceRating * 20 : Math.floor(30 + (employee.name.charCodeAt(0) % 7) * 10);
    const perfLabel = getPerfLabel(perf);
    const dept = getDeptColor(employee.department);
    const isOnline = employee.isOnline ?? (employee.name.charCodeAt(0) % 3 !== 0);
    const hue = employee.name ? employee.name.charCodeAt(0) * 17 % 360 : 200;

    return (
        <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header — gradient banner */}
                <div
                    className="relative h-32 flex items-end px-6 pb-4"
                    style={{ background: `linear-gradient(135deg, hsl(${hue},65%,40%), hsl(${(hue+50)%360},75%,30%))` }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all"
                    >
                        <X size={16} />
                    </button>
                    {/* Status pill */}
                    <span className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isOnline ? 'bg-emerald-400/30 text-emerald-100' : 'bg-slate-400/30 text-slate-200'}`}>
                        {isOnline ? '● Active Now' : '○ Offline'}
                    </span>
                </div>

                {/* Avatar overlapping the banner */}
                <div className="flex justify-center -mt-12 relative z-10">
                    <Avatar name={employee.name} image={employee.profileImage} size="lg" online={isOnline} />
                </div>

                {/* Info body */}
                <div className="px-8 pb-8 pt-4 text-center">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{employee.name}</h2>
                    <span className={`inline-block mt-1 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${dept.bg} ${dept.text}`}>
                        {employee.role}
                    </span>

                    {/* Detail grid */}
                    <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                        {[
                            { icon: <Building2 size={14}/>, label: 'Department', value: employee.department || 'N/A' },
                            { icon: <Mail size={14}/>,     label: 'Email',      value: employee.email },
                            { icon: <Phone size={14}/>,    label: 'Phone',      value: employee.contact || employee.phone || 'N/A' },
                            { icon: <Calendar size={14}/>, label: 'Joined',     value: new Date(employee.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                        ].map(({ icon, label, value }) => (
                            <div key={label} className="bg-slate-50 rounded-2xl p-3.5">
                                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                    {icon}
                                    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Performance section */}
                    <div className="mt-4 bg-slate-50 rounded-2xl p-4 text-left">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <TrendingUp size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Performance Score</span>
                            </div>
                            <span className={`text-sm font-black ${perfLabel.color}`}>{perf}% — {perfLabel.label}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${getPerfColor(perf)}`}
                                style={{ width: `${perf}%` }}
                            />
                        </div>
                        {/* Star rating */}
                        <div className="flex gap-1 mt-2.5">
                            {[1,2,3,4,5].map(s => (
                                <Star key={s} size={14} className={s <= Math.round(perf / 20) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-6 w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#161E54] active:scale-95 transition-all shadow-lg"
                    >
                        Close Profile
                    </button>
                </div>
            </div>
        </div>
    );
};


// ─── Main Page ────────────────────────────────────────────────────────────────
const EmployeesPage = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [credentials, setCredentials] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [formData, setFormData] = useState({
        name: '', email: '', department: '', role: 'Employee',
        phone: '', username: '', password: ''
    });

    const generateCredentials = () => {
        const base = formData.name.split(' ')[0].toLowerCase() || 'user';
        const random = Math.floor(1000 + Math.random() * 9000);
        setFormData({ ...formData, username: `${base}${random}`, password: Math.random().toString(36).slice(-8).toUpperCase() });
    };

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/employees');
            setEmployees(data);
        } catch (error) {
            toast.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/users', formData);
            setCredentials(data.credentials);
            toast.success('Authorized Onboarding Complete');
            setShowModal(false);
            setFormData({ name: '', email: '', department: '', role: 'Employee', phone: '', username: '', password: '' });
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Onboarding Failed');
        }
    };

    const departments = ['All', ...new Set(employees.map(e => e.department).filter(Boolean))];

    const filtered = employees.filter(e => {
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                            e.email.toLowerCase().includes(search.toLowerCase());
        const matchDept = deptFilter === 'All' || e.department === deptFilter;
        return matchSearch && matchDept;
    });

    return (
        <div className="space-y-6 md:space-y-8 pb-20">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Workforce Directory</h1>
                    <p className="text-slate-500 text-[10px] md:text-sm mt-1 italic font-medium">
                        Active Roster: <span className="font-bold text-[#CE2626]">{employees.length}</span> Personnel Authorized
                    </p>
                </div>
                {['Admin', 'HR', 'Manager'].includes(user?.role) && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full lg:w-auto bg-[#CE2626] text-white px-8 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-rose-500/20 hover:scale-105"
                    >
                        <Plus size={18} /> Enroll Employee
                    </button>
                )}
            </div>

            {/* Search + Filter bar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search identity or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-16 pr-8 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 shadow-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                    {departments.map(d => (
                        <button
                            key={d}
                            onClick={() => setDeptFilter(d)}
                            className={`px-5 py-3.5 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                deptFilter === d
                                ? 'bg-slate-900 text-white shadow-xl'
                                : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {[
                    { label: 'Total Staff', value: employees.length, icon: <Users size={18}/>, color: 'text-indigo-600 bg-indigo-50' },
                    { label: 'Online Now',  value: employees.filter(e => e.isOnline ?? (e.name?.charCodeAt(0) % 3 !== 0)).length, icon: <Award size={18}/>, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Departments', value: departments.length - 1, icon: <Building2 size={18}/>, color: 'text-amber-600 bg-amber-50' },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 shadow-sm p-6 flex items-center gap-5 transition-all hover:shadow-md">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} flex-shrink-0 shadow-inner`}>{icon}</div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{value}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Employee Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-white rounded-3xl border border-slate-50 shadow-sm p-8 animate-pulse">
                            <div className="flex gap-6 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                                <div className="flex-1 space-y-3 pt-2">
                                    <div className="h-5 bg-slate-100 rounded-full w-3/4" />
                                    <div className="h-3 bg-slate-50 rounded-full w-1/2" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-3 bg-slate-50 rounded-full" />
                                <div className="h-3 bg-slate-50 rounded-full w-4/5" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(employee => (
                        <EmployeeCard key={employee._id} employee={employee} onClick={setSelectedEmployee} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-50">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <Users size={48} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Zero Personnel Detected</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Adjust filtration parameters or initiate enrollment</p>
                </div>
            )}

            {/* ── Profile Modal ── */}
            <ProfileModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />

            {/* ── Credentials Success Modal ── */}
            {credentials && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[210] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="bg-[#10B981] p-12 text-center text-white relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-xl relative z-10">
                                <Shield size={32} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic relative z-10">Access Granted</h2>
                            <p className="text-[9px] text-white/60 font-black uppercase tracking-widest mt-2 relative z-10">System Identity Generated Successfully</p>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="bg-slate-50 p-8 rounded-[2rem] space-y-6 border border-slate-100">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Portal Username</label>
                                    <p className="text-xl font-black text-slate-900 select-all tracking-tight">{credentials.username}</p>
                                </div>
                                <div className="space-y-2 border-t border-slate-200 pt-6">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Initial Key</label>
                                    <p className="text-xl font-black text-[#CE2626] select-all tracking-tight">{credentials.password}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCredentials(null)}
                                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all italic"
                            >
                                Confirm & Sync
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Employee Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
                        <div className="bg-slate-900 p-8 md:p-10 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-black uppercase tracking-widest text-sm md:text-base italic">Personnel Ingestion</h2>
                                <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Tier-1 HR Clearance Protocol Active</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 bg-white/5 rounded-xl hover:text-[#CE2626] transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6 md:space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                {[
                                    { label: 'Full Legal Identity', key: 'name', type: 'text', placeholder: 'e.g. MARCUS AURELIUS', required: true, span: true },
                                    { label: 'Corporate Email',   key: 'email', type: 'email', placeholder: 'e.g. MARCUS@SMT.COM', required: true },
                                    { label: 'Communication Link', key: 'phone', type: 'text', placeholder: 'e.g. +91 98xxx xxxxx', required: false },
                                    { label: 'Assigned ID',   key: 'username', type: 'text', placeholder: 'e.g. MAURELIUS', required: true },
                                    { label: 'Security Key',  key: 'password', type: 'text', placeholder: 'MIN 6 CHARS', required: true },
                                ].map(field => (
                                    <div key={field.key} className={`space-y-2 ${field.span ? 'md:col-span-2' : ''}`}>
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">{field.label}</label>
                                        <input
                                            type={field.type} required={field.required} placeholder={field.placeholder}
                                            className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                            value={formData[field.key]}
                                            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Departmental Unit</label>
                                    <select className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required>
                                        <option value="">Select Dept</option>
                                        <option>Construction</option>
                                        <option>Logistics</option>
                                        <option>Sales</option>
                                        <option>HR</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Operational Role</label>
                                    <select className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                        <option value="Employee">Employee</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Sales">Sales Representative</option>
                                        <option value="HR">HR Administrator</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 pt-2">
                                    <button type="button" onClick={generateCredentials} className="w-full p-5 bg-slate-900 text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all italic border border-white/5 shadow-xl">
                                        ⚡ Kinetic Credential Logic
                                    </button>
                                </div>
                            </div>
                            <button className="w-full py-5 md:py-6 bg-[#CE2626] text-white rounded-[2rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl shadow-rose-500/30 hover:scale-[1.02] transition-all mt-4">
                                Authorize Ingestion
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>

    );
};

export default EmployeesPage;

