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
        <div className="login-bg px-4">
            {/* Animated Background Orbs */}
            <div className="circle circle1"></div>
            <div className="circle circle2"></div>
            <div className="circle circle3"></div>

            <div className="login-card animate-in fade-in zoom-in duration-700">
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-md">
                        <Shield size={40} className="text-[#2A9D8F]" />
                    </div>
                </div>

                <h1 className="login-title">WELCOME TO MTBMS</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="input-group">
                        <label className="input-label">Identity Access</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-[#2A9D8F] pointer-events-none">
                                <User size={18} />
                            </span>
                            <input 
                                type="text" required
                                value={username} onChange={(e) => setUsername(e.target.value)}
                                className="input-box"
                                placeholder="Username / ID"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Security Key</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-[#2A9D8F] pointer-events-none">
                                <Lock size={18} />
                            </span>
                            <input 
                                type="password" required
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                className="input-box"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="login-btn group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                INITIALIZE SESSION
                                <Shield size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] italic">
                        Protocol Secured: RSA-4096 / AES-256
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
