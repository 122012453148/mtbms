import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    ClipboardCheck, MapPin, AlertCircle, CheckCircle, 
    X, Download, Eye, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';

const API_URL = 'http://localhost:5000/api';

const AdminAuditPage = () => {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [filter, setFilter] = useState('all');
    const [pdfGenerating, setPdfGenerating] = useState(false);
    
    // Analytics state
    const [stats, setStats] = useState({
        total: 0,
        issues: 0,
        storesCovered: 0
    });

    useEffect(() => {
        fetchAudits();
    }, []);

    const fetchAudits = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/audit`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAudits(res.data);
            calculateStats(res.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to fetch audits");
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const normalized = path.replace(/\\/g, '/');
        return `http://localhost:5000${normalized.startsWith('/') ? '' : '/'}${normalized}`;
    };

    const fetchImageAsBase64 = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0);
                try { resolve(canvas.toDataURL('image/jpeg', 0.85)); }
                catch (e) { resolve(null); }
            };
            img.onerror = () => resolve(null);
            img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
        });
    };

    const handleDownloadPDF = async () => {
        if (!selectedAudit || pdfGenerating) return;
        setPdfGenerating(true);
        const toastId = toast.loading('Generating PDF Report...');
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pw = doc.internal.pageSize.getWidth();
            const ph = doc.internal.pageSize.getHeight();
            const margin = 15;
            const cw = pw - margin * 2;
            let y = margin;

            // Header
            doc.setFillColor(22, 30, 84);
            doc.roundedRect(margin, y, cw, 22, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(13); doc.setFont('helvetica', 'bold');
            doc.text('FIELD AUDIT REPORT', margin + 6, y + 10);
            doc.setFontSize(8); doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString()}`, pw - margin - 6, y + 10, { align: 'right' });
            y += 28;

            const sec = (title) => {
                doc.setFillColor(241, 245, 249);
                doc.roundedRect(margin, y, cw, 8, 2, 2, 'F');
                doc.setTextColor(100, 116, 139); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
                doc.text(title.toUpperCase(), margin + 4, y + 5.5);
                y += 11;
            };

            // Identity
            sec('Audit Identity');
            const col3 = cw / 3;
            [[margin, 'Store Name', selectedAudit.storeName], [margin + col3, 'Auditor', selectedAudit.createdBy?.name || 'Unknown'], [margin + col3 * 2, 'Date', new Date(selectedAudit.createdAt).toLocaleDateString()]].forEach(([x, label, val]) => {
                doc.setTextColor(148, 163, 184); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
                doc.text(label.toUpperCase(), x, y);
                doc.setTextColor(15, 23, 42); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
                doc.text(String(val || 'N/A'), x, y + 5);
            });
            y += 16;

            // Metrics
            sec('Inspection Results');
            const metrics = [
                ['Branding Present', selectedAudit.branding],
                ['Cleanliness Rating', selectedAudit.cleanliness],
                ['Competitor Activity', selectedAudit.competitor],
                ['Issue Flagged', selectedAudit.issue || 'No'],
            ];
            metrics.forEach(([label, val], i) => {
                const cx = margin + (i % 2) * (cw / 2);
                const cy = y + Math.floor(i / 2) * 12;
                doc.setFillColor(248, 250, 252);
                doc.roundedRect(cx, cy, cw / 2 - 3, 10, 2, 2, 'F');
                doc.setTextColor(100, 116, 139); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
                doc.text(label, cx + 3, cy + 4);
                doc.setTextColor(15, 23, 42); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
                doc.text(String(val || 'N/A'), cx + 3, cy + 8.5);
            });
            y += Math.ceil(metrics.length / 2) * 12 + 4;

            // Location
            if (selectedAudit.location?.lat) {
                sec('GPS Location');
                doc.setTextColor(79, 70, 229); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
                doc.text(`Lat: ${selectedAudit.location.lat.toFixed(6)}, Lng: ${selectedAudit.location.lng.toFixed(6)}`, margin, y);
                y += 10;
            }

            // Remarks
            if (selectedAudit.remarks) {
                sec('Field Remarks');
                doc.setFillColor(248, 250, 252);
                doc.roundedRect(margin, y, cw, 18, 2, 2, 'F');
                doc.setTextColor(71, 85, 105); doc.setFontSize(8.5); doc.setFont('helvetica', 'italic');
                doc.text(doc.splitTextToSize(selectedAudit.remarks, cw - 8).slice(0, 4), margin + 4, y + 5);
                y += 22;
            }

            // Images
            if (selectedAudit.images?.length > 0) {
                sec('Photographic Evidence');
                const iw = (cw - 5) / 2;
                const ih = iw * 0.65;
                let col = 0;
                for (let i = 0; i < selectedAudit.images.length; i++) {
                    if (y + ih + 6 > ph - margin) { doc.addPage(); y = margin; }
                    const b64 = await fetchImageAsBase64(getImageUrl(selectedAudit.images[i]));
                    const x = margin + col * (iw + 5);
                    if (b64) {
                        doc.addImage(b64, 'JPEG', x, y, iw, ih);
                    } else {
                        doc.setFillColor(241, 245, 249);
                        doc.roundedRect(x, y, iw, ih, 2, 2, 'F');
                        doc.setTextColor(148, 163, 184); doc.setFontSize(8);
                        doc.text('Image unavailable', x + iw / 2, y + ih / 2, { align: 'center' });
                    }
                    doc.setTextColor(100, 116, 139); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
                    doc.text(`Evidence ${i + 1}`, x + 2, y + ih + 4);
                    col++;
                    if (col >= 2) { col = 0; y += ih + 10; }
                }
                if (col > 0) y += ih + 10;
            }

            // Footer on each page
            const tp = doc.internal.getNumberOfPages();
            for (let p = 1; p <= tp; p++) {
                doc.setPage(p);
                doc.setDrawColor(226, 232, 240);
                doc.line(margin, ph - 10, pw - margin, ph - 10);
                doc.setTextColor(148, 163, 184); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
                doc.text('MTBMS Enterprise Portal — Confidential Audit Document', margin, ph - 6);
                doc.text(`Page ${p} of ${tp}`, pw - margin, ph - 6, { align: 'right' });
            }

            doc.save(`Audit_${selectedAudit.storeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.update(toastId, { render: 'PDF Downloaded!', type: 'success', isLoading: false, autoClose: 3000 });
        } catch (err) {
            console.error(err);
            toast.update(toastId, { render: 'PDF generation failed', type: 'error', isLoading: false, autoClose: 3000 });
        } finally {
            setPdfGenerating(false);
        }
    };

    const calculateStats = (data) => {
        const uniqueStores = new Set(data.map(a => a.storeName)).size;
        const totalIssues = data.filter(a => a.issue === 'Yes').length;
        setStats({
            total: data.length,
            issues: totalIssues,
            storesCovered: uniqueStores
        });
    };

    const filteredAudits = audits.filter(audit => {
        if (filter === 'issue') return audit.issue === 'Yes';
        if (filter === 'resolved') return audit.issue === 'No';
        return true;
    });

    if (loading) {
        return <div className="flex justify-center items-center h-full">Loading Audit Data...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto font-inter">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#161E54] tracking-tight">Audit Analytics</h1>
                    <p className="text-slate-500 mt-1">Store inspections and field reports overview</p>
                </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Audits</p>
                        <p className="text-3xl font-bold text-[#161E54] mt-2">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <ClipboardCheck size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Issues Found</p>
                        <p className="text-3xl font-bold text-rose-600 mt-2">{stats.issues}</p>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Stores Covered</p>
                        <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.storesCovered}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <MapPin size={24} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-semibold text-[#161E54]">Recent Reports</h2>
                    
                    <div className="flex gap-4">
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-white border text-[#161E54] border-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                        >
                            <option value="all">All Audits</option>
                            <option value="issue">Issues Found</option>
                            <option value="resolved">No Issues</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-4">Store</th>
                                <th scope="col" className="px-6 py-4">Auditor</th>
                                <th scope="col" className="px-6 py-4">Date</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Issue</th>
                                <th scope="col" className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAudits.map((audit) => (
                                <tr key={audit._id} className="bg-white border-b hover:bg-slate-50 transition-colors pointer shadow-sm">
                                    <td className="px-6 py-4 font-bold text-[#161E54] whitespace-nowrap uppercase tracking-tight">
                                        {audit.storeName}
                                    </td>
                                    <td className="px-6 py-4 font-medium italic">
                                        {audit.createdBy?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(audit.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            audit.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                                            audit.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {audit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {audit.issue === 'Yes' ? (
                                            <span className="flex items-center text-rose-600 gap-1.5 font-bold uppercase text-[11px]">
                                                <AlertCircle size={14} /> Critical
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-emerald-600 gap-1.5 font-bold uppercase text-[11px]">
                                                <CheckCircle size={14} /> Clear
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => setSelectedAudit(audit)}
                                            className="font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest text-[10px] flex items-center gap-2"
                                        >
                                            <Eye size={14} /> View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredAudits.length === 0 && (
                        <div className="p-20 text-center text-slate-400 font-bold italic uppercase tracking-widest opacity-20">Analytic streams dry</div>
                    )}
                </div>
            </div>

            {/* Audit Details Modal */}
            {selectedAudit && (
                <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div>
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-[#161E54] uppercase tracking-tight">Audit Report Details</h2>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={handleDownloadPDF}
                                        disabled={pdfGenerating}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {pdfGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        {pdfGenerating ? 'Building...' : 'PDF Export'}
                                    </button>
                                    <button onClick={() => setSelectedAudit(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Merchant</h3>
                                        <p className="text-lg font-bold text-[#161E54]">{selectedAudit.storeName}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Auditor</h3>
                                        <p className="text-lg font-bold text-[#161E54] underline decoration-indigo-200">{selectedAudit.createdBy?.name || 'Unknown'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl border border-slate-100 bg-white">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Branding</span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${selectedAudit.branding === 'Yes' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {selectedAudit.branding === 'Yes' ? 'Compliant' : 'Non-Compliant'}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-100 bg-white">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cleanliness</span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-600`}>
                                            {selectedAudit.cleanliness}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-100 bg-white">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Competition</span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${selectedAudit.competitor === 'Yes' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {selectedAudit.competitor === 'Yes' ? 'Detected' : 'None'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Auditor Remarks</h3>
                                    <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 border border-slate-100 italic leading-relaxed text-sm">
                                        "{selectedAudit.remarks || "Transmission contains no additional commentary."}"
                                    </div>
                                </div>

                                {selectedAudit.location && selectedAudit.location.lat && (
                                    <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl text-white">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">GPS Coordinates</h3>
                                            <p className="text-xs font-mono">{selectedAudit.location.lat.toFixed(4)}, {selectedAudit.location.lng.toFixed(4)}</p>
                                        </div>
                                         <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${selectedAudit.location.lat},${selectedAudit.location.lng}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                                        >
                                             <MapPin size={14}/> Satellite Map
                                         </a>
                                    </div>
                                )}

                                {selectedAudit.images && selectedAudit.images.length > 0 && (
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Photographic Evidence</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedAudit.images.map((img, idx) => (
                                                <a key={idx} href={getImageUrl(img)} target="_blank" rel="noreferrer" className="block relative aspect-video rounded-2xl overflow-hidden border border-slate-100 group shadow-sm">
                                                    <img 
                                                        src={getImageUrl(img)} 
                                                        crossOrigin="anonymous"
                                                        alt={`Evidence ${idx + 1}`} 
                                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                                                    />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Eye className="text-white" size={24} />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuditPage;
