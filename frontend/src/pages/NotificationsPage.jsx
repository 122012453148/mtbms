import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { 
    Bell, CheckCircle, Clock, Trash2, Info, CreditCard, Calendar, 
    ClipboardCheck, Package, Briefcase, ShieldCheck, User, CheckCheck 
} from 'lucide-react';

const TYPE_CONFIG = {
    all:      { label: 'All',      color: 'bg-slate-900',   icon: Bell },
    unread:   { label: 'Unread',   color: 'bg-[#CE2626]',   icon: Bell },
    task:     { label: 'Tasks',    color: 'bg-indigo-500',  icon: ClipboardCheck },
    leave:    { label: 'Leave',    color: 'bg-teal-500',    icon: Calendar },
    salary:   { label: 'Salary',   color: 'bg-emerald-500', icon: CreditCard },
    stock:    { label: 'Stock',    color: 'bg-amber-500',   icon: Package },
    deal:     { label: 'Deals',    color: 'bg-violet-500',  icon: Briefcase },
    approval: { label: 'Approvals',color: 'bg-blue-500',    icon: ShieldCheck },
    customer: { label: 'Customers',color: 'bg-rose-500',    icon: User },
    system:   { label: 'System',   color: 'bg-slate-500',   icon: Info },
};

const NotificationsPage = () => {
    const { notifications, unreadCount, markReadArea, markAllRead, deleteNotification, refresh } = useNotifications();
    const [filter, setFilter] = useState('all');

    useEffect(() => { refresh(); }, []);

    const filteredNotifs = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.isRead;
        return n.type === filter;
    });

    const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#CE2626] rounded-xl flex items-center justify-center">
                            <Bell size={20} className="text-white" />
                        </div>
                        Broadcast Center
                    </h1>
                    <p className="text-slate-500 font-bold italic mt-2 ml-13 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up — no unread alerts'}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg"
                    >
                        <CheckCheck size={16} /> Mark All as Read
                    </button>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const isActive = filter === key;
                    const count = key === 'all' 
                        ? notifications.length 
                        : key === 'unread' 
                        ? notifications.filter(n => !n.isRead).length 
                        : notifications.filter(n => n.type === key).length;
                    if (count === 0 && key !== 'all' && key !== 'unread') return null;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                isActive 
                                ? `${cfg.color} text-white shadow-md` 
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Icon size={12} />
                            {cfg.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Notification List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="divide-y divide-slate-50">
                    {filteredNotifs.length === 0 ? (
                        <div className="p-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <Bell size={36} />
                            </div>
                            <p className="text-slate-400 italic font-black uppercase tracking-[0.3em] text-[10px]">Transmission silent</p>
                            <p className="text-slate-300 text-xs mt-2">No notifications in this category</p>
                        </div>
                    ) : (
                        filteredNotifs.map((notif) => {
                            const cfg = getConfig(notif.type);
                            const Icon = cfg.icon;
                            return (
                                <div 
                                    key={notif._id} 
                                    className={`p-6 flex items-start gap-6 transition-all group ${notif.isRead ? 'opacity-60 bg-slate-50/30' : 'bg-white hover:bg-slate-50/80'}`}
                                >
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 p-3.5 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 ${notif.isRead ? 'bg-slate-300' : cfg.color}`}>
                                        <Icon size={20} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pt-0.5 min-w-0">
                                        <div className="flex items-start justify-between mb-2 gap-4">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <h4 className={`text-sm tracking-tight font-black uppercase truncate ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                                                    {notif.title}
                                                </h4>
                                                {!notif.isRead && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-[#CE2626] rounded-full shadow-[0_0_8px_rgba(206,38,38,0.5)]" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
                                                    <Clock size={10} /> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-full whitespace-nowrap ${notif.isRead ? 'bg-slate-100 text-slate-400' : `${cfg.color} text-white`}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        </div>

                                        <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                                            {notif.message}
                                        </p>

                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                                            {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>

                                        <div className="mt-4 flex items-center gap-3">
                                            {!notif.isRead && (
                                                <button 
                                                    onClick={() => markReadArea(notif._id)}
                                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2"
                                                >
                                                    <CheckCircle size={13} /> Mark Read
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteNotification(notif._id)}
                                                className="px-4 py-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2"
                                            >
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
