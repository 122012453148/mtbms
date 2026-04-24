import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    TrendingUp, TrendingDown, DollarSign, 
    PieChart, ArrowUpRight, ArrowDownRight,
    Loader2, Download, Filter, Plus, UserCheck, Banknote, Calendar, X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const FinancePage = () => {
    const [finance, setFinance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [hrUsers, setHrUsers] = useState([]);

    const [budgetForm, setBudgetForm] = useState({
        hrId: '', amount: '', month: 'April', year: 2026
    });

    const [formData, setFormData] = useState({
        type: 'Income', category: '', amount: '', description: ''
    });

    const fetchData = async () => {
        try {
            const [fRes, hrRes] = await Promise.all([
                api.get('/finance/stats'),
                api.get('/users/staff')
            ]);
            setFinance(fRes.data);
            setHrUsers(hrRes.data.filter(u => u.role === 'HR'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        socket.on('transactionAdded', fetchData);
        socket.on('budgetAllocated', fetchData);
        return () => {
            socket.off('transactionAdded');
            socket.off('budgetAllocated');
        };
    }, []);

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/transaction', formData);
            toast.success('Fiscal Record Authorized');
            setShowModal(false);
            setFormData({ type: 'Income', category: '', amount: '', description: '' });
            fetchData();
        } catch (error) { toast.error('Transaction Failed'); }
    };

    const handleAllocateBudget = async (e) => {
        e.preventDefault();
        try {
            await api.post('/salary/allocate', budgetForm);
            toast.success('CapEx Authorized to HR');
            setShowBudgetModal(false);
            setBudgetForm({ hrId: '', amount: '', month: 'April', year: 2026 });
            fetchData();
        } catch (error) { toast.error(error.response?.data?.message || 'Allocation Failed'); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-[#CE2626]">SYNCING FISCAL DATA...</div>;

    const stats = [
        { title: 'Gross Revenue', value: finance?.totalIncome, icon: <TrendingUp />, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+12.5%' },
        { title: 'Total Expenses', value: finance?.totalExpense, icon: <TrendingDown />, color: 'text-rose-500', bg: 'bg-rose-50', trend: '+4.2%' },
        { title: 'Net Profit', value: finance?.netProfit, icon: <DollarSign />, color: 'text-[#CE2626]', bg: 'bg-rose-50', trend: '+8.1%' },
        { title: 'Payroll Ceiling', value: finance?.payrollBudget || 'Locked', icon: <Banknote />, color: 'text-blue-500', bg: 'bg-blue-50', trend: 'Active' }
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-inter pb-20">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Fiscal Intelligence</h1>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mt-1 italic">Real-time revenue, expenditure, and CapEx analytics</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <button onClick={() => setShowBudgetModal(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3">
                        <Banknote size={16} /> Allocate HR Budget
                    </button>
                    <button onClick={() => setShowModal(true)} className="bg-[#CE2626] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:-translate-y-1 transition-all flex items-center gap-3">
                        <Plus size={16} /> Add Transaction
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>
                                {s.icon}
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">{s.trend}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3 italic">{s.title}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                            {typeof s.value === 'number' ? `₹${s.value.toLocaleString()}` : s.value}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] italic border-l-4 border-[#CE2626] pl-6">Revenue Velocity (Q2 Forecast)</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#CE2626]"></div><span className="text-[9px] font-black text-slate-400 uppercase">Revenue</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300"></div><span className="text-[9px] font-black text-slate-400 uppercase">Expense</span></div>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { name: 'Apr', rev: 4000000, exp: 2400000 },
                                { name: 'May', rev: 5200000, exp: 3200000 },
                                { name: 'Jun', rev: 4800000, exp: 2800000 },
                                { name: 'Jul', rev: 6100000, exp: 3500000 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#CE2626" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#CE2626" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }} />
                                <Area type="monotone" dataKey="rev" stroke="#CE2626" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="exp" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
                    <div className="absolute bottom-0 right-0 p-10 opacity-5"><PieChart size={180}/></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Kinetic Cashflow</h3>
                            <Filter className="text-slate-700" size={16} />
                        </div>
                        <div className="space-y-8">
                            {finance?.transactionHistory?.slice(0, 5).map((t, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-pointer border-b border-white/5 pb-5 last:border-0 hover:translate-x-2 transition-transform">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight">{t.category}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1.5 flex items-center gap-2"><Calendar size={8}/> {new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`text-sm font-black italic ${t.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {t.type === 'Income' ? '+' : '-'}{t.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="w-full mt-10 py-5 bg-white/5 hover:bg-[#CE2626] font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all relative z-10 italic border border-white/5">Analyze Full History</button>
                </div>
            </div>

            {/* Budget Modal */}
            {showBudgetModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-10 flex justify-between items-center text-white border-b border-[#CE2626]/20">
                            <div>
                                <h2 className="font-black uppercase tracking-widest text-sm italic text-[#CE2626]">CapEx Authorization</h2>
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">Allocate Salary Budget to HR</p>
                            </div>
                            <button onClick={() => setShowBudgetModal(false)} className="text-slate-400 hover:text-white font-black"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleAllocateBudget} className="p-12 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Strategic HR Personnel</label>
                                <select 
                                    required className="w-full p-5 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
                                    value={budgetForm.hrId} onChange={(e) => setBudgetForm({...budgetForm, hrId: e.target.value})}
                                >
                                    <option value="">Select Authorized HR</option>
                                    {hrUsers.map(u => <option key={u._id} value={u._id}>{u.name || u.username}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Budget Allocation (₹)</label>
                                <input 
                                    type="number" required className="w-full p-5 bg-slate-50 border-none rounded-2xl text-[10px] font-black tracking-widest outline-none"
                                    value={budgetForm.amount} onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Target Month</label>
                                    <select 
                                        className="w-full p-5 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
                                        value={budgetForm.month} onChange={(e) => setBudgetForm({...budgetForm, month: e.target.value})}
                                    >
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Fiscal Year</label>
                                    <input 
                                        type="number" required className="w-full p-5 bg-slate-50 border-none rounded-2xl text-[10px] font-black outline-none"
                                        value={budgetForm.year} onChange={(e) => setBudgetForm({...budgetForm, year: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4 italic shadow-slate-900/30">
                                Authorize & Commit CapEx
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction Modal (restored/refined) */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-[#CE2626] p-10 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-black uppercase tracking-widest text-sm italic">Fiscal Execution</h2>
                                <p className="text-[8px] text-white/50 font-black uppercase tracking-[0.4em] mt-1">Authorized Revenue/Expense Entry</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-slate-900 transition-all font-black">✕</button>
                        </div>
                        <form onSubmit={handleAddTransaction} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Fiscal Direction</label>
                                <select 
                                    className="w-full p-5 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase outline-none"
                                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="Income">Income (Revenue)</option>
                                    <option value="Expense">Expense (Expenditure)</option>
                                </select>
                            </div>
                            {/* Rest of transaction form... */}
                            <button className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">Submit Transaction</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
