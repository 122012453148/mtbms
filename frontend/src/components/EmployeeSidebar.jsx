import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, UserCircle, Clock, 
    ClipboardCheck, CalendarDays, Wallet, 
    Bell, Settings, LogOut, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const EmployeeSidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const { unreadCount } = useNotifications();
    const THEME_COLOR = '#161E54';

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/employee-dashboard' },
        { name: 'My Profile', icon: <UserCircle size={20} />, path: '/employee-profile' },
        { name: 'Attendance', icon: <Clock size={20} />, path: '/employee-attendance' },
        { name: 'My Tasks', icon: <ClipboardCheck size={20} />, path: '/employee-tasks' },
        { name: 'Leaves', icon: <CalendarDays size={20} />, path: '/employee-leaves' },
        { name: 'Salary', icon: <Wallet size={20} />, path: '/employee-salary' },
        { name: 'Field Audit', icon: <ClipboardCheck size={20} />, path: '/employee-audit' },
        { name: 'Notifications', icon: <Bell size={20} />, path: '/employee-notifications', badge: unreadCount },
        { name: 'Settings', icon: <Settings size={20} />, path: '/employee-settings' },
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
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-inner" style={{ backgroundColor: THEME_COLOR }}>M</div>
                        <h1 className="text-lg font-semibold text-white tracking-widest uppercase italic">MTBMS STAFF</h1>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => 
                                `flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${
                                    isActive 
                                    ? 'text-white shadow-lg shadow-indigo-500/10' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                            style={({ isActive }) => isActive ? { backgroundColor: THEME_COLOR } : {}}
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
                            <ChevronRight size={14} className={`transition-all ${'opacity-0 group-hover:opacity-100'}`} />
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all text-sm font-medium"
                    >
                        <LogOut size={20} />
                        <span>SECURE LOGOUT</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default EmployeeSidebar;
