import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ChangePasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await api.put('/auth/change-password', { newPassword });
            toast.success('Password changed successfully! Please login again.');
            logout();
            navigate('/', { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDEB] px-4 font-inter text-slate-900">
            <div className="w-full max-w-sm">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="bg-slate-900 p-10 text-center text-white">
                        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10 backdrop-blur-md">
                            <ShieldCheck size={32} className="text-rose-500" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase">Security Check</h1>
                        <p className="mt-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">First-Time Login Authorization</p>
                    </div>

                    <div className="p-10 space-y-8 text-center border-b border-slate-50">
                        <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                            For security purposes, you must update your password before accessing the MTBMS environment.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                                    <Lock size={18} />
                                </span>
                                <input 
                                    type="password" required minLength="6"
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/10 transition-all"
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                                    <Lock size={18} />
                                </span>
                                <input 
                                    type="password" required minLength="6"
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/10 transition-all"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-[#CE2626] text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[2rem] transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3 mt-4 hover:scale-[1.02] active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'AUTHORIZE UPDATES'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
