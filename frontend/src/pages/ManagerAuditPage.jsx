import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    CheckCircle, XCircle, 
    Eye, X, Loader2, MapPin, Download, FileText
} from 'lucide-react';
import jsPDF from 'jspdf';

const API_URL = 'http://localhost:5000/api';

const ManagerAuditPage = () => {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [pdfGenerating, setPdfGenerating] = useState(false);

    useEffect(() => {
        fetchSubmittedAudits();
    }, []);

    const fetchSubmittedAudits = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/audit/manager`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAudits(res.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to fetch pending audits");
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const normalized = path.replace(/\\/g, '/');
        return `http://localhost:5000${normalized.startsWith('/') ? '' : '/'}${normalized}`;
    };

    const handleApproval = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/audit/${action}/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Audit ${action === 'approve' ? 'Approved' : 'Rejected'}`);
            setSelectedAudit(null);
            fetchSubmittedAudits();
        } catch (error) {
            toast.error(`Action failed: ${error.message}`);
        }
    };

    // Fetch an image URL and convert to base64 data URL
    const fetchImageAsBase64 = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                try {
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                } catch (e) {
                    resolve(null);
                }
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
            const pw = doc.internal.pageSize.getWidth();  // 210
            const ph = doc.internal.pageSize.getHeight(); // 297
            const margin = 15;
            const contentW = pw - margin * 2;
            let y = margin;

            // ── Header Banner ──────────────────────────────────────────
            doc.setFillColor(22, 30, 84);  // #161E54
            doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.text('FIELD AUDIT REPORT', margin + 6, y + 10);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString()}`, pw - margin - 6, y + 10, { align: 'right' });
            y += 28;

            // ── Section helper ─────────────────────────────────────────
            const sectionTitle = (title) => {
                doc.setFillColor(241, 245, 249);
                doc.roundedRect(margin, y, contentW, 8, 2, 2, 'F');
                doc.setTextColor(100, 116, 139);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.text(title.toUpperCase(), margin + 4, y + 5.5);
                y += 11;
            };

            const field = (label, value, colX, colW, startY) => {
                doc.setTextColor(148, 163, 184);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.text(label.toUpperCase(), colX, startY);
                doc.setTextColor(15, 23, 42);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(String(value || 'N/A'), colX, startY + 5);
            };

            // ── Audit Identity ─────────────────────────────────────────
            sectionTitle('Audit Identity');
            const colW3 = contentW / 3;
            field('Store Name', selectedAudit.storeName, margin, colW3, y);
            field('Auditor', selectedAudit.createdBy?.name || 'Unknown', margin + colW3, colW3, y);
            field('Date', new Date(selectedAudit.createdAt).toLocaleDateString(), margin + colW3 * 2, colW3, y);
            y += 16;

            // ── Inspection Results ─────────────────────────────────────
            sectionTitle('Inspection Results');
            const metrics = [
                { label: 'Branding Present', value: selectedAudit.branding },
                { label: 'Cleanliness Rating', value: selectedAudit.cleanliness },
                { label: 'Competitor Activity', value: selectedAudit.competitor },
                { label: 'Issue Flagged', value: selectedAudit.issue || 'No' },
            ];
            metrics.forEach((m, i) => {
                const cx = margin + (i % 2) * (contentW / 2);
                const cy = y + Math.floor(i / 2) * 12;
                doc.setFillColor(248, 250, 252);
                doc.roundedRect(cx, cy, contentW / 2 - 3, 10, 2, 2, 'F');
                doc.setTextColor(100, 116, 139);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.text(m.label, cx + 3, cy + 4);
                doc.setTextColor(15, 23, 42);
                doc.setFontSize(8.5);
                doc.setFont('helvetica', 'bold');
                doc.text(String(m.value || 'N/A'), cx + 3, cy + 8.5);
            });
            y += Math.ceil(metrics.length / 2) * 12 + 4;

            // ── Location ───────────────────────────────────────────────
            if (selectedAudit.location?.lat) {
                sectionTitle('GPS Location');
                doc.setTextColor(79, 70, 229);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Lat: ${selectedAudit.location.lat.toFixed(6)}, Lng: ${selectedAudit.location.lng.toFixed(6)}`,
                    margin, y
                );
                y += 10;
            }

            // ── Remarks ────────────────────────────────────────────────
            if (selectedAudit.remarks) {
                sectionTitle('Field Remarks');
                doc.setFillColor(248, 250, 252);
                doc.roundedRect(margin, y, contentW, 18, 2, 2, 'F');
                doc.setTextColor(71, 85, 105);
                doc.setFontSize(8.5);
                doc.setFont('helvetica', 'italic');
                const lines = doc.splitTextToSize(selectedAudit.remarks, contentW - 8);
                doc.text(lines.slice(0, 4), margin + 4, y + 5);
                y += 22;
            }

            // ── Evidence Images ────────────────────────────────────────
            if (selectedAudit.images && selectedAudit.images.length > 0) {
                sectionTitle('Photographic Evidence');

                const imgW = (contentW - 5) / 2;
                const imgH = imgW * 0.65;
                let col = 0;

                for (let i = 0; i < selectedAudit.images.length; i++) {
                    // New page if needed
                    if (y + imgH + 4 > ph - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    const imgUrl = getImageUrl(selectedAudit.images[i]);
                    const b64 = await fetchImageAsBase64(imgUrl);
                    const x = margin + col * (imgW + 5);
                    if (b64) {
                        doc.addImage(b64, 'JPEG', x, y, imgW, imgH);
                    } else {
                        doc.setFillColor(241, 245, 249);
                        doc.roundedRect(x, y, imgW, imgH, 2, 2, 'F');
                        doc.setTextColor(148, 163, 184);
                        doc.setFontSize(8);
                        doc.text('Image unavailable', x + imgW / 2, y + imgH / 2, { align: 'center' });
                    }
                    // Label
                    doc.setTextColor(100, 116, 139);
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Evidence ${i + 1}`, x + 2, y + imgH + 4);

                    col++;
                    if (col >= 2) {
                        col = 0;
                        y += imgH + 10;
                    }
                }
                if (col > 0) y += imgH + 10;
            }

            // ── Footer ─────────────────────────────────────────────────
            const totalPages = doc.internal.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) {
                doc.setPage(p);
                doc.setDrawColor(226, 232, 240);
                doc.line(margin, ph - 10, pw - margin, ph - 10);
                doc.setTextColor(148, 163, 184);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.text('MTBMS Enterprise Portal — Confidential Audit Document', margin, ph - 6);
                doc.text(`Page ${p} of ${totalPages}`, pw - margin, ph - 6, { align: 'right' });
            }

            const filename = `Audit_${selectedAudit.storeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            toast.update(toastId, { render: 'PDF Downloaded!', type: 'success', isLoading: false, autoClose: 3000 });
        } catch (err) {
            console.error('PDF error:', err);
            toast.update(toastId, { render: 'PDF generation failed', type: 'error', isLoading: false, autoClose: 3000 });
        } finally {
            setPdfGenerating(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#161E54]" size={40} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-inter p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Audit Review Queue</h1>
                    <p className="text-sm text-slate-500 mt-1 italic">Pending field inspections awaiting verification</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl text-amber-700 text-xs font-bold uppercase tracking-widest">
                    {audits.length} Audits Pending
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-[0.15em] text-slate-400">
                        <tr>
                            <th className="px-8 py-5">Employee Name</th>
                            <th className="px-8 py-5">Store Name</th>
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {audits.map((audit) => (
                            <tr key={audit._id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                                <td className="px-8 py-5 font-bold text-slate-900">{audit.createdBy?.name || 'N/A'}</td>
                                <td className="px-8 py-5 font-medium text-slate-600 italic">{audit.storeName}</td>
                                <td className="px-8 py-5 text-slate-500">{new Date(audit.createdAt).toLocaleDateString()}</td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-100">
                                        Submitted
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button 
                                        onClick={() => setSelectedAudit(audit)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                                    >
                                        <Eye size={14} /> Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {audits.length === 0 && (
                    <div className="p-20 text-center text-slate-400 font-bold italic uppercase tracking-widest opacity-20">No pending audits for review</div>
                )}
            </div>

            {/* Review Modal */}
            {selectedAudit && (
                <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div>
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-slate-900">Material Audit Findings</h2>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={handleDownloadPDF}
                                        disabled={pdfGenerating}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {pdfGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        {pdfGenerating ? 'Building...' : 'Export PDF'}
                                    </button>
                                    <button onClick={() => setSelectedAudit(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-8 space-y-8">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Store Identity</p>
                                        <p className="text-base font-bold text-slate-900">{selectedAudit.storeName}</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Auditor Identity</p>
                                        <p className="text-base font-bold text-slate-900">{selectedAudit.createdBy?.name || 'Unknown'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transmission Date</p>
                                        <p className="text-base font-bold text-slate-900">{new Date(selectedAudit.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-8 border-y border-slate-50 py-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Metrics</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
                                                    <span className="text-sm font-medium text-slate-600">Branding Authenticity</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${selectedAudit.branding === 'Yes' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{selectedAudit.branding}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
                                                    <span className="text-sm font-medium text-slate-600">Site Cleanliness</span>
                                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-indigo-50 text-indigo-600">{selectedAudit.cleanliness}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
                                                    <span className="text-sm font-medium text-slate-600">Competitor Density</span>
                                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-slate-100 text-slate-600">{selectedAudit.competitor}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedAudit.location && selectedAudit.location.lat && (
                                            <div>
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Geo-Location Data</h3>
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${selectedAudit.location.lat},${selectedAudit.location.lng}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                                                >
                                                    <MapPin size={14} /> Open Satellite View
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Audit Evidence</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedAudit.images && selectedAudit.images.length > 0 ? (
                                                selectedAudit.images.map((img, idx) => (
                                                    <a key={idx} href={getImageUrl(img)} target="_blank" rel="noreferrer" className="block aspect-square rounded-2xl overflow-hidden border border-slate-100 group relative">
                                                        <img src={getImageUrl(img)} alt={`Evidence ${idx + 1}`} crossOrigin="anonymous" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Eye className="text-white" size={24} />
                                                        </div>
                                                    </a>
                                                ))
                                            ) : (
                                                <div className="col-span-2 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs italic">No visual evidence provided</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Field Remarks</h3>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed italic text-sm">
                                        "{selectedAudit.remarks || "No additional comments provided by the auditor."}"
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-4 action-buttons">
                                    <button 
                                        onClick={() => handleApproval(selectedAudit._id, 'reject')}
                                        className="flex items-center justify-center gap-3 py-5 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em]"
                                    >
                                        <XCircle size={20} /> Declare Non-Compliant
                                    </button>
                                    <button 
                                        onClick={() => handleApproval(selectedAudit._id, 'approve')}
                                        className="flex items-center justify-center gap-3 py-5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10"
                                    >
                                        <CheckCircle size={20} /> Validate & Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerAuditPage;
