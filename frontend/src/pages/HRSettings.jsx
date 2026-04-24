import React, { useState } from 'react';
import { Key, Save, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const HRSettings = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        setLoading(true);
        try {
            await api.post('/hr/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('System credentials updated');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-500 font-inter">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Security Parameters</h1>
                <p className="text-sm text-slate-500 mt-1 italic">Manage HR portal credentials and access tokens</p>
            </div>

            <div className="bg-white p-10 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6 text-[#CE2626]">
                    <Key size={20} />
                    <h2 className="text-sm font-black uppercase tracking-widest">Credential Rotation</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Current Portal Password</label>
                        <input 
                            type="password" required
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#CE2626]/20 transition-all"
                            placeholder="Enter current password"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                            <input 
                                type="password" required
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#CE2626]/20 transition-all"
                                placeholder="Min. 8 characters"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                            <input 
                                type="password" required
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#CE2626]/20 transition-all"
                                placeholder="Re-enter password"
                            />
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3 mt-6">
                        <ShieldAlert size={18} className="text-amber-600 mt-0.5" />
                        <p className="text-[11px] text-amber-700 font-medium leading-relaxed italic">
                            Changing your portal password will invalidate your current session. Please ensure you have your new credentials saved securely.
                        </p>
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="w-full mt-4 py-4 bg-[#CE2626] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-rose-500/10 active:scale-95 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> UPDATE PORTAL CREDENTIALS</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HRSettings;
