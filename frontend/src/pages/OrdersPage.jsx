import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    ShoppingBag, Search, Clock, CheckCircle, 
    AlertCircle, Truck, MoreHorizontal,
    Filter, Download, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch (error) { toast.error('Sync failure'); } finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-600';
            case 'Processing': return 'bg-blue-50 text-blue-600';
            case 'Cancelled': return 'bg-rose-50 text-rose-600';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 font-inter">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Order Lifecycle Hub</h1>
                    <p className="text-slate-500 font-medium italic mt-1 italic">Tracking {orders.length} active fulfillment requests</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 border border-slate-200 rounded-xl text-xs font-black text-slate-600 bg-white hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Download size={16} /> LOGISTICS MANIFEST
                    </button>
                    {['Admin', 'sales', 'manager'].includes(user?.role) && (
                        <button className="px-8 py-3 bg-[#CE2626] text-white rounded-xl text-xs font-black shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                            New Purchase Order
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Pending Fulfillment', count: orders.filter(o => o.status === 'Pending').length, color: 'text-amber-500' },
                    { label: 'In Production', count: orders.filter(o => o.status === 'Processing').length, color: 'text-blue-500' },
                    { label: 'Delivered Today', count: orders.filter(o => o.status === 'Delivered').length, color: 'text-emerald-500' },
                    { label: 'Dispatch Alerts', count: 0, color: 'text-[#CE2626]' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-4">{stat.label}</p>
                        <h4 className={`text-2xl font-black ${stat.color}`}>{stat.count}</h4>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by Order ID or Client..." 
                            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-xl text-sm font-bold shadow-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                            <tr>
                                <th className="px-10 py-6">Fulfillment Identity</th>
                                <th className="px-6 py-6">Contract Client</th>
                                <th className="px-6 py-6">Deal Value</th>
                                <th className="px-6 py-6">Logistics Phase</th>
                                <th className="px-6 py-6 text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-slate-900 text-white rounded-xl">
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase">#{order._id.substring(18)}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{new Date(order.createdAt).toDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-sm font-bold text-slate-700">{order.customer?.customerName || 'Standard Client'}</p>
                                        <p className="text-[10px] text-slate-400 font-medium italic">Priority Support Level</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-sm font-black text-slate-900">${order.totalAmount.toLocaleString()}</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${order.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {order.paymentStatus}
                                        </p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center text-slate-300 font-black italic uppercase tracking-widest text-xs">
                                        No Fulfillment Cycles Active
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
