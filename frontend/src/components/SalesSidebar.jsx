import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Users, UserPlus, 
    Layers, Briefcase, FileBarChart, 
    Settings, LogOut, ChevronRight,
    Target, Star, Bell, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const SalesSidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const location = useLocation();
    const { unreadCount } = useNotifications();

    const salesItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/sales-dashboard' },
        { name: 'Pipeline', icon: <Layers size={20} />, path: '/sales-pipeline' },
        { name: 'Prospects', icon: <Target size={20} />, path: '/sales-leads' },
        { name: 'Qualified Hub', icon: <Star size={20} />, path: '/sales-qualified' },
        { name: 'Customers', icon: <Users size={20} />, path: '/sales-customers' },
        { name: 'Acquisitions', icon: <Briefcase size={20} />, path: '/sales-acquisition' },
        { name: 'Revenue', icon: <FileBarChart size={20} />, path: '/sales-reports' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/sales-settings' },
        { name: 'Notifications', icon: <Bell size={20} />, path: '/sales-notifications', badge: unreadCount },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`w-72 bg-gradient-to-b from-[#1E293B] to-[#0F172A] h-screen fixed left-0 top-0 text-white flex flex-col shadow-2xl z-[60] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Branding */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#6C63FF] to-[#8E7CFF] rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-[#6C63FF]/20">M</div>
                        <div>
                            <h1 className="text-base font-bold tracking-tight">MTBMS SALES</h1>
                            <p className="text-[10px] font-medium text-[#64748B] tracking-wider uppercase italic">Enterprise Intelligence</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-[#94A3B8]">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-[11px] font-bold text-[#64748B] uppercase tracking-[0.2em] mb-4">Main Menu</p>
                    
                    {salesItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                                    isActive 
                                    ? 'bg-white/10 text-white shadow-lg' 
                                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`${isActive ? 'text-[#8E7CFF]' : 'text-[#64748B] group-hover:text-white'} transition-colors relative`}>
                                        {item.icon}
                                        {item.badge > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[#CE2626] text-white text-[8px] font-black flex items-center justify-center rounded-full px-0.5">
                                                {item.badge > 9 ? '9+' : item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[13px] font-medium tracking-tight">{item.name}</span>
                                </div>
                                <ChevronRight size={14} className={`transition-all duration-300 ${isActive ? 'opacity-100 rotate-90 text-[#8E7CFF]' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-6 border-t border-white/5">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[#94A3B8] hover:bg-rose-500/10 hover:text-[#EF4444] transition-all duration-300 text-sm font-semibold group"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default SalesSidebar;
