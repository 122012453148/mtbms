import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-between">
            <div className="relative w-96">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search size={18} />
                </span>
                <input 
                    type="text" 
                    placeholder="Search anything..." 
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                />
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
                    <Bell size={22} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-tight">{user?.role}</p>
                    </div>
                    {user?.profileImage ? (
                        <img 
                            src={user.profileImage} 
                            alt="avatar" 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm border border-slate-200">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
