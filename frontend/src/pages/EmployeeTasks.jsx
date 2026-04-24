import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    ClipboardList, AlertCircle, Clock, 
    CheckCircle, PlayCircle, Loader2,
    Calendar, MoreVertical
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const EmployeeTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks/my');
            setTasks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchTasks(); 

        socket.on('taskAssigned', (task) => {
            // Check if task is assigned to ME
            fetchTasks(); // Easier than manual check if populated
        });

        socket.on('taskUpdated', (updatedTask) => {
            setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
        });

        socket.on('taskDeleted', (deletedId) => {
            setTasks(prev => prev.filter(t => t._id !== deletedId));
        });

        return () => {
            socket.off('taskAssigned');
            socket.off('taskUpdated');
            socket.off('taskDeleted');
        };
    }, []);

    const updateStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            toast.success(`Task status updated: ${newStatus}`);
            fetchTasks();
        } catch (error) {
            toast.error('Workflow update failed');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#161E54]" size={40} /></div>;

    const categories = ['Pending', 'In Progress', 'Completed'];

    return (
        <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 font-inter pb-20">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Mission Assignments</h1>
                <p className="text-[10px] md:text-sm text-slate-500 mt-2 font-black uppercase tracking-widest italic opacity-60">Track development and operational tasks assigned to your profile</p>
            </div>

            <div className="flex overflow-x-auto gap-6 md:gap-8 pb-8 no-scrollbar h-[calc(100vh-250px)] min-h-[500px]">
                {categories.map(cat => (
                    <div key={cat} className="flex flex-col bg-slate-50/50 rounded-[2.5rem] md:rounded-[3rem] border border-slate-50 p-5 md:p-8 min-w-[300px] md:min-w-[350px] lg:flex-1">
                        <div className="flex items-center justify-between px-3 mb-8">
                            <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic">{cat}</h3>
                            <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-xl shadow-lg">
                                {tasks.filter(t => t.status === cat).length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-1">
                            {tasks.filter(t => t.status === cat).map(task => (
                                <div key={task._id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                    {cat === 'In Progress' && <div className="absolute top-0 left-0 w-full h-1.5 bg-[#CE2626] animate-pulse"></div>}
                                    
                                    <div className="flex justify-between items-start mb-6">
                                        <h4 className="text-sm md:text-base font-black text-slate-900 group-hover:text-[#CE2626] transition-colors leading-tight uppercase italic">{task.title}</h4>
                                        <button className="p-1.5 text-slate-200 hover:text-slate-900 transition-all"><MoreVertical size={16} /></button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                            task.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            {task.priority || 'NORMAL'} LEVEL
                                        </span>
                                    </div>
                                    <p className="text-[10px] md:text-xs text-slate-400 font-medium mb-8 line-clamp-3 leading-relaxed uppercase tracking-tight italic">{task.description}</p>
                                    
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                            <Calendar size={12} className="text-[#CE2626]" /> {new Date(task.deadline).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                                        {cat === 'Pending' && (
                                            <button 
                                                onClick={() => updateStatus(task._id, 'In Progress')}
                                                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] italic hover:bg-[#CE2626] transition-all shadow-xl hover:scale-105 active:scale-95"
                                            >
                                                <PlayCircle size={16} /> INITIALIZE
                                            </button>
                                        )}
                                        {cat === 'In Progress' && (
                                            <button 
                                                onClick={() => updateStatus(task._id, 'Completed')}
                                                className="w-full flex items-center justify-center gap-3 py-4 bg-[#CE2626] text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] italic hover:bg-emerald-600 transition-all shadow-xl hover:scale-105 active:scale-95"
                                            >
                                                <CheckCircle size={16} /> TERMINATE
                                            </button>
                                        )}
                                        {cat === 'Completed' && (
                                            <div className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] italic border border-emerald-100">
                                                <CheckCircle size={16} /> VERIFIED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {tasks.filter(t => t.status === cat).length === 0 && (
                                <div className="h-40 flex flex-col items-center justify-center border-4 border-dashed border-slate-50 rounded-[2.5rem] p-10 opacity-20">
                                    <ClipboardList size={32} className="text-slate-400 mb-4" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-center">Protocol Queue Clear</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployeeTasks;
