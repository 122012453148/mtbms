import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#FFFDEB] font-sans overflow-x-hidden">
            {/* Sidebar with responsive props */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main content adjusts margin on large screens */}
            <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
                <TopBar onToggleSidebar={() => setIsSidebarOpen(true)} />
                
                <main className="flex-1 p-4 md:p-8 lg:p-12">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
                
                <footer className="px-6 md:px-12 py-8 text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between gap-4 border-t border-slate-200/50">
                    <span>MTBMS ENTERPRISE EDITION V2.0</span>
                    <span>SYSTEM OPERATIONAL - {new Date().getFullYear()}</span>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
