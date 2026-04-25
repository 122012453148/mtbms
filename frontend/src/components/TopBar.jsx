import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Bell, Search, User, LogOut, Settings as SettingsIcon, 
    CheckCheck, ClipboardCheck, Calendar, CreditCard, 
    Package, Briefcase, ShieldCheck, Info, Trash2, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const TYPE_CONFIG = {
    task:     { icon: ClipboardCheck, color: 'bg-indigo-500',  label: 'Task' },
    leave:    { icon: Calendar,       color: 'bg-teal-500',    label: 'Leave' },
    salary:   { icon: CreditCard,     color: 'bg-emerald-500', label: 'Salary' },
    stock:    { icon: Package,        color: 'bg-amber-500',   label: 'Stock' },
    deal:     { icon: Briefcase,      color: 'bg-violet-500',  label: 'Deal' },
    approval: { icon: ShieldCheck,    color: 'bg-blue-500',    label: 'Approval' },
    customer: { icon: User,           color: 'bg-rose-500',    label: 'Customer' },
    system:   { icon: Info,           color: 'bg-slate-500',   label: 'System' },
};

const TopBar = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markReadArea, markAllRead, deleteNotification } = useNotifications();
    const [showProfile, setShowProfile] = useState(false);
    const [showNotify, setShowNotify] = useState(false);
    const notifyRef = useRef(null);
    const profileRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifyRef.current && !notifyRef.current.contains(e.target)) setShowNotify(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

    const recentNotifs = notifications.slice(0, 8);

    return (
        <header className="h-20 md:h-24 bg-white/80 backdrop-blur-md sticky top-0 right-0 left-0 z-50 border-b border-slate-200 px-4 md:px-10 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4 flex-1 md:w-1/3">
                {/* Hamburger for mobile */}
                <button 
                    onClick={onToggleSidebar}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 lg:hidden transition-all"
                    aria-label="Toggle Menu"
                >
                    <Menu size={20} />
                </button>

                <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                        <Search size={18} />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full bg-slate-100/50 border-none rounded-2xl pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-xs md:text-sm focus:ring-2 focus:ring-[#9B8EC7]/20 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
                {/* ── Notification Bell ── */}
                <div className="relative" ref={notifyRef}>
                    <button 
                        onClick={() => setShowNotify(v => !v)}
                        className="p-2 md:p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-all relative"
                        aria-label="Notifications"
                    >
                        <Bell size={18} className="md:w-5 md:h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[16px] md:min-w-[20px] h-4 md:h-5 bg-[#9B8EC7] text-white text-[8px] md:text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white px-0.5 md:px-1 animate-bounce">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                    
                    {showNotify && (
                        <div className="absolute right-[-100px] md:right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="p-4 bg-[#9B8EC7] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell size={16} className="text-[#9B8EC7]" />
                                    <span className="font-black text-white text-sm tracking-wider uppercase">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-[#9B8EC7] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{unreadCount} NEW</span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        <CheckCheck size={13} /> Mark All Read
                                    </button>
                                )}
                            </div>

                            {/* List */}
                            <div className="max-h-[420px] overflow-y-auto">
                                {recentNotifs.length > 0 ? recentNotifs.map(n => {
                                    const cfg = getTypeConfig(n.type);
                                    const Icon = cfg.icon;
                                    return (
                                        <div 
                                            key={n._id} 
                                            className={`flex items-start gap-3 p-4 border-b border-slate-50 transition-colors group ${!n.isRead ? 'bg-rose-50/40 hover:bg-rose-50' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm mt-0.5 ${cfg.color}`}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-xs font-black tracking-tight leading-snug ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                                                        {n.title}
                                                        {!n.isRead && <span className="inline-block ml-1.5 w-1.5 h-1.5 bg-[#CE2626] rounded-full align-middle" />}
                                                    </p>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {!n.isRead && (
                                                            <button
                                                                onClick={() => markReadArea(n._id)}
                                                                title="Mark as read"
                                                                className="opacity-0 group-hover:opacity-100 p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                                            >
                                                                <CheckCheck size={13} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotification(n._id)}
                                                            title="Delete"
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                                                <p className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">
                                                    {cfg.label} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="p-12 text-center">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                            <Bell size={24} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">All clear — no alerts</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <Link
                                to="/notifications"
                                onClick={() => setShowNotify(false)}
                                className="block w-full py-3.5 text-[10px] font-black text-[#CE2626] hover:bg-rose-50 uppercase tracking-[0.2em] border-t border-slate-100 text-center transition-colors"
                            >
                                View All Notifications →
                            </Link>
                        </div>
                    )}
                </div>

                <div className="hidden md:block h-10 w-[1px] bg-slate-200 mx-2"></div>

                {/* ── Profile ── */}
                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setShowProfile(v => !v)}
                        className="flex flex-col items-center justify-center hover:scale-105 transition-all duration-300 p-1"
                    >
                        <div className="relative w-[45px] h-[45px] rounded-full overflow-hidden border-2 border-slate-200 shadow-md bg-white">
                            <img 
                                src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || user?.username}&background=161E54&color=fff`}
                                alt="profile"
                                className="w-full h-full object-cover rounded-full"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="text-center mt-1">
                            <h2 className="text-[11px] font-black text-slate-900 leading-tight uppercase tracking-tighter">
                                {user?.name || user?.username}
                            </h2>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                                {user?.role}
                            </p>
                        </div>
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-200">
                            {(() => {
                                const settingsPath = {
                                    'Admin': '/settings',
                                    'HR': '/hr-settings',
                                    'Manager': '/manager-settings',
                                    'Sales': '/sales-settings',
                                    'Employee': '/employee-settings'
                                }[user?.role] || '/settings';

                                return (
                                    <>
                                        <Link to={settingsPath} onClick={() => setShowProfile(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                                            <User size={16} className="text-[#CE2626]" /> Profile Settings
                                        </Link>
                                        <Link to={settingsPath} onClick={() => setShowProfile(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                                            <SettingsIcon size={16} /> System Config
                                        </Link>
                                    </>
                                );
                            })()}
                            <div className="h-[1px] bg-slate-100 my-1 mx-2"></div>
                            <button 
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 font-bold hover:bg-rose-50 rounded-xl"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
