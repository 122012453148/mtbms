import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Wallet, DollarSign, Download, Calendar, Loader2, CheckCircle2, IndianRupee, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const EmployeeSalary = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSalary = async () => {
            try {
                const { data } = await api.get('/salary/my-history');
                setPayrolls(data);
            } catch (error) {
                toast.error('Compensation Data Error');
            } finally {
                setLoading(false);
            }
        };
        fetchSalary();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-[#9B8EC7]">SYNCING COMPENSATION MATRIX...</div>;

    const latest = payrolls[0];

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-inter pb-20">
            {/* Command Header */}
            <div className="bg-[#9B8EC7] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform duration-1000 group-hover:scale-110"><Wallet size={180} /></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-300 mb-6 italic flex items-center gap-2">
                            <ShieldCheck size={12} /> Certified Compensation Profile
                        </p>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Earnings Summary</h1>
                        <p className="text-white/40 font-bold mt-2 uppercase text-[10px] tracking-[0.4em] italic">Official Payroll Record Audit Trail</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 italic">Net Liquidity (Last Disbursal)</p>
                        <div className="flex items-center gap-3">
                            <span className="text-5xl font-black italic tracking-tighter text-white">₹{latest?.netSalary?.toLocaleString() || '0'}</span>
                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${latest?.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                {latest?.status || 'Active Scan'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] italic leading-none border-l-4 border-[#9B8EC7] pl-6">Historical Ledger</h3>
                            <button className="text-[9px] font-black text-[#CE2626] uppercase tracking-[0.2em] border border-rose-100 px-4 py-2 rounded-xl hover:bg-rose-50 transition-all">Verify All Records</button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {payrolls.map(p => (
                                <div key={p._id} className="p-10 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-[#9B8EC7] text-white rounded-2xl flex items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 uppercase tracking-tight italic">{p.month} {p.year}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Transaction Ref: {p._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900 italic">₹{p.netSalary.toLocaleString()}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${p.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{p.status}</p>
                                        </div>
                                        <button className="p-4 bg-slate-50 text-slate-300 group-hover:text-white group-hover:bg-[#CE2626] rounded-2xl shadow-sm transition-all"><Download size={20} /></button>
                                    </div>
                                </div>
                            ))}
                            {payrolls.length === 0 && (
                                <div className="py-32 text-center">
                                    <DollarSign size={48} className="mx-auto text-slate-100 mb-6" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-none">No Official Disbursements Recorded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#161E54] to-[#CE2626]"></div>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-indigo-50 text-[#9B8EC7] rounded-2xl shadow-sm"><IndianRupee size={24} /></div>
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] italic leading-none">Fiscal Matrix</h3>
                        </div>
                        <div className="space-y-8">
                            <div className="flex justify-between items-center group">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:text-slate-900 transition-colors">Base Quantum</span>
                                <span className="text-lg font-black text-slate-900 italic tracking-tight">₹{latest?.baseSalary?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:text-emerald-500 transition-colors italic">Core Incentive</span>
                                <span className="text-lg font-black text-emerald-600 tracking-tight italic">+₹{latest?.bonus?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:text-[#CE2626] transition-colors italic">Tax/Deductions</span>
                                <span className="text-lg font-black text-rose-600 tracking-tight italic">-₹{latest?.deductions?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-xs text-slate-900 font-black uppercase tracking-[0.2em] italic">Net Payable</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-[#9B8EC7] tracking-tighter italic leading-none">₹{latest?.netSalary?.toLocaleString() || '0'}</span>
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">Certified Fiscal Output</p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-12 py-6 bg-[#9B8EC7] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-[#7E74C9] hover:scale-[1.02] active:scale-95 transition-all">Generate Digital Payslip</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeSalary;
