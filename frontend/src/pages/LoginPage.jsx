import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const redirectByRole = (role) => {
        const r = role?.toLowerCase();
        console.log("Redirecting based on role:", r);
        if (r === 'admin') return '/dashboard';
        if (r === 'hr') return '/hr-dashboard';
        if (r === 'manager') return '/manager-dashboard';
        if (r === 'employee') return '/employee-dashboard';
        if (r === 'sales') return '/sales-dashboard';
        return '/';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(username, password);
            toast.success(`Welcome ${data.name}`);
            if (data.firstLogin) {
                navigate('/change-password', { replace: true });
            } else {
                navigate(redirectByRole(data.role), { replace: true });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-inter">
            <div className="w-full max-w-sm md:max-w-md">
                <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="bg-[#CE2626] p-10 md:p-14 text-center text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-xl relative z-10">
                            <Shield size={32} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic relative z-10 leading-none">Welcome to MTBMS</h1>
                        <p className="mt-3 text-white/60 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] relative z-10 italic">Material Tracking & Business Management System</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 italic">Entity Identity</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-[#CE2626]">
                                    <User size={20} />
                                </span>
                                <input 
                                    type="text" required
                                    value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    placeholder="Username / ID"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 italic">Access Key</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-[#CE2626]">
                                    <Lock size={20} />
                                </span>
                                <input 
                                    type="password" required
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-slate-900 hover:bg-[#CE2626] text-white font-black py-5 rounded-[2rem] transition-all shadow-2xl flex items-center justify-center gap-3 mt-6 hover:scale-[1.02] active:scale-95 text-[10px] md:text-[11px] uppercase tracking-[0.4em] italic"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'INITIALIZE SESSION'}
                        </button>
                    </form>
                </div>
                <div className="mt-10 flex flex-col items-center gap-4">
                    <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
                        Protocol Secured via RSA-4096
                    </p>
                    <div className="w-1 h-8 bg-slate-200 rounded-full"></div>
                </div>
            </div>
        </div>

    );
};

export default LoginPage;
