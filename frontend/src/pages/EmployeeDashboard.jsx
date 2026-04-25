import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    CalendarCheck, UserCheck, Timer, 
    CheckCircle2, ClipboardList, LogIn, 
    LogOut as LogOutIcon, ArrowRight,
    Loader2, AlertCircle, Calendar, Bell
} from 'lucide-react';
import { toast } from 'react-toastify';

const THEME_PRIMARY = '#9B8EC7';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
        </div>
    </div>
);

const EmployeeDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [punchState, setPunchState] = useState({ checkInRaw: null, checkOutRaw: null, status: null });
    const [timer, setTimer] = useState(0);
    const [duration, setDuration] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [profile, setProfile] = useState(null);

    const fetchData = async () => {
        try {
            const { data: statsData } = await api.get('/employee-dashboard/stats');
            setStats(statsData);
            const { data: profileData } = await api.get('/auth/me');
            setProfile(profileData);
            
            const { data: history } = await api.get('/attendance/my');
            
            const isToday = (dateString) => {
                const d1 = new Date(dateString);
                const d2 = new Date();
                return d1.getFullYear() === d2.getFullYear() &&
                       d1.getMonth() === d2.getMonth() &&
                       d1.getDate() === d2.getDate();
            };

            const todayRecord = history.find(r => isToday(r.date));
            
            if (todayRecord) {
                const checkedIn = !!todayRecord.checkIn && !todayRecord.checkOut;
                setIsCheckedIn(checkedIn);
                
                setPunchState({
                    checkInRaw: todayRecord.checkIn,
                    checkOutRaw: todayRecord.checkOut,
                    status: todayRecord.status
                });

                if (todayRecord.checkIn) {
                    const start = new Date(todayRecord.checkIn);
                    const end = todayRecord.checkOut ? new Date(todayRecord.checkOut) : new Date();
                    const diffInSecs = Math.floor((end - start) / 1000);
                    setTimer(diffInSecs);
                }

                if (todayRecord.checkIn && todayRecord.checkOut) {
                    const diff = new Date(todayRecord.checkOut) - new Date(todayRecord.checkIn);
                    setDuration(formatTime(Math.floor(diff / 1000)));
                }
            } else {
                setIsCheckedIn(false);
                setPunchState({ checkInRaw: null, checkOutRaw: null, status: null });
                setTimer(0);
            }

            const { data: tasksData } = await api.get('/tasks/my');
            setTasks(tasksData || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => { 
        fetchData(); 
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let interval;
        if (isCheckedIn) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isCheckedIn]);

    const handleCheckIn = async () => {
        try {
            await api.post('/attendance/checkin');
            toast.success('Punched IN: Success');
            setIsCheckedIn(true);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post('/attendance/checkout');
            toast.success('Punched OUT: Recorded');
            setIsCheckedIn(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-out failed');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#9B8EC7]" size={40} /></div>;

    const isFullyDone = punchState.checkInRaw && punchState.checkOutRaw;
    const checkInTimeFormatted = punchState.checkInRaw ? new Date(punchState.checkInRaw).toLocaleTimeString() : null;
    const checkOutTimeFormatted = punchState.checkOutRaw ? new Date(punchState.checkOutRaw).toLocaleTimeString() : null;
    const todayDateFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 font-inter pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">MTBMS Employee Dashboard</h1>
                    <p className="text-[10px] md:text-sm text-slate-500 mt-2 flex items-center gap-2 font-black uppercase tracking-widest italic opacity-60">
                        <Calendar size={14} className="text-[#9B8EC7]" /> {todayDateFormatted}
                    </p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 md:p-3 rounded-2xl md:rounded-3xl border border-slate-50 shadow-2xl">
                    {!punchState.checkInRaw && !isCheckedIn && (
                        <button 
                            onClick={handleCheckIn}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-[#9B8EC7] text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] italic hover:bg-[#7E74C9] transition-all shadow-xl hover:scale-105 active:scale-95"
                        >
                            <LogIn size={18} /> CHECK IN
                        </button>
                    )}
                    {isCheckedIn && (
                        <button 
                            onClick={handleCheckOut}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-[#9B8EC7] text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] italic hover:bg-[#7E74C9] transition-all shadow-xl hover:scale-105 active:scale-95"
                        >
                            <LogOutIcon size={18} /> CHECK OUT
                        </button>
                    )}
                    {isFullyDone && (
                        <div className="px-8 py-4 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-700 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic flex items-center gap-3">
                            <CheckCircle2 size={18} /> SHIFT COMPLETE
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                <div className="md:col-span-1"><StatCard title="Shift Days" value={stats?.presentDays || 0} icon={<UserCheck size={20} />} color="bg-indigo-50 text-indigo-600" /></div>
                <div className="md:col-span-1"><StatCard title="Missing" value={stats?.absentDays || 0} icon={<AlertCircle size={20} />} color="bg-rose-50 text-rose-600" /></div>
                <div className="md:col-span-1"><StatCard title="Leaves" value={stats?.leavesTaken || 0} icon={<CalendarCheck size={20} />} color="bg-blue-50 text-blue-600" /></div>
                <div className="md:col-span-1 lg:col-span-1"><StatCard title="Task Queue" value={stats?.tasksAssigned || 0} icon={<ClipboardList size={20} />} color="bg-[#9B8EC7] text-white" /></div>
                <div className="col-span-2 md:col-span-1"><StatCard title="Milestones" value={stats?.tasksCompleted || 0} icon={<CheckCircle2 size={20} />} color="bg-emerald-50 text-emerald-600" /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-50 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Shift Status</h3>
                            <Bell size={16} className="text-[#9B8EC7]" />
                        </div>
                        <div className="space-y-10 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner ${punchState.checkInRaw ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-slate-50 text-slate-300'}`}>IN</div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight italic">Check-in Registered</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{checkInTimeFormatted || 'Pending Entry'}</p>
                                    </div>
                                </div>
                                {punchState.checkInRaw && <CheckCircle2 size={18} className="text-emerald-500" />}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner ${punchState.checkOutRaw ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-slate-50 text-slate-300'}`}>OUT</div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight italic">Check-out Logged</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{checkOutTimeFormatted || 'Shift active'}</p>
                                    </div>
                                </div>
                                {punchState.checkOutRaw && <CheckCircle2 size={18} className="text-[#9B8EC7]" />}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50">
                        {isCheckedIn && (
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 italic">Active Mission Timer</p>
                                <p className="text-4xl md:text-5xl font-black text-[#9B8EC7] tracking-tighter italic">{formatTime(timer)}</p>
                            </div>
                        )}
                        {isFullyDone && (
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 italic">Operational Duration</p>
                                <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">{duration}</p>
                                {punchState.status === 'Absent' && (
                                    <p className="text-[9px] font-black mt-4 text-rose-500 bg-rose-50 inline-block px-4 py-2 rounded-xl uppercase tracking-widest italic border border-rose-100">Protocol Threshold Not Met</p>
                                )}
                            </div>
                        )}
                        {!isCheckedIn && !isFullyDone && (
                            <div className="text-center py-4">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Awaiting Protocol Initialization</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-[#9B8EC7] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white shadow-[0_20px_50px_rgba(155,142,199,0.3)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9B8EC7] to-[#7E74C9] rounded-3xl transform rotate-3 scale-[1.02] opacity-20 transition-transform group-hover:rotate-6"></div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Mission Objectives</h3>
                        <div className="bg-white/10 p-3 rounded-2xl text-white shadow-xl"><ClipboardList size={20} /></div>
                    </div>
                    <div className="space-y-4 md:space-y-6 relative z-10">
                        {tasks.slice(0, 5).map((t, i) => (
                            <div 
                                key={i} 
                                onClick={() => window.location.href='/employee-tasks'}
                                className="group bg-white/10 hover:bg-white/20 p-6 rounded-[1.5rem] md:rounded-[2rem] transition-all cursor-pointer flex items-center justify-between border border-white/10 hover:border-white/30 hover:translate-x-2"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-3 h-3 rounded-full ${t.priority === 'High' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]' : t.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                                    <div>
                                        <p className="text-sm md:text-base font-black tracking-tight text-white mb-2 group-hover:text-amber-200 transition-colors uppercase italic">{t.title}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-[9px] text-white/60 font-black uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5">PRIORITY: <span className={t.priority === 'High' ? 'text-rose-400' : 'text-white'}>{t.priority || 'NORMAL'}</span></span>
                                            <span className="opacity-30">|</span>
                                            <span className="flex items-center gap-1.5">PROTOCOL: <span className={t.status === 'Completed' ? 'text-emerald-300' : 'text-white'}>{t.status}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#9B8EC7] transition-all shadow-lg border border-white/10">
                                    <ArrowRight size={20} className="text-white" />
                                </div>
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <div className="text-center py-20 flex flex-col items-center gap-6 opacity-20">
                                <AlertCircle size={48} />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">No Mission Objectives Detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
