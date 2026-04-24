import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from '../components/EmployeeSidebar';
import TopBar from '../components/TopBar';

const EmployeeLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#FFFDEB] font-inter overflow-x-hidden">
            <EmployeeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 lg:ml-72 flex flex-col min-h-screen min-w-0">
                <TopBar onToggleSidebar={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-8 lg:p-12 min-w-0">
                    <div className="w-full max-w-full mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;
