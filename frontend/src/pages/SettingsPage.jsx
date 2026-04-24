import React, { useState } from 'react';
import { 
    Settings, Shield, Bell, 
    Database, Globe, Save, 
    RefreshCcw, UserCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';

const SettingsPage = () => {
    const [config, setConfig] = useState({
        systemName: 'MTBMS ADMIN',
        backupFreq: 'Daily',
        publicAccess: false,
        notifyThreshold: 50
    });

    const handleSave = () => {
        toast.success('System configuration preserved');
    };

    return (
        <div className="max-w-4xl space-y-12">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Infrastructure Settings</h1>
                <p className="text-slate-500 font-medium italic mt-1 font-bold uppercase tracking-widest text-[10px]">Administrative overrides and system configuration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="md:col-span-1 space-y-2">
                    {['General', 'Security', 'Data', 'Network'].map(m => (
                        <button key={m} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${m === 'General' ? 'bg-[#CE2626] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
                            {m}
                        </button>
                    ))}
                </div>

                <div className="md:col-span-3 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="space-y-6 pb-8 border-b border-slate-50">
                        <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                            <Settings size={18} className="text-[#CE2626]" /> System Identity
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Application Display Name</label>
                                <input 
                                    type="text" value={config.systemName} 
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#CE2626]/20 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pb-8 border-b border-slate-50">
                        <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                            <Database size={18} className="text-[#CE2626]" /> Storage & Precision
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                            <div>
                                <p className="text-xs font-black text-slate-700">Automated DB Snapshots</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Incremental cloud redundancy</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">MANUAL BACKUP</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                            <Shield size={18} className="text-[#CE2626]" /> Security Protocols
                        </h3>
                        <div className="flex items-center justify-between p-6 bg-brand-bg/30 rounded-2xl border border-[#CE2626]/5">
                           <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm"><RefreshCcw className="text-[#CE2626]" size={16}/></div>
                                <div>
                                    <p className="text-xs font-black text-slate-700">Root Password Reset</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Last updated: 42 days ago</p>
                                </div>
                           </div>
                           <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">RESET KEY</button>
                        </div>
                    </div>

                    <div className="pt-8 self-end">
                        <button 
                            onClick={handleSave}
                            className="w-full py-4 bg-[#CE2626] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                        >
                            <Save size={18}/> SAVE INFRASTRUCTURE CHANGES
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
