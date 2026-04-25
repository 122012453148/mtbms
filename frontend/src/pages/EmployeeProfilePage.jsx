import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Camera, Edit2, Check, X, Shield, Briefcase, Mail, Phone, Calendar, MapPin, CheckCircle, BarChart, User } from 'lucide-react';

import { useParams } from 'react-router-dom';

const THEME_BG = '#FFFDEB';
const THEME_PRIMARY = '#161E54';
const THEME_ACCENT = '#CE2626';

const EmployeeProfilePage = () => {
    const { user, updateUser } = useAuth();
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const targetUserId = id || user?._id;

    const isPrivileged = ['Admin', 'HR'].includes(user?.role);
    const isSelf = targetUserId === user?._id;

    useEffect(() => {
        if (targetUserId) fetchProfile();
    }, [targetUserId]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get(`/users/${targetUserId}`);
            setProfile(data);
            setFormData(data);
            if (data.profileImage) {
                setPreviewUrl(data.profileImage);
            }
        } catch (error) {
            toast.error("Failed to load profile details");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        try {
            let profileImageUrl = profile?.profileImage;

            if (imageFile) {
                // If we have a new image file, it's already in previewUrl as Base64 from handleImageChange
                profileImageUrl = previewUrl;
            }

            // Update local user data
            const updatePayload = {
                ...formData,
                profileImage: profileImageUrl
            };

            // Call the persistence API
            const { data } = await api.put('/auth/update-profile', { profileImage: profileImageUrl });
            
            // Also update the full user details if privileged (this might hit a different endpoint in real app)
            if (isPrivileged || isSelf) {
                 await api.put(`/users/${targetUserId}`, updatePayload);
            }

            setProfile(prev => ({ ...prev, ...updatePayload }));
            updateUser(data); // Update global AuthContext
            
            toast.success("Identity Matrix Synchronized");
            setEditing(false);
            setImageFile(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Protocol update failure");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-[#161E54] font-bold">Initializing ID Protocols...</div>;

    // Derived stats (Mocked for now since not present in basic user schema, real app would fetch from tasks/attendance)
    const stats = {
        workingDays: 142,
        leavesTaken: 3,
        tasksCompleted: 45
    };

    return (
        <div className="font-inter space-y-8 animate-in fade-in duration-500 pb-10" style={{ backgroundColor: THEME_BG }}>
            
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase" style={{ color: THEME_PRIMARY }}>Digital Identity</h1>
                    <p className="text-sm text-slate-500 mt-1 italic tracking-tight">Official Personnel Records & ID Verification</p>
                </div>
                {!editing ? (
                    <button 
                        onClick={() => setEditing(true)}
                        className="px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl hover:scale-105 active:scale-95"
                        style={{ backgroundColor: THEME_PRIMARY }}
                    >
                        <Edit2 size={16} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button 
                            onClick={() => { setEditing(false); setPreviewUrl(profile?.profileImage || ''); setImageFile(null); setFormData(profile); }}
                            className="px-6 py-3 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-slate-300"
                        >
                            <X size={16} /> Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            className="px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95"
                            style={{ backgroundColor: THEME_ACCENT }}
                        >
                            <Check size={16} /> Save Changes
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* ID Card Display (Left side, takes 4 columns) */}
                <div className="lg:col-span-4 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#161E54] to-[#2A3470] rounded-3xl transform rotate-3 scale-[1.02] opacity-20 transition-transform group-hover:rotate-6"></div>
                    
                    <div className="bg-white rounded-3xl shadow-2xl relative border border-slate-100 flex flex-col h-full transform transition-transform duration-500 group-hover:-translate-y-1">
                        {/* ID Header */}
                        <div className="bg-[#161E54] p-6 text-center text-white relative">
                            {/* Lanyard punch hole visual */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-white/20 rounded-full"></div>
                            
                            <h2 className="text-xl font-black uppercase tracking-[0.3em] mt-3 italic">MTBMS</h2>
                            <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Enterprise Access Pass</p>
                        </div>
                        
                        {/* ID Body */}
                        <div className="p-8 flex flex-col items-center flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                            
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                                    {previewUrl || profile?.profileImage ? (
                                        <img src={previewUrl || profile.profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <User size={64} className="text-slate-300" />
                                    )}
                                </div>
                                {editing && (
                                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#CE2626] rounded-full text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-rose-700 transition-colors">
                                        <Camera size={18} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>

                            <div className="text-center w-full mb-8">
                                <h3 className="text-2xl font-black text-[#161E54] uppercase tracking-tighter" style={{wordBreak: 'break-word'}}>{profile?.name || 'Authorized User'}</h3>
                                <div className="inline-block mt-2 px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-full">
                                    <p className="text-xs font-bold text-[#CE2626] uppercase tracking-widest">{profile?.role}</p>
                                </div>
                            </div>

                            {/* ID Details Grid */}
                            <div className="w-full grid grid-cols-2 gap-y-4 gap-x-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 font-mono text-xs">
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-sans font-bold">ID No.</p>
                                    <p className="font-bold text-[#161E54]">{profile?.employeeId || 'TBD'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-sans font-bold">Dept</p>
                                    <p className="font-bold text-[#161E54]">{profile?.department || 'General'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-sans font-bold">Clearance</p>
                                    <p className="font-bold text-emerald-600 flex items-center gap-1"><Shield size={12}/> Active</p>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="mt-auto flex justify-center p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center text-[8px] text-slate-500 font-bold uppercase text-center border-dashed border-2 border-slate-300">
                                    Auth<br/>Scan
                                </div>
                            </div>
                        </div>

                        {/* ID Footer */}
                        <div className="bg-[#CE2626] h-2 w-full"></div>
                    </div>
                </div>

                {/* Details Configuration (Right side, takes 8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Calendar size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Working Days</p>
                                <p className="text-xl font-bold text-[#161E54]">{stats.workingDays}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600"><CheckCircle size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tasks Completed</p>
                                <p className="text-xl font-bold text-[#161E54]">{stats.tasksCompleted}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><BarChart size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Leaves Taken</p>
                                <p className="text-xl font-bold text-[#161E54]">{stats.leavesTaken}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Info Form/View */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <Briefcase className="text-[#161E54]" size={20} />
                            <h3 className="font-bold text-[#161E54] uppercase tracking-widest text-sm">Personnel Data Matrix</h3>
                        </div>
                        
                        <div className="p-8 space-y-8">
                            
                             {/* Contact Info */}
                            <div>
                                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2"><div className="w-4 h-1 bg-slate-200 rounded"></div> Personal & Contact Parameters</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                        {editing ? (
                                            <div className="relative">
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#161E54] focus:ring-2 focus:ring-[#161E54] focus:border-transparent outline-none transition-all" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 bg-slate-50 py-3 px-4 rounded-xl border border-slate-100">
                                                <User size={16} className="text-[#CE2626]" /><span className="text-sm font-bold text-[#161E54]">{profile?.name || 'N/A'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Email</label>
                                        {editing ? (
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#161E54] focus:ring-2 focus:ring-[#161E54] focus:border-transparent outline-none transition-all" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 bg-slate-50 py-3 px-4 rounded-xl border border-slate-100">
                                                <Mail size={16} className="text-[#CE2626]" /><span className="text-sm font-bold text-[#161E54]">{profile?.email || 'N/A'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile Contact</label>
                                        {editing ? (
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#161E54] focus:ring-2 focus:ring-[#161E54] focus:border-transparent outline-none transition-all" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 bg-slate-50 py-3 px-4 rounded-xl border border-slate-100">
                                                <Phone size={16} className="text-[#CE2626]" /><span className="text-sm font-bold text-[#161E54]">{profile?.phone || 'Not Configured'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Operational Info */}
                            <div>
                                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2"><div className="w-4 h-1 bg-slate-200 rounded"></div> Operational Assignment</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Designated Role</label>
                                        {editing && isPrivileged ? (
                                            <select name="role" value={formData.role || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#161E54] focus:ring-2 focus:ring-[#161E54] outline-none">
                                                <option value="Employee">Employee</option>
                                                <option value="Manager">Manager</option>
                                                <option value="HR">HR</option>
                                                <option value="Sales">Sales</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        ) : (
                                            <div className="py-3 px-4 rounded-xl text-sm font-bold text-[#161E54]">{profile?.role}</div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Department</label>
                                        {editing && isPrivileged ? (
                                            <input type="text" name="department" value={formData.department || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#161E54] focus:ring-2 focus:ring-[#161E54] outline-none" />
                                        ) : (
                                            <div className="py-3 px-4 rounded-xl text-sm font-bold text-[#161E54]">{profile?.department || 'General'}</div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reporting Manager</label>
                                        {editing && isPrivileged ? (
                                            <input type="text" name="manager" value={formData.manager || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#161E54] focus:ring-2 focus:ring-[#161E54] outline-none" placeholder="Manager Name" />
                                        ) : (
                                            <div className="py-3 px-4 rounded-xl text-sm font-bold text-[#161E54]">{profile?.manager || 'Unassigned'}</div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Work Location</label>
                                        {editing && isPrivileged ? (
                                            <div className="relative">
                                                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#161E54] focus:ring-2 focus:ring-[#161E54] outline-none" placeholder="Office Location" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-[#161E54]">
                                                <MapPin size={16} className="text-[#CE2626]" /> {profile?.location || 'HQ'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Joining Date</label>
                                        {editing && isPrivileged ? (
                                            <div className="relative">
                                                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="date" name="joiningDate" value={formData.joiningDate ? formData.joiningDate.split('T')[0] : ''} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#161E54] focus:ring-2 focus:ring-[#161E54] outline-none" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-[#161E54]">
                                                <Calendar size={16} className="text-[#CE2626]" /> {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Pending'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfilePage;
