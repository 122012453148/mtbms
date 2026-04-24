import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, Package, Users, Briefcase, 
    TrendingUp, FileBarChart, Bell, Settings, 
    LogOut, ChevronRight, IndianRupee, Star, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Staffs', icon: <Users size={20} />, path: '/staffs' },
        { name: 'Materials', icon: <Package size={20} />, path: '/materials' },
        { name: 'Customers', icon: <Users size={20} />, path: '/sales-customers' },
        { name: 'Acquisition Board', icon: <Briefcase size={20} />, path: '/admin-acquisition' },
        { name: 'ERP', icon: <Briefcase size={20} />, path: '/erp' },
        { name: 'Deal Approvals', icon: <TrendingUp size={20} />, path: '/admin-approvals' },
        { name: 'Audit', icon: <FileBarChart size={20} />, path: '/audit' },
        { name: 'Revenue', icon: <IndianRupee size={20} />, path: '/revenue' },
        { name: 'Reports', icon: <FileBarChart size={20} />, path: '/reports' },
        { name: 'Notifications', icon: <Bell size={20} />, path: '/notifications' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <div className={`w-72 bg-slate-900 h-screen fixed left-0 top-0 text-slate-300 flex flex-col shadow-2xl z-[60] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#CE2626] rounded-lg flex items-center justify-center font-bold text-white text-lg">M</div>
                        <h1 className="text-lg font-semibold text-white tracking-tight">MTBMS ADMIN</h1>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                        <X size={20} />
                    </button>
                </div>

            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <div key={item.name} className="space-y-1">
                        <NavLink
                            to={item.path}
                            className={({ isActive }) => 
                                `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group ${
                                    isActive 
                                    ? 'bg-[#CE2626] text-white shadow-sm font-black' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                                }`
                            }
                        >
                            <span className="text-slate-500 group-hover:text-white transition-colors">
                                {item.icon}
                            </span>
                            <span className="text-sm tracking-tight uppercase italic text-[10px]">{item.name}</span>
                        </NavLink>
                        {item.sub && (
                            <div className="pl-12 space-y-1 py-1">
                                {item.sub.map((s) => (
                                    <NavLink 
                                        key={s.name} 
                                        to={s.path}
                                        className={({ isActive }) => 
                                            `block py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                                                isActive ? 'text-[#CE2626] border-l-2 border-[#CE2626] pl-3' : 'text-slate-500 hover:text-white pl-2'
                                            }`
                                        }
                                    >
                                        {s.name}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all font-bold"
                >
                    <LogOut size={20} />
                    <span>SESSION LOGOUT</span>
                </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
