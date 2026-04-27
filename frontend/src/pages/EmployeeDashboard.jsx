import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    CalendarCheck, UserCheck, Timer, 
    CheckCircle2, ClipboardList, LogIn, 
    LogOut as LogOutIcon, ArrowRight,
    Loader2, AlertCircle, Calendar, Bell, Clock
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
    const [checkInTime, setCheckInTime] = useState(null);
    const [timer, setTimer] = useState("00:00:00");
    const [todayRecord, setTodayRecord] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [profile, setProfile] = useState(null);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const syncAttendance = async () => {
        try {
            const { data: history } = await api.get('/attendance/my');
            const todayStr = new Date().toISOString().split('T')[0];
            
            const found = (history || []).find(r => {
                if (!r.date) return false;
                try {
                    const d = new Date(r.date);
                    return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === todayStr;
                } catch (e) {
                    return false;
                }
            });

            if (found) {
                setTodayRecord(found);
                const checkInVal = found.checkIn ? new Date(found.checkIn).getTime() : null;
                
                if (checkInVal && !found.checkOut) {
                    setIsCheckedIn(true);
                    setCheckInTime(checkInVal);
                    localStorage.setItem('checkInTimestamp', checkInVal.toString());
                } else {
                    setIsCheckedIn(false);
                    setCheckInTime(null);
                    localStorage.removeItem('checkInTimestamp');
                }
            } else {
                setTodayRecord(null);
                setIsCheckedIn(false);
                setCheckInTime(null);
                localStorage.removeItem('checkInTimestamp');
            }
        } catch (error) {
            console.error('Attendance sync error:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, profileRes, tasksRes] = await Promise.all([
                api.get('/employee-dashboard/stats'),
                api.get('/auth/me'),
                api.get('/tasks/my')
            ]);
            setStats(statsRes.data);
            setProfile(profileRes.data);
            setTasks(tasksRes.data || []);
            await syncAttendance();
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const poll = setInterval(syncAttendance, 30000); // Sync with server every 30s
        return () => clearInterval(poll);
    }, []);

    // Dedicated Real-Time Timer Effect
    useEffect(() => {
        let interval;
        const savedTime = localStorage.getItem('checkInTimestamp');
        const effectiveStartTime = checkInTime || (savedTime ? parseInt(savedTime) : null);

        if (isCheckedIn && effectiveStartTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.max(0, Math.floor((now - effectiveStartTime) / 1000));
                setTimer(formatTime(diff));
            }, 1000);
        } else {
            setTimer("00:00:00");
        }
        return () => clearInterval(interval);
    }, [isCheckedIn, checkInTime]);

    const handleCheckIn = async () => {
        const now = Date.now();
        // Step 2: Immediately change to Check-out
        setIsCheckedIn(true);
        setCheckInTime(now);
        localStorage.setItem('checkInTimestamp', now);
        
        try {
            const { data } = await api.post('/attendance/checkin');
            // Sync with actual server time if different
            const serverTime = new Date(data.checkIn).getTime();
            setCheckInTime(serverTime);
            localStorage.setItem('checkInTimestamp', serverTime);
            toast.success('Punched IN: Success');
            syncAttendance();
        } catch (error) {
            const msg = error.response?.data?.message;
            if (msg === 'Already checked in today') {
                syncAttendance(); // Just sync if already checked in
            } else {
                setIsCheckedIn(false);
                setCheckInTime(null);
                localStorage.removeItem('checkInTimestamp');
                toast.error(msg || 'Check-in failed');
            }
        }
    };

    const handleCheckOut = async () => {
        setIsCheckedIn(false);
        setCheckInTime(null);
        localStorage.removeItem('checkInTimestamp');
        
        try {
            await api.post('/attendance/checkout');
            toast.success('Punched OUT: Recorded');
            syncAttendance();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-out failed');
            syncAttendance();
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#9B8EC7]" size={40} /></div>;

    const todayDateFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const isFullyDone = todayRecord?.checkIn && todayRecord?.checkOut;

    return (
        <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 font-inter pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">MTBMS Employee Dashboard</h1>
                        <p className="text-[10px] md:text-sm text-slate-500 mt-2 flex items-center gap-2 font-black uppercase tracking-widest italic opacity-60">
                            <Calendar size={14} className="text-[#9B8EC7]" /> {todayDateFormatted}
                        </p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center">
                        {!isCheckedIn && !isFullyDone ? (
                            <button 
                                onClick={handleCheckIn}
                                className="w-44 px-6 py-3 bg-[#22C55E] text-white text-[10px] md:text-xs font-black uppercase tracking-[0.15em] italic rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <LogIn size={18} /> <span>CHECK IN</span>
                            </button>
                        ) : isCheckedIn ? (
                            <button 
                                onClick={handleCheckOut}
                                className="w-44 px-6 py-3 bg-[#EF4444] text-white text-[10px] md:text-xs font-black uppercase tracking-[0.15em] italic rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <LogOutIcon size={18} /> <span>CHECK OUT</span>
                            </button>
                        ) : (
                            <div className="w-44 px-6 py-3 bg-emerald-50 text-emerald-700 text-[10px] md:text-xs font-black uppercase tracking-[0.15em] italic rounded-full border border-emerald-100 flex items-center justify-center gap-3">
                                <CheckCircle2 size={18} /> <span>SHIFT COMPLETE</span>
                            </div>
                        )}
                    </div>
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
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner ${todayRecord?.checkIn ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-slate-50 text-slate-300'}`}>IN</div>
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-tight italic ${isCheckedIn ? 'text-emerald-600' : 'text-slate-800'}`}>
                                            {isCheckedIn ? 'Checked In' : (todayRecord?.checkIn ? 'Check-in Registered' : 'Check-in Pending')}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                            {todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : 'Pending Entry'}
                                        </p>
                                    </div>
                                </div>
                                {todayRecord?.checkIn && <CheckCircle2 size={18} className="text-emerald-500" />}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner ${todayRecord?.checkOut ? 'bg-[#FEE2E2] text-[#991B1B]' : (isCheckedIn ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-300')}`}>OUT</div>
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-tight italic ${isCheckedIn ? 'text-rose-600' : 'text-slate-800'}`}>Check-out Logged</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                            {todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : (isCheckedIn ? 'Session Active' : 'Shift inactive')}
                                        </p>
                                    </div>
                                </div>
                                {todayRecord?.checkOut ? <CheckCircle2 size={18} className="text-[#9B8EC7]" /> : isCheckedIn && <Clock size={18} className="text-rose-500 animate-pulse" />}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50">
                        {isCheckedIn && (
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 italic">Active Mission Timer</p>
                                <p className="text-4xl md:text-5xl font-black text-[#EF4444] tracking-tighter italic">{timer}</p>
                            </div>
                        )}
                        {isFullyDone && (
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 italic">Operational Duration</p>
                                <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">
                                    {formatTime(Math.floor((new Date(todayRecord.checkOut) - new Date(todayRecord.checkIn)) / 1000))}
                                </p>
                            </div>
                        )}
                        {!isCheckedIn && !isFullyDone && (
                            <div className="text-center py-4">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Awaiting Protocol Initialization</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-[#9B8EC7] p-8 md:p-12 rounded-[2rem] md:rounded-[4.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:scale-150 duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] italic">Mission Objectives</h3>
                            <div className="p-3 bg-white/10 rounded-2xl text-white"><ClipboardList size={20} /></div>
                        </div>
                        
                        <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                            {tasks.length > 0 ? tasks.map((task) => (
                                <div key={task._id} className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                                            task.priority === 'High' ? 'bg-rose-500 text-white' : 'bg-white/20 text-white'
                                        }`}>{task.priority} Priority</span>
                                        <ArrowRight size={14} className="text-white/40" />
                                    </div>
                                    <h4 className="text-lg font-black text-white tracking-tight leading-tight mb-2">{task.title}</h4>
                                    <p className="text-xs text-white/60 font-medium line-clamp-2">{task.description}</p>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 text-white/30 border-2 border-dashed border-white/10 rounded-[3rem]">
                                    <AlertCircle size={48} className="mb-4 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">No Mission Objectives Detected</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-4xl font-black text-white tracking-tighter italic">{(tasks.filter(t => t.status === 'Completed').length / (tasks.length || 1) * 100).toFixed(0)}%</p>
                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-1 italic">Objective Completion Rate</p>
                        </div>
                        <button className="px-8 py-4 bg-white text-[#9B8EC7] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl italic">
                            Full Briefing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
