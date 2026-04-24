import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
    TrendingUp, Package, IndianRupee, Plus, X,
    Download, Building2, BarChart3, Filter, RefreshCw,
    ChevronUp, ChevronDown, Star, Calendar, Layers
} from 'lucide-react';
import { io } from 'socket.io-client';

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtNum = (n) => new Intl.NumberFormat('en-IN').format(n);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
const MiniBarChart = ({ data }) => {
    if (!data || data.length === 0) return (
        <div className="h-40 flex items-center justify-center text-slate-400 text-xs italic">No monthly data yet</div>
    );
    const max = Math.max(...data.map(d => d.revenue), 1);
    return (
        <div className="flex items-end gap-2 h-40 px-2">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 group relative">
                    <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all duration-500 group-hover:from-indigo-500 group-hover:to-purple-400 cursor-default"
                        style={{ height: `${(d.revenue / max) * 120}px`, minHeight: '4px' }}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {fmt(d.revenue)}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold">{MONTH_NAMES[(d._id?.month || 1) - 1]}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, trend }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-start justify-between hover:shadow-md transition-all">
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black ${color || 'text-slate-900'} leading-none`}>{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1.5 font-medium">{sub}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color ? color.replace('text-','bg-').replace('600','50').replace('700','50') : 'bg-indigo-50'}`}>
                {icon}
            </div>
            {trend !== undefined && (
                <span className={`text-[10px] font-black flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trend >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {Math.abs(trend)}%
                </span>
            )}
        </div>
    </div>
);

// ─── Add Revenue Modal ────────────────────────────────────────────────────────
const AddRevenueModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({
        companyName: '', projectName: '', material: 'Steel',
        quantity: '', rate: '', date: new Date().toISOString().split('T')[0], notes: '', unit: 'ton'
    });
    const [submitting, setSubmitting] = useState(false);

    const total = form.quantity && form.rate
        ? parseFloat(form.quantity) * parseFloat(form.rate)
        : 0;

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post('/revenue', { ...form, totalAmount: total });
            toast.success(`₹${fmtNum(data.totalAmount)} sale recorded!`);
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add sale');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#161E54] to-indigo-700 p-7 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">Log Steel Sale</h2>
                        <p className="text-indigo-300 text-xs font-medium mt-0.5">Stock will auto-deduct on submit</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-7 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Company Name */}
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name *</label>
                            <input
                                required value={form.companyName} onChange={e => set('companyName', e.target.value)}
                                placeholder="ABC Constructions"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>

                        {/* Project Name */}
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name *</label>
                            <input
                                required value={form.projectName} onChange={e => set('projectName', e.target.value)}
                                placeholder="Bridge Project Phase 2"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>

                        {/* Material */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</label>
                            <input
                                value={form.material} onChange={e => set('material', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>

                        {/* Unit */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</label>
                            <select value={form.unit} onChange={e => set('unit', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border-none focus:outline-none">
                                <option>ton</option>
                                <option>kg</option>
                                <option>unit</option>
                                <option>piece</option>
                            </select>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity *</label>
                            <input
                                required type="number" min="0.01" step="0.01"
                                value={form.quantity} onChange={e => set('quantity', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>

                        {/* Rate */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate per Unit (₹) *</label>
                            <input
                                required type="number" min="0.01" step="0.01"
                                value={form.rate} onChange={e => set('rate', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>

                        {/* Total (readonly) */}
                        <div className="col-span-2 bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-between border border-indigo-100">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Auto-Calculated Total</span>
                            <span className="text-xl font-black text-indigo-700">{fmt(total)}</span>
                        </div>

                        {/* Date */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale Date</label>
                            <input
                                type="date" value={form.date} onChange={e => set('date', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border-none focus:outline-none"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                            <input
                                value={form.notes} onChange={e => set('notes', e.target.value)}
                                placeholder="Optional remarks..."
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border-none focus:outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={submitting}
                        className="w-full py-4 bg-gradient-to-r from-[#161E54] to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Recording Sale...' : '✓ Confirm & Deduct Stock'}
                    </button>
                </form>
            </div>
        </div>
    );
};


// ─── Main Revenue Page ────────────────────────────────────────────────────────
const RevenuePage = ({ isAdmin = false }) => {
    const [summary, setSummary] = useState({ totalRevenue: 0, totalQtySold: 0, steelStock: 0, companyWise: [], monthly: [] });
    const [records, setRecords] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterCompany, setFilterCompany] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [hrUsers, setHrUsers] = useState([]);
    const [budgetForm, setBudgetForm] = useState({ hrId: '', amount: '', notes: '', month: MONTH_NAMES[new Date().getMonth()], year: new Date().getFullYear() });
    const socketRef = useRef(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterCompany) params.company = filterCompany;
            if (filterFrom)    params.from = filterFrom;
            if (filterTo)      params.to = filterTo;

            const [sumRes, recRes, staffRes] = await Promise.all([
                api.get('/revenue/summary'),
                api.get('/revenue', { params }),
                isAdmin ? api.get('/users/staff') : Promise.resolve({ data: [] })
            ]);
            setSummary(sumRes.data);
            setRecords(recRes.data);
            if (isAdmin) {
                setHrUsers(staffRes.data.filter(u => u.role === 'HR'));
            }
        } catch (err) {
            toast.error('Failed to load revenue data');
        } finally {
            setLoading(false);
        }
    }, [filterCompany, filterFrom, filterTo, isAdmin]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Socket.io real-time
    useEffect(() => {
        socketRef.current = io('https://mtbms.onrender.com', { transports: ['websocket'] });
        socketRef.current.on('revenueAdded', () => fetchAll());
        socketRef.current.on('budgetAllocated', () => fetchAll());
        return () => socketRef.current?.disconnect();
    }, [fetchAll]);

    const handleAllocateBudget = async (e) => {
        e.preventDefault();
        try {
            await api.post('/salary/allocate', budgetForm);
            toast.success('Budget sent to HR');
            setShowBudgetModal(false);
            setBudgetForm({ hrId: '', amount: '', notes: '', month: MONTH_NAMES[new Date().getMonth()], year: new Date().getFullYear() });
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Allocation failed');
        }
    };

    // CSV Export
    const exportCSV = () => {
        const rows = [
            ['Date', 'Company', 'Project', 'Material', 'Qty', 'Unit', 'Rate', 'Total', 'Manager'],
            ...records.map(r => [
                new Date(r.date).toLocaleDateString('en-IN'),
                r.companyName, r.projectName, r.material,
                r.quantity, r.unit || 'ton', r.rate, r.totalAmount,
                r.managerId?.name || '-'
            ])
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `Revenue_Export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported!');
    };

    const topCustomer = summary.companyWise[0];

    return (
        <div className="space-y-8 font-inter">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                        Revenue Intelligence
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 italic">
                        {isAdmin ? 'Enterprise-wide steel sales tracking & profit analysis' : 'Log sales, track stock, monitor performance'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchAll} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm">
                        <RefreshCw size={16} />
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={14} /> Export CSV
                    </button>
                    {isAdmin ? (
                         <button onClick={() => setShowBudgetModal(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-slate-900/20">
                            <IndianRupee size={16} /> Allocate Budget
                        </button>
                    ) : (
                        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#161E54] to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-500/20">
                            <Plus size={16} /> Add Revenue
                        </button>
                    )}
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    icon={<IndianRupee size={20} className="text-indigo-600" />}
                    label="Total Revenue"
                    value={fmt(summary.totalRevenue)}
                    color="text-indigo-700"
                    sub={`${records.length} transactions`}
                />
                <StatCard
                    icon={<Layers size={20} className="text-emerald-600" />}
                    label="Steel Sold"
                    value={`${fmtNum(summary.totalQtySold)} ton`}
                    color="text-emerald-700"
                    sub="Total quantity moved"
                />
                <StatCard
                    icon={<Package size={20} className="text-amber-600" />}
                    label="Stock Remaining"
                    value={fmtNum(summary.steelStock)}
                    color={summary.steelStock < 20 ? 'text-rose-600' : 'text-amber-700'}
                    sub={summary.steelStock < 20 ? '⚠ Low Stock Alert' : 'Units available'}
                />
                <StatCard
                    icon={<Star size={20} className="text-purple-600" />}
                    label="Top Customer"
                    value={topCustomer?._id || '—'}
                    color="text-purple-700"
                    sub={topCustomer ? fmt(topCustomer.totalRevenue) : 'No data yet'}
                />
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Monthly Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Monthly Revenue</h2>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Last 12 months performance</p>
                        </div>
                        <BarChart3 size={18} className="text-slate-300" />
                    </div>
                    <MiniBarChart data={summary.monthly} />
                </div>

                {/* Company-wise leaderboard */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Top Clients</h2>
                        <Building2 size={16} className="text-slate-300" />
                    </div>
                    <div className="space-y-3">
                        {summary.companyWise.length === 0 ? (
                            <p className="text-center text-slate-400 text-xs italic py-8">No client data yet</p>
                        ) : summary.companyWise.slice(0, 5).map((c, i) => {
                            const pct = summary.totalRevenue > 0 ? (c.totalRevenue / summary.totalRevenue) * 100 : 0;
                            const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                            return (
                                <div key={c._id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-5 h-5 rounded-full text-white text-[9px] font-black flex items-center justify-center ${colors[i]}`}>{i+1}</span>
                                            <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{c._id}</span>
                                        </div>
                                        <span className="text-xs font-black text-slate-600">{fmt(c.totalRevenue)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                                        <div className={`${colors[i]} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex items-center gap-2 text-slate-400 shrink-0">
                        <Filter size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
                    </div>
                    <input
                        type="text" placeholder="Filter by company..."
                        value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium border-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <div className="flex gap-2">
                        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
                            className="px-3 py-2.5 bg-slate-50 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
                            className="px-3 py-2.5 bg-slate-50 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <button onClick={() => { setFilterCompany(''); setFilterFrom(''); setFilterTo(''); }}
                            className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Transactions Table ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Sales Ledger</h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{records.length} records</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Material</th>
                                <th className="px-6 py-4">Qty</th>
                                <th className="px-6 py-4">Rate</th>
                                <th className="px-6 py-4">Total</th>
                                {isAdmin && <th className="px-6 py-4">Manager</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(isAdmin ? 8 : 7)].map((_, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-3 bg-slate-100 rounded-full w-20" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 8 : 7} className="px-6 py-16 text-center text-slate-400 text-xs italic font-bold">
                                        No sales recorded yet. {!isAdmin && 'Click "Add Revenue" to log the first sale.'}
                                    </td>
                                </tr>
                            ) : records.map(r => (
                                <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900 uppercase tracking-tight text-xs">{r.companyName}</td>
                                    <td className="px-6 py-4 text-slate-600 text-xs italic">{r.projectName}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[9px] font-black uppercase">{r.material}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700">{fmtNum(r.quantity)} {r.unit || 'ton'}</td>
                                    <td className="px-6 py-4 text-slate-600">{fmt(r.rate)}</td>
                                    <td className="px-6 py-4 font-black text-emerald-700">{fmt(r.totalAmount)}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-slate-500 text-xs italic">{r.managerId?.name || '—'}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Company-wise summary footer */}
                {records.length > 0 && (
                    <div className="border-t border-slate-100 p-6 bg-slate-50">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Company-Wise Summary</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="text-left pb-2">Company</th>
                                        <th className="text-right pb-2">Steel Sold</th>
                                        <th className="text-right pb-2">Transactions</th>
                                        <th className="text-right pb-2">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {summary.companyWise.map(c => (
                                        <tr key={c._id}>
                                            <td className="py-2 font-bold text-slate-800">{c._id}</td>
                                            <td className="py-2 text-right text-slate-600">{fmtNum(c.totalQty)} ton</td>
                                            <td className="py-2 text-right text-slate-500">{c.deals}</td>
                                            <td className="py-2 text-right font-black text-indigo-700">{fmt(c.totalRevenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-slate-200">
                                        <td className="pt-2 font-black text-slate-900 uppercase text-[10px] tracking-wider">TOTAL</td>
                                        <td className="pt-2 text-right font-black text-slate-700">{fmtNum(summary.totalQtySold)} ton</td>
                                        <td className="pt-2 text-right font-black text-slate-500">{records.length}</td>
                                        <td className="pt-2 text-right font-black text-emerald-700 text-base">{fmt(summary.totalRevenue)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Revenue Modal */}
            {showModal && <AddRevenueModal onClose={() => setShowModal(false)} onSuccess={fetchAll} />}

            {/* Allocate Budget Modal */}
            {showBudgetModal && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowBudgetModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-slate-900 p-7 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tight italic text-[#CE2626]">CapEx Authorization</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Budget Allocation for Payroll</p>
                            </div>
                            <button onClick={() => setShowBudgetModal(false)} className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleAllocateBudget} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Strategic HR Personnel</label>
                                <select 
                                    required className="w-full px-4 py-3 bg-slate-50 rounded-xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-[#CE2626]/20"
                                    value={budgetForm.hrId} onChange={e => setBudgetForm({...budgetForm, hrId: e.target.value})}
                                >
                                    <option value="">Select Authorized HR</option>
                                    {hrUsers.map(u => <option key={u._id} value={u._id}>{u.name || u.username}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Budget Amount (₹)</label>
                                <input 
                                    type="number" required className="w-full px-4 py-3 bg-slate-50 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-[#CE2626]/20"
                                    value={budgetForm.amount} onChange={e => setBudgetForm({...budgetForm, amount: e.target.value})}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Strategic Notes</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-[#CE2626]/20 h-24 resize-none"
                                    value={budgetForm.notes} onChange={e => setBudgetForm({...budgetForm, notes: e.target.value})}
                                    placeholder="Allocation remarks..."
                                />
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 italic">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Target Period</p>
                                <p className="text-xs font-black text-slate-700">{budgetForm.month} {budgetForm.year}</p>
                            </div>
                            <button className="w-full py-4 bg-[#CE2626] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] italic shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                                AUTHORIZE BUDGET TRANSFER
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenuePage;
