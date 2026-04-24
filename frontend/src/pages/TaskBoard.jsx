import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Plus, Search, Clock, CheckCircle2, 
    MoreVertical, User, Calendar, Trash2,
    Loader2, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('https://mtbms.onrender.com');

const TaskBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'Medium',
        deadline: ''
    });

    const fetchData = async () => {
        try {
            const [tRes, eRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/users/staff')
            ]);
            setTasks(tRes.data);
            setTeam(eRes.data);
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            toast.error(`Sync Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
        // Socket listeners remain the same...
    }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', newTask);
            toast.success('Task initialized and assigned');
            setNewTask({ title: '', description: '', assignedTo: '', priority: 'Medium', deadline: '' });
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Assignment failed');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/tasks/${id}`, { status });
            toast.success(`Task status: ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Sync error');
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Remove this objective?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            toast.success('Task removed');
            fetchData();
        } catch (error) {
            toast.error('Deletion error');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-inter pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Mission Control</h1>
                    <p className="text-[10px] md:text-sm text-slate-500 mt-1 font-medium italic uppercase tracking-wider">Direct workload distribution & monitoring</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full lg:w-auto bg-[#CE2626] text-white px-8 py-4 rounded-2xl text-[10px] md:text-xs font-black transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 tracking-[0.2em] italic"
                >
                    <Plus size={18} /> INITIALIZE TASK
                </button>
            </div>

            <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                {['All Tasks', 'High Priority', 'Pending Review', 'Completed Exports'].map((p, i) => (
                    <button key={i} className={`px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${i === 0 ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>
                        {p}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-6">
                    <div className="relative">
                        <Loader2 className="animate-spin text-[#CE2626]" size={40} />
                        <div className="absolute inset-0 bg-rose-500/10 blur-xl rounded-full"></div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] italic animate-pulse">Syncing task grid...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {tasks.map(task => (
                        <div key={task._id} className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 shadow-sm flex flex-col justify-between group transition-all hover:shadow-xl hover:-translate-y-1">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(task.status)}`}>
                                            {task.status}
                                        </span>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getPriorityStyle(task.priority)}`}>
                                            {task.priority || 'Medium'}
                                        </span>
                                    </div>
                                    <button onClick={() => deleteTask(task._id)} className="p-2 text-slate-200 hover:text-[#CE2626] hover:bg-rose-50 rounded-xl transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h3 className="text-base md:text-lg font-black text-slate-900 mb-3 tracking-tight italic uppercase">{task.title}</h3>
                                <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed mb-8 line-clamp-3">{task.description}</p>
                            </div>
                            
                            <div className="pt-6 border-t border-slate-50 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg">
                                            {task.assignedTo?.name?.[0] || '?' }
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Assignee</p>
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{task.assignedTo?.name || 'Unassigned'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar size={14} className="text-[#CE2626]" />
                                        <span className="text-[10px] font-black uppercase tracking-tight">{new Date(task.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => updateStatus(task._id, 'In Progress')}
                                        className="py-3 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all italic border border-transparent hover:border-blue-100"
                                    >
                                        Activate
                                    </button>
                                    <button 
                                        onClick={() => updateStatus(task._id, 'Completed')}
                                        className="py-3 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all italic border border-transparent hover:border-emerald-100"
                                    >
                                        Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-[2rem] md:rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
                        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-black tracking-[0.2em] uppercase text-sm italic">Create Work Objective</h2>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Operational Directive Protocol</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/10 rounded-xl hover:text-[#CE2626] transition-all">✕</button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-8 md:p-10 space-y-6 md:space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 italic">Objective Designation</label>
                                <input 
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    required placeholder="Brief task name"
                                    value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 italic">Mission Parameters</label>
                                <textarea 
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tight resize-none h-28 focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    placeholder="Task details..."
                                    value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 italic">Assign Personnel</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        required value={newTask.assignedTo} onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                                    >
                                        <option value="">Select Staff</option>
                                        {team.map(e => <option key={e._id} value={e._id}>{e.name || e.username}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 italic">Threat Level</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        required value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                                    >
                                        <option value="Low">Low Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="High">High Priority</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 italic">Execution Deadline</label>
                                    <input 
                                        type="date" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] md:text-xs font-black uppercase focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        required value={newTask.deadline} onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button className="w-full bg-[#CE2626] text-white py-5 rounded-[2rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] italic shadow-2xl shadow-rose-500/30 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                AUTHORIZE MISSION
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>

    );
};

export default TaskBoard;
