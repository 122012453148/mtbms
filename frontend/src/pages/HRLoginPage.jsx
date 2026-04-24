import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const HRLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Distinct API endpoint for HR
            const { data } = await api.post('/hr/login', { username, password });
            localStorage.setItem('token', data.token);
            setUser(data);
            toast.success('HR Access Granted');
            navigate('/hr-dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid HR Credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDEB] px-4 font-inter">
            <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="bg-[#CE2626] p-8 text-center text-white">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={28} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">HR PORTAL</h1>
                        <p className="mt-1 text-white/70 text-xs font-medium uppercase tracking-widest">Secure HR Management System</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">HR Username</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                    <User size={18} />
                                </span>
                                <input 
                                    type="text" required
                                    value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#CE2626]/20 transition-all"
                                    placeholder="Enter HR username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Security Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                    <Lock size={18} />
                                </span>
                                <input 
                                    type="password" required
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#CE2626]/20 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-[#CE2626] hover:bg-brand-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'AUTHENTICATE'}
                        </button>
                    </form>
                </div>
                <p className="text-center mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest italic opacity-50">
                    Proprietary Human Resource Infrastructure
                </p>
            </div>
        </div>
    );
};

export default HRLoginPage;
