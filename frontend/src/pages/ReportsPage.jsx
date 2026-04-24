import React, { useState } from 'react';
import { 
    Download, FileText, Calendar, 
    BarChart3, PieChart, TrendingUp, 
    Maximize2, Filter, Printer, ArrowUpRight
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line 
} from 'recharts';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const reportData = [
    { name: 'Week 1', sales: 4000, usage: 2400, profit: 1200 },
    { name: 'Week 2', sales: 3000, usage: 1398, profit: 900 },
    { name: 'Week 3', sales: 2000, usage: 9800, profit: 4000 },
    { name: 'Week 4', sales: 2780, usage: 3908, profit: 1511 },
];

const ReportCard = ({ title, description, children, onExport }) => (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl group">
        <div className="flex justify-between items-start mb-8">
            <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{title}</h3>
                <p className="text-sm text-slate-500 font-medium italic mt-1">{description}</p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onExport('PDF')} className="p-2.5 bg-slate-50 text-slate-400 hover:text-[#CE2626] rounded-xl transition-all">
                    <Download size={18} />
                </button>
                <button onClick={() => window.print()} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                    <Printer size={18} />
                </button>
            </div>
        </div>
        <div className="h-[300px] w-full">
            {children}
        </div>
    </div>
);

const ReportsPage = () => {
    const [period, setPeriod] = useState('Monthly');

    const handleExport = (format) => {
        if (format === 'PDF') {
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.text('MTBMS ENTERPRISE EXECUTIVE REPORT', 20, 20);
            doc.setFontSize(12);
            doc.text(`Reporting Cycle: ${period}`, 20, 30);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);

            const tableData = reportData.map(row => [row.name, row.sales, row.usage, row.profit]);
            doc.autoTable({
                head: [['Week', 'Gross Sales ($)', 'Resource Usage', 'Net Profit ($)']],
                body: tableData,
                startY: 50,
                theme: 'striped',
                headStyles: { fillColor: [206, 38, 38] }
            });
            doc.save(`MTBMS_EXECUTIVE_${period.toUpperCase()}.pdf`);
            toast.success('PDF Dossier Generated');
        } else {
            const worksheet = XLSX.utils.json_to_sheet(reportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Business Stats");
            XLSX.writeFile(workbook, `MTBMS_DATA_${period.toUpperCase()}.xlsx`);
            toast.success('Excel Protocol Exported');
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Executive Reports</h1>
                    <p className="text-slate-500 font-medium mt-1">Generated analytics and data exports for business stakeholders</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => handleExport('EXCEL')} className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black flex items-center gap-3 shadow-xl">
                        <FileText size={18} /> EXCEL EXPORT
                    </button>
                    <button onClick={() => handleExport('PDF')} className="px-6 py-3.5 bg-[#CE2626] text-white rounded-2xl text-sm font-black flex items-center gap-3 shadow-xl">
                        <Download size={18} /> PDF REPORT
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 pr-6 border-r border-slate-100">
                    <Calendar size={18} className="text-[#CE2626]" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Report Cycle:</span>
                </div>
                {['Daily', 'Weekly', 'Monthly', 'Annual', 'Custom Range'].map(p => (
                    <button 
                        key={p} onClick={() => setPeriod(p)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                            period === p ? 'bg-brand-bg text-[#CE2626] shadow-sm ring-1 ring-[#CE2626]/20' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {p.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <ReportCard 
                    title="Revenue & Profit Matrix" 
                    description="Correlation between gross sales and net operating profit"
                    onExport={handleExport}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                            <Line type="monotone" dataKey="sales" stroke="#CE2626" strokeWidth={4} dot={{r: 6, fill: '#CE2626'}} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="profit" stroke="#1e293b" strokeWidth={4} strokeDasharray="10 10" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ReportCard>

                <ReportCard 
                    title="Material Usage Efficiency" 
                    description="Inventory turnover rate vs project consumption"
                    onExport={handleExport}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                            <Bar dataKey="usage" fill="#CE2626" radius={[8, 8, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </ReportCard>
            </div>

            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm border-t-8 border-t-[#CE2626]">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Data Summary Table</h3>
                        <p className="text-sm text-slate-400 font-bold italic mt-1 uppercase tracking-widest">Aggregate results for {period} cycle</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-10 py-6">Metric Category</th>
                                <th className="px-6 py-6">Value (Current)</th>
                                <th className="px-6 py-6">Value (Previous)</th>
                                <th className="px-6 py-6">Variance</th>
                                <th className="px-6 py-6 text-right">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { cat: "Material Acquisition Cost", val: "$124,500", prev: "$110,000", var: "+13%", up: false },
                                { cat: "Average Sales Order Value", val: "$3,420", prev: "$3,100", var: "+10%", up: true },
                                { cat: "Employee Productivity Score", val: "94.2", prev: "91.5", var: "+2.7%", up: true },
                                { cat: "Customer Retention Rate", val: "88%", prev: "85%", var: "+3%", up: true }
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-brand-bg/20 transition-colors">
                                    <td className="px-10 py-6 font-bold text-slate-900">{row.cat}</td>
                                    <td className="px-6 py-6 font-black text-slate-700">{row.val}</td>
                                    <td className="px-6 py-6 text-slate-400 font-medium">{row.prev}</td>
                                    <td className={`px-6 py-6 font-black ${row.up ? 'text-emerald-500' : 'text-rose-500'}`}>{row.var}</td>
                                    <td className="px-6 py-6 text-right">
                                        {row.up ? <ArrowUpRight className="inline text-emerald-500" /> : <TrendingUp className="inline text-rose-500" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
