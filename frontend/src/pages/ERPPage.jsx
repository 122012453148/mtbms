import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    ShoppingCart, Truck, CreditCard, Plus, 
    Clock, CheckCircle, Package, Search,
    Filter, MoreVertical, Building2, MapPin,
    Calendar, AlertTriangle, UserCheck, ShieldCheck,
    IndianRupee, ArrowRight, Eye, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io('http://localhost:5000');

const ERPPage = () => {
    const { user } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [financialSummary, setFinancialSummary] = useState({ totalSpent: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    
    // Modals
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showPOModal, setShowPOModal] = useState(false);
    const [viewVendors, setViewVendors] = useState(false);

    // Form States
    const [vendorForm, setVendorForm] = useState({ 
        name: '', 
        contactPerson: '', 
        email: '', 
        phone: '', 
        location: '', 
        materialType: 'Other' 
    });
    const [poForm, setPoForm] = useState({ 
        vendor: '', 
        material: 'TATA', 
        quantity: 1, 
        rate: 0, 
        deliveryDate: '' 
    });

    const fetchData = async () => {
        try {
            const [vRes, oRes, mRes, sRes] = await Promise.all([
                api.get('/vendors'),
                api.get('/orders'),
                api.get('/materials'),
                api.get('/orders/summary')
            ]);
            setVendors(vRes.data);
            setOrders(oRes.data);
            setMaterials(mRes.data);
            setFinancialSummary(sRes.data);
        } catch (error) {
            toast.error('Strategic sync failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
        socket.on('orderCreated', fetchData);
        socket.on('orderUpdated', fetchData);
        socket.on('vendorCreated', fetchData);
        return () => {
            socket.off('orderCreated');
            socket.off('orderUpdated');
            socket.off('vendorCreated');
        };
    }, []);

    const handleAddVendor = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vendors', vendorForm);
            toast.success('Strategic Supplier Authorized');
            setShowVendorModal(false);
            setVendorForm({ name: '', contactPerson: '', email: '', phone: '', location: '', materialType: 'Other' });
            fetchData();
        } catch (err) { toast.error('Onboarding protocol breach'); }
    };

    const handleCreatePO = async (e) => {
        e.preventDefault();
        try {
            await api.post('/orders', poForm);
            toast.success('Purchase Directive Issued');
            setShowPOModal(false);
            setPoForm({ vendor: '', material: 'TATA', quantity: 1, rate: 0, deliveryDate: '' });
            fetchData();
        } catch (err) { toast.error('PO Authorization failure'); }
    };

    const handleApprovePO = async (id) => {
        try {
            await api.put(`/orders/approve/${id}`);
            toast.success('PO Authorization Granted');
            fetchData();
        } catch (err) { toast.error('Strategic clearance failure'); }
    };

    const handleDeliverPO = async (id) => {
        try {
            await api.put(`/orders/deliver/${id}`);
            toast.success('Stock Synchronized & PO Fulfilled');
            fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Fulfillment error'); }
    };

    const lowStockAlerts = materials.filter(m => m.quantity < m.threshold);

    if (loading) return <div className="h-screen flex items-center justify-center animate-pulse"><Package className="text-[#CE2626] animate-bounce" size={48}/></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 font-inter">
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Procurement & ERP</h1>
                    <p className="text-slate-400 font-black mt-1 text-[10px] uppercase tracking-[0.4em] italic">Manage vendors, purchase orders, and financial tracking</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <button 
                        onClick={() => setViewVendors(true)}
                        className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Vendors
                    </button>
                    <button 
                        onClick={() => setShowPOModal(true)}
                        className="bg-[#CE2626] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> New Purchase Order
                    </button>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockAlerts.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Low Stock Protocol Active</h4>
                            <p className="text-[10px] text-amber-700/60 font-bold uppercase tracking-wider">{lowStockAlerts.length} Critical resources require replenishment</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {lowStockAlerts.slice(0, 3).map(m => (
                            <span key={m._id} className="px-3 py-1 bg-white border border-amber-200 rounded-lg text-[9px] font-black text-amber-600 uppercase">
                                {m.name}: {m.quantity}T
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {showVendorModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-black uppercase tracking-widest text-sm italic">Supplier Onboarding</h2>
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Vendor Network v2.0</p>
                            </div>
                            <button onClick={() => setShowVendorModal(false)} className="bg-white/10 p-2 rounded-xl text-slate-400 hover:text-white transition-all font-black">✕</button>
                        </div>
                        <form onSubmit={handleAddVendor} className="p-10 space-y-6">
                            <div className="space-y-4">
                                <input type="text" placeholder="Vendor Entity Name" required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none" value={vendorForm.name} onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Location" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none" value={vendorForm.location} onChange={(e) => setVendorForm({...vendorForm, location: e.target.value})} />
                                    <select className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none" value={vendorForm.materialType} onChange={(e) => setVendorForm({...vendorForm, materialType: e.target.value})}>
                                        <option value="TATA">TATA Steel</option>
                                        <option value="JSW">JSW Steel</option>
                                        <option value="SAIL">SAIL</option>
                                        <option value="Vizag Steel">Vizag Steel</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="email" placeholder="Email" required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none" value={vendorForm.email} onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})} />
                                    <input type="text" placeholder="Phone" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none" value={vendorForm.phone} onChange={(e) => setVendorForm({...vendorForm, phone: e.target.value})} />
                                </div>
                            </div>
                            <button className="w-full py-6 bg-[#CE2626] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">COMMIT ONBOARDING</button>
                        </form>
                    </div>
                </div>
            )}

            {showPOModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-black uppercase tracking-widest text-sm italic">Procurement Directive</h2>
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Capital Expenditure Auth</p>
                            </div>
                            <button onClick={() => setShowPOModal(false)} className="bg-white/10 p-2 rounded-xl text-slate-400 hover:text-white transition-all font-black">✕</button>
                        </div>
                        <form onSubmit={handleCreatePO} className="p-12 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier Entity</label>
                                    <select className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest outline-none" value={poForm.vendor} onChange={(e) => setPoForm({...poForm, vendor: e.target.value})} required>
                                        <option value="">Select Vendor</option>
                                        {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Material Specification</label>
                                    <select className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest outline-none" value={poForm.material} onChange={(e) => setPoForm({...poForm, material: e.target.value})} required>
                                        <option value="TATA">TATA Steel</option>
                                        <option value="JSW">JSW Steel</option>
                                        <option value="SAIL">SAIL</option>
                                        <option value="Vizag Steel">Vizag Steel</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Net Weight (Tons)</label>
                                    <input type="number" step="0.01" className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black outline-none" value={poForm.quantity} onChange={(e) => setPoForm({...poForm, quantity: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate per Ton (₹)</label>
                                    <input type="number" className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black outline-none" value={poForm.rate} onChange={(e) => setPoForm({...poForm, rate: e.target.value})} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Delivery Date</label>
                                    <input type="date" className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black outline-none" value={poForm.deliveryDate} onChange={(e) => setPoForm({...poForm, deliveryDate: e.target.value})} required />
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Net Payable</span>
                                <span className="text-xl font-black text-slate-900 flex items-center gap-1"><IndianRupee size={20}/>{(poForm.quantity * poForm.rate).toLocaleString()}</span>
                            </div>

                            <button className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">AUTHORIZE PURCHASE DIRECTIVE</button>
                        </form>
                    </div>
                </div>
            )}

            {viewVendors && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[80vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className="bg-slate-900 p-10 flex justify-between items-center text-white shrink-0">
                            <div>
                                <h2 className="font-black uppercase tracking-widest text-sm italic">Verified Supplier Register</h2>
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 italic">Logistical Strategic Partnerships</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => { setViewVendors(false); setShowVendorModal(true); }} className="px-6 py-3 bg-[#CE2626] rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20">Add Strategic Partner</button>
                                <button onClick={() => setViewVendors(false)} className="bg-white/10 p-3 rounded-xl text-slate-400 hover:text-white transition-all font-black">✕</button>
                            </div>
                        </div>
                        <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="pb-6">Entity / location</th>
                                        <th className="pb-6">Engagement Core</th>
                                        <th className="pb-6">Contact protocol</th>
                                        <th className="pb-6 text-right">Reputation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {vendors.map(v => (
                                        <tr key={v._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">{v.name[0]}</div>
                                                    <div>
                                                        <p className="font-black text-slate-900 uppercase tracking-tight">{v.name}</p>
                                                        <p className="text-[9px] text-[#CE2626] font-black uppercase tracking-widest flex items-center gap-1"><MapPin size={8}/>{v.location || 'Global'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                    {v.materialType}
                                                </span>
                                            </td>
                                            <td className="py-6 leading-none">
                                                <p className="text-[10px] font-black text-slate-500 uppercase">{v.email}</p>
                                                <p className="text-[9px] font-bold text-slate-400 mt-1">{v.phone}</p>
                                            </td>
                                            <td className="py-6 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {[1,2,3,4,5].map(s => <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= (v.rating || 5) ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-slate-100'}`}></div>)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-3 italic">
                                <ShoppingCart size={20} className="text-[#CE2626]" />
                                Procurement Logbook
                            </h2>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-100"></div>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {orders.map(order => (
                                <div key={order._id} className="p-8 flex items-center justify-between hover:bg-slate-50/80 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase tracking-tight">{order.vendor?.name}</h4>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">PO #{order._id.substring(18).toUpperCase()}</p>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <p className="text-[9px] font-black text-[#CE2626] uppercase tracking-[0.2em]">{order.material} • {order.quantity} Tons</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 text-right">
                                        <div>
                                            <p className="font-black text-slate-900 flex items-center justify-end gap-0.5"><IndianRupee size={12}/>{order.totalAmount.toLocaleString()}</p>
                                            <div className={`inline-flex items-center gap-1.5 text-[8px] font-black uppercase px-3 py-1 rounded-full mt-2 tracking-widest border ${
                                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                order.status === 'Approved' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {order.status === 'Delivered' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                {order.status}
                                            </div>
                                        </div>
                                        {/* Row Actions */}
                                        <div className="flex gap-2">
                                            {order.status === 'Pending' && user.role === 'Admin' && (
                                                <button onClick={() => handleApprovePO(order._id)} className="p-3 bg-slate-900 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"><ShieldCheck size={16}/></button>
                                            )}
                                            {order.status === 'Approved' && (
                                                <button onClick={() => handleDeliverPO(order._id)} className="p-3 bg-[#CE2626] text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-rose-500/20"><Truck size={16}/></button>
                                            )}
                                            <button className="p-3 bg-white border border-slate-100 text-slate-300 rounded-xl hover:text-slate-900 transition-all"><Eye size={16}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#CE2626] rounded-full blur-3xl opacity-20 -mb-16 -mr-16 group-hover:scale-150 transition-all duration-1000"></div>
                        <h2 className="font-black text-xs uppercase tracking-[0.4em] mb-8 flex items-center gap-2 italic text-slate-500">
                            <Truck size={16} className="text-[#CE2626]" />
                            Supply Matrix
                        </h2>
                        <div className="space-y-8">
                            {vendors.slice(0, 4).map((vendor, idx) => (
                                <div key={vendor._id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-[#CE2626] border border-slate-700 shadow-inner">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tight">{vendor.name}</p>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">{vendor.materialType}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map(s => (
                                            <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= (vendor.rating || 5) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-700'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setViewVendors(true)} className="w-full mt-12 py-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all italic">
                            Operational Intelligence
                        </button>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>
                        <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-2 italic">
                            <CreditCard size={16} className="text-slate-300" />
                            Fiscal Summary
                        </h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Monthly Expenditure</span>
                                <span className="text-2xl font-black text-slate-900 flex items-center gap-0.5"><IndianRupee size={18}/>{financialSummary.totalSpent?.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                                <div 
                                    className="bg-gradient-to-r from-rose-500 to-[#CE2626] h-full rounded-full shadow-[0_0_12px_rgba(206,38,38,0.3)] transition-all duration-1000"
                                    style={{ width: `${Math.min((financialSummary.totalSpent / 5000000) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">{financialSummary.count} Active Orders</p>
                                <p className="text-[9px] font-black text-[#CE2626] uppercase">Max Ceiling: 5M</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ERPPage;
