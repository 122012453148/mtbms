import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    DollarSign, UserPlus, CreditCard, PieChart, 
    Download, Search, Loader2, CheckCircle, 
    ArrowUpRight, IndianRupee, FileText, Banknote,
    Activity, Clock, Wallet, ShieldCheck, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('https://mtbms.onrender.com');

const HRPayroll = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGrant, setShowGrant] = useState(false);
    
    const [grantForm, setGrantForm] = useState({
        employeeId: '',
        budgetId: '',
        month: 'April',
        year: 2026,
        baseSalary: '',
        bonus: 0,
        deductions: 0
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payrollRes, employeeRes, budgetRes] = await Promise.all([
                api.get('/salary/all'),
                api.get('/users/staff'),
                api.get('/salary/my-budget')
            ]);
            setPayrolls(payrollRes.data);
            setEmployees(employeeRes.data.filter(u => u.role !== 'Admin'));
            setBudgets(budgetRes.data);
            
            if (budgetRes.data.length > 0) {
                setGrantForm(prev => ({ ...prev, budgetId: budgetRes.data[0]._id }));
            }
        } catch (error) {
            toast.error('CapEx Sync Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        socket.on('salaryDistributed', fetchData);
        socket.on('salaryPaid', fetchData);
        socket.on('budgetAllocated', fetchData);
        return () => {
            socket.off('salaryDistributed');
            socket.off('salaryPaid');
            socket.off('budgetAllocated');
        };
    }, []);

    const handleGrantSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/salary/distribute', grantForm);
            toast.success('Salary Authorization Succeeded');
            setShowGrant(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Grant Protocol Failure');
        }
    };

    const handleMarkPaid = async (id) => {
        try {
            await api.put(`/salary/finalize/${id}`);
            toast.success('Funds Disbursed & Record Finalized');
            fetchData();
        } catch (error) {
            toast.error('Disbursal Finalization failure');
        }
    };

    const totalAllocated = budgets.reduce((acc, b) => acc + b.totalAmount, 0);
    const totalRemaining = budgets.reduce((acc, b) => acc + b.remainingAmount, 0);

    if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-[#161E54]">SYNCING PAYROLL MATRIX...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-inter pb-20">
             {/* Dynamic Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#CE2626] rounded-full blur-[120px] opacity-10 -mr-48 -mt-48"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Payroll Control</h1>
                    <p className="text-slate-400 font-black mt-2 uppercase text-[10px] tracking-[0.4em] italic">Authorized Capital Dissemination Module</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md flex flex-col items-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Budget</p>
                        <p className="text-xl font-black text-white">₹{totalRemaining.toLocaleString()}</p>
                    </div>
                    <button 
                        onClick={() => setShowGrant(true)}
                        className="px-8 py-4 bg-[#CE2626] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#CE2626]/30 flex items-center gap-3"
                    >
                        <UserPlus size={18} /> Distribute Salary
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Total Allocated CapEx', val: `₹${totalAllocated.toLocaleString()}`, color: 'bg-indigo-600', icon: <Wallet /> },
                    { label: 'Pending Authorizations', val: payrolls.filter(p => p.status === 'pending').length, color: 'bg-[#CE2626]', icon: <Clock /> },
                    { label: 'Validated Disbursals', val: payrolls.filter(p => p.status === 'paid').length, color: 'bg-emerald-600', icon: <ShieldCheck /> }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-2 transition-all">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`${s.color} p-4 rounded-2xl text-white shadow-xl group-hover:rotate-12 transition-transform`}>{s.icon}</div>
                            <Activity className="text-slate-100" size={32} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3 italic">{s.label}</p>
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{s.val}</h4>
                    </div>
                ))}
            </div>

            {/* Disbursal Ledger */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[600px]">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] italic leading-none border-l-4 border-[#161E54] pl-6">Operations Disbursal Ledger</h3>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Scan Beneficiary Identity..." className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#161E54]/10 transition-all w-64" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-12 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Beneficiary Identity</th>
                                <th className="px-8 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Fiscal Period</th>
                                <th className="px-8 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Net Quantum</th>
                                <th className="px-8 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status State</th>
                                <th className="px-12 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Strategic Execution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payrolls.map((p) => (
                                <tr key={p._id} className="group hover:bg-slate-50/50 transition-all border-b border-slate-50">
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-all">
                                                {p.userId?.name?.[0] || 'E'}
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-slate-900 uppercase tracking-tight italic">{p.userId?.name || 'Unknown'}</p>
                                                <p className="text-[9px] font-black text-[#CE2626] uppercase tracking-[0.2em] mt-1.5">{p.userId?.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-10">
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest italic">{p.month} {p.year}</span>
                                    </td>
                                    <td className="px-8 py-10">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black text-slate-900">₹{p.netSalary.toLocaleString()}</span>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase">B: ₹{p.baseSalary}</span>
                                                <span className="text-[8px] font-black text-emerald-500 uppercase">+₹{p.bonus}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-10">
                                        <div className={`px-5 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.3em] inline-flex items-center gap-2 ${
                                            p.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}></div>
                                            {p.status}
                                        </div>
                                    </td>
                                    <td className="px-12 py-10 text-right">
                                        {p.status === 'pending' ? (
                                            <button 
                                                onClick={() => handleMarkPaid(p._id)}
                                                className="px-8 py-4 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-[#CE2626] transition-all shadow-xl hover:scale-105 active:scale-95 italic"
                                            >
                                                Execute Final Disbursal
                                            </button>
                                        ) : (
                                            <button className="p-4 text-slate-200 hover:text-[#CE2626] transition-all bg-slate-50 rounded-2xl">
                                                <Download size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grant Selection Modal */}
            {showGrant && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-[#161E54] p-12 text-white flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter italic text-[#CE2626]">Salary Distribution</h2>
                                <p className="text-[10px] text-white/50 uppercase font-black tracking-[0.5em] mt-2 italic">Authorized Expenditure Authorization</p>
                            </div>
                            <button onClick={() => setShowGrant(false)} className="p-4 bg-white/10 rounded-2xl hover:text-[#CE2626] transition-all"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleGrantSubmit} className="p-12 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Active CapEx Allocation</label>
                                    <select 
                                        required className="w-full bg-slate-50 border-none rounded-2xl p-5 text-xs font-black uppercase tracking-widest text-[#CE2626]"
                                        value={grantForm.budgetId} onChange={(e) => setGrantForm({...grantForm, budgetId: e.target.value})}
                                    >
                                        {budgets.map(b => <option key={b._id} value={b._id}>{b.month} {b.year} Allocation (Avail: ₹{b.remainingAmount})</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Target Beneficiary</label>
                                    <select 
                                        required className="w-full bg-slate-50 border-none rounded-2xl p-5 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-[#161E54]/5"
                                        onChange={(e) => setGrantForm({...grantForm, employeeId: e.target.value})}
                                    >
                                        <option value="">Choose Employee</option>
                                        {employees.map(e => <option key={e._id} value={e._id}>{e.name || e.username} ({e.role})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Base Salary (₹)</label>
                                    <input type="number" required className="w-full bg-slate-50 border-none rounded-2xl p-5 text-xs font-black outline-none focus:ring-4 focus:ring-[#161E54]/5" onChange={(e) => setGrantForm({...grantForm, baseSalary: e.target.value})}/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Performance Bonus (₹)</label>
                                    <input type="number" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-xs font-black outline-none focus:ring-4 focus:ring-[#161E54]/5" onChange={(e) => setGrantForm({...grantForm, bonus: e.target.value})}/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Month</label>
                                    <select className="w-full bg-slate-50 border-none rounded-2xl p-5 text-xs font-black uppercase" value={grantForm.month} onChange={(e) => setGrantForm({...grantForm, month: e.target.value})}>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Year</label>
                                    <input type="number" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-xs font-black" value={grantForm.year} onChange={(e) => setGrantForm({...grantForm, year: e.target.value})}/>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-[2rem] flex items-center justify-between border border-dashed border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Calculated Net Payout</span>
                                <span className="text-3xl font-black text-slate-900 tracking-tighter italic">₹{(Number(grantForm.baseSalary) + Number(grantForm.bonus)).toLocaleString()}</span>
                            </div>
                            <button type="submit" className="w-full py-6 bg-[#CE2626] text-white text-[11px] font-black uppercase tracking-[0.5em] rounded-[2.5rem] shadow-2xl shadow-[#CE2626]/30 hover:scale-[1.02] active:scale-95 transition-all italic">Authorize Disbursal Grant</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRPayroll;
