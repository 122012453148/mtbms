import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
    User, Mail, Phone, MapPin, 
    Shield, Camera, Save, Key,
    Building2, Calendar, Briefcase,
    ChevronRight, Loader2
} from 'lucide-react';

const ProfileSettingsPage = () => {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('Profile');
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Profile Form State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        department: user?.department || '',
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Temp image preview
    const [preview, setPreview] = useState(user?.profileImage || '');

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        const formData = new FormData();
        formData.append('name', profileData.name);
        formData.append('email', profileData.email);
        formData.append('phone', profileData.phone);
        formData.append('department', profileData.department);
        
        if (fileInputRef.current.files[0]) {
            formData.append('image', fileInputRef.current.files[0]);
        }

        try {
            const { data } = await api.put('/auth/update-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(data);
            toast.success('Core Identity Updated Successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Protocol Failure: Profile update rejected');
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Encryption Mismatch: Passwords do not match');
        }
        setUpdating(true);
        try {
            await api.put('/auth/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Security Access Key Rotation Complete');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Access Control Failure');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 font-inter">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Executive configuration</h1>
                <p className="text-slate-500 font-medium italic mt-1 font-bold uppercase tracking-widest text-[10px]">Secure Identity & Protocol Management</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* 3D ID CARD & TABS */}
                <div className="lg:col-span-1 space-y-8">
                    {/* 3D ID CARD */}
                    <div className="group relative">
                        <div className="bg-white rounded-[2.5rem] border-4 border-slate-900 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:rotate-2 group-hover:-translate-y-2 relative overflow-hidden h-[450px] flex flex-col items-center justify-center text-center">
                            {/* Decorative Background */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-[#CE2626] opacity-10 blur-3xl -mt-16"></div>
                            
                            {/* Profile Image with Camera Trigger */}
                            <div className="relative z-10 mb-6 group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden relative">
                                    <img 
                                        src={preview || `https://ui-avatars.com/api/?name=${user?.name || user?.username}&size=256&background=161E54&color=fff`} 
                                        alt="profile" 
                                        className="w-full h-full object-cover rounded-full transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full"></div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>

                            {/* Identity Info */}
                            <div className="relative z-10 space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{user?.name || user?.username}</h3>
                                <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                    {user?.role}
                                </div>
                                <div className="pt-6 space-y-3">
                                    <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        <Building2 size={12} className="text-[#CE2626]" /> {user?.department || 'Operations'}
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        <Calendar size={12} className="text-[#CE2626]" /> Joined {new Date(user?.joiningDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Holographic SMT Logo Background */}
                            <div className="absolute bottom-4 opacity-[0.03] text-[120px] font-black italic tracking-tighter select-none">SMT</div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-2">
                        {['Profile', 'Security', 'Preferences', 'Active Devices'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <span className={`text-xs font-black uppercase tracking-widest ${activeTab === tab ? 'text-white' : ''}`}>{tab}</span>
                                <ChevronRight size={14} className={activeTab === tab ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* SETTINGS FORMS */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                        {activeTab === 'Profile' && (
                            <div className="p-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-start justify-between mb-12">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                            <User className="text-[#CE2626]" size={24} /> Basic Identity Synchronization
                                        </h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel Information Protocol</p>
                                    </div>
                                    {updating && <Loader2 className="animate-spin text-[#CE2626]" size={24} />}
                                </div>

                                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Full Operational Name</label>
                                        <input 
                                            type="text" name="name" value={profileData.name} onChange={handleProfileChange}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Enterprise Email</label>
                                        <input 
                                            type="email" name="email" value={profileData.email} onChange={handleProfileChange}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Secure encrypted Phone</label>
                                        <input 
                                            type="text" name="phone" value={profileData.phone} onChange={handleProfileChange}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Departmental assignment</label>
                                        <select 
                                            name="department" value={profileData.department} onChange={handleProfileChange}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 transition-all appearance-none"
                                        >
                                            <option value="General">General</option>
                                            <option value="Management">Management</option>
                                            <option value="Sales">Sales</option>
                                            <option value="HR">HR</option>
                                            <option value="Logistics">Logistics</option>
                                            <option value="Operations">Operations</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 pt-8">
                                        <button 
                                            disabled={updating}
                                            type="submit" 
                                            className="flex items-center gap-3 bg-[#CE2626] text-white px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <Save size={18} /> Update Core Identity
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'Security' && (
                            <div className="p-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-start justify-between mb-12">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                            <Shield className="text-[#CE2626]" size={24} /> Access Key Rotation
                                        </h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cryptography Protocol Enforcement</p>
                                    </div>
                                    {updating && <Loader2 className="animate-spin text-[#CE2626]" size={24} />}
                                </div>

                                <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Current Access Key</label>
                                        <input 
                                            type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">New Intelligence Key</label>
                                        <input 
                                            type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-100 transition-all border border-slate-100"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Verify Intelligence Key</label>
                                        <input 
                                            type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-100 transition-all border border-slate-100"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <button 
                                        disabled={updating}
                                        type="submit" 
                                        className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        <Key size={18} /> Execute Rotation
                                    </button>
                                </form>
                            </div>
                        )}

                        {(activeTab === 'Preferences' || activeTab === 'Active Devices') && (
                            <div className="p-20 text-center space-y-6">
                                <Shield size={64} className="mx-auto text-slate-100" />
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-slate-900">Module Isolated</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Enhanced security clearance required for customization</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsPage;
