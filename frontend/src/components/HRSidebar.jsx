import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Clock, FileEdit, 
    CreditCard, FileBarChart, Settings, Bell,
    LogOut, ChevronRight, Briefcase, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const HRSidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const { unreadCount } = useNotifications();

    const hrItems = [
        { name: 'HR Dashboard', icon: <LayoutDashboard size={20} />, path: '/hr-dashboard' },
        { name: 'Employees', icon: <Users size={20} />, path: '/hr-employees' },
        { name: 'Attendance', icon: <Clock size={20} />, path: '/hr-attendance' },
        { name: 'Leaves', icon: <FileEdit size={20} />, path: '/hr-leaves' },
        { name: 'Payroll', icon: <CreditCard size={20} />, path: '/hr-payroll' },
        { name: 'HR Reports', icon: <FileBarChart size={20} />, path: '/hr-reports' },
        { name: 'HR Settings', icon: <Settings size={20} />, path: '/hr-settings' },
        { name: 'Notifications', icon: <Bell size={20} />, path: '/hr-notifications', badge: unreadCount },
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

            <div className={`w-72 bg-slate-900 h-screen fixed left-0 top-0 text-slate-300 flex flex-col shadow-2xl z-[60] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#CE2626] rounded-lg flex items-center justify-center font-bold text-white text-lg italic">M</div>
                        <h1 className="text-lg font-semibold text-white tracking-tight uppercase">MTBMS HR</h1>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                    {hrItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => 
                                `flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                                    isActive 
                                    ? 'bg-[#CE2626] text-white shadow-sm' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <div className="flex items-center gap-4">
                                <span className="relative">
                                    {item.icon}
                                    {item.badge > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[#CE2626] text-white text-[8px] font-black flex items-center justify-center rounded-full px-0.5 border border-slate-900">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </span>
                                <span className="text-sm font-medium tracking-tight">{item.name}</span>
                            </div>
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all text-sm font-medium"
                    >
                        <LogOut size={20} />
                        <span>EXIT PORTAL</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default HRSidebar;
