import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Camera, MapPin, UploadCloud, Save, Send, ShieldAlert, BadgeCheck, Sparkles } from 'lucide-react';

const API_URL = 'https://mtbms.onrender.com/api';

const EmployeeAuditPage = () => {
    const [formData, setFormData] = useState({
        storeName: '',
        location: null,
        branding: '',
        cleanliness: '',
        competitor: '',
        issue: 'No',
        remarks: ''
    });
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locationCaptured, setLocationCaptured] = useState(false);

    const THEME_ACCENT = '#CE2626';
    const THEME_BG = '#FFFDEB';
    const THEME_TEXT = '#161E54';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImages(prev => [...prev, ...filesArray]);
            
            // Create preview URLs
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const captureLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }));
                    setLocationCaptured(true);
                    toast.success("Location captured successfully!");
                },
                (error) => {
                    toast.error("Failed to get location. Please enable location services.");
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser");
        }
    };

    const handleSubmit = async (e, type = 'draft') => {
        e.preventDefault();
        
        // Validation for final submission
        if (type === 'submitted') {
            if (!formData.storeName || !formData.branding || !formData.cleanliness || !formData.competitor) {
                return toast.error("Please fill all required mandatory (*) fields before submitting.");
            }
        } else {
            if (!formData.storeName) {
                 return toast.error("Store Name is required even for drafts.");
            }
        }

        setLoading(true);
        const submitData = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key === 'location') {
                if (formData[key]) submitData.append('location', JSON.stringify(formData[key]));
            } else {
                 if (formData[key]) submitData.append(key, formData[key]);
            }
        });

        submitData.append('status', type);

        images.forEach(img => {
            submitData.append('images', img);
        });

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/audit`, submitData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            toast.success(`Audit ${type === 'submitted' ? 'submitted completely' : 'saved as draft'}!`);
            
            if (type === 'submitted') {
                 // Reset form only on full submit
                 setFormData({
                    storeName: '', location: null, branding: '', cleanliness: '', competitor: '', issue: 'No', remarks: ''
                 });
                 setImages([]);
                 setPreviewUrls([]);
                 setLocationCaptured(false);
            }
            
        } catch (error) {
            toast.error(`Error saving audit: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 font-inter" style={{ backgroundColor: THEME_BG }}>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    
                    {/* Header */}
                    <div className="p-8 pb-10 text-white" style={{ backgroundColor: THEME_TEXT }}>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 rounded-lg" style={{ backgroundColor: THEME_ACCENT }}>
                                 <ShieldAlert size={28} className="text-white" />
                             </div>
                             <h1 className="text-3xl font-bold tracking-tight">Field Audit Report</h1>
                        </div>
                        <p className="text-slate-300 ml-[52px]">Enter store inspection details and capture site evidence.</p>
                    </div>

                    <form className="p-8 -mt-6 bg-white rounded-t-3xl relative z-10" autoComplete="off">
                        
                        {/* Section 1: Basic Info */}
                        <div className="mb-10">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-3" style={{ color: THEME_TEXT }}>
                                 <MapPin className="text-[#CE2626]" size={22} /> Site Details
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Store Name <span className="text-[#CE2626]">*</span></label>
                                    <input 
                                        type="text" 
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-[#CE2626] focus:border-transparent block p-3.5 transition-all"
                                        placeholder="e.g. Downtown Metro Branch"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">GPS Location <span className="text-xs text-slate-400 font-normal">(Optional)</span></label>
                                    <button
                                        type="button"
                                        onClick={captureLocation}
                                        className={`w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border transition-all ${
                                            locationCaptured 
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                            : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'
                                        }`}
                                    >
                                        <MapPin size={18} />
                                        {locationCaptured ? 'Location Captured' : 'Tag Coordinates'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Audit Checklist */}
                        <div className="mb-10">
                             <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-3" style={{ color: THEME_TEXT }}>
                                 <BadgeCheck className="text-[#CE2626]" size={22} /> Inspection Checklist
                            </h2>

                            <div className="space-y-6">
                                {/* Branding */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <label className="block text-base font-semibold text-slate-800 mb-3">Is Store Branding Present? <span className="text-[#CE2626]">*</span></label>
                                    <div className="flex gap-4">
                                        {['Yes', 'No'].map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, branding: option }))}
                                                className={`flex-1 py-3 rounded-xl font-medium border-2 transition-all ${
                                                    formData.branding === option
                                                    ? `border-[${THEME_ACCENT}] bg-[#CE2626] text-white shadow-md shadow-red-500/20`
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cleanliness */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <label className="block text-base font-semibold text-slate-800 mb-3">Cleanliness Rating <span className="text-[#CE2626]">*</span></label>
                                    <div className="flex gap-4">
                                        {['Good', 'Average', 'Poor'].map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, cleanliness: option }))}
                                                className={`flex-1 py-3 rounded-xl font-medium border-2 transition-all ${
                                                    formData.cleanliness === option
                                                    ? 'border-[#161E54] bg-[#161E54] text-white shadow-md'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Competitor */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <label className="block text-base font-semibold text-slate-800 mb-3">Competitor Activity Detected? <span className="text-[#CE2626]">*</span></label>
                                    <div className="flex gap-4">
                                        {['Yes', 'No'].map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, competitor: option }))}
                                                className={`flex-1 py-3 rounded-xl font-medium border-2 transition-all ${
                                                    formData.competitor === option
                                                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Manual Issue Flag */}
                                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                                     <label className="block text-base font-semibold text-amber-900 mb-3">Manually Flag an Issue?</label>
                                      <div className="flex gap-4">
                                        {['Yes', 'No'].map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, issue: option }))}
                                                className={`flex-1 py-3 rounded-xl font-medium border transition-all ${
                                                    formData.issue === option
                                                    ? (option === 'Yes' ? 'border-amber-500 bg-amber-500 text-white shadow-md' : 'border-slate-300 bg-slate-300 text-white shadow-md')
                                                    : 'border-amber-200 bg-white text-amber-700 hover:border-amber-300'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Section 3: Evidence */}
                        <div className="mb-10">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-3" style={{ color: THEME_TEXT }}>
                                 <Camera className="text-[#CE2626]" size={22} /> Site Evidence
                            </h2>
                            
                            <div className="w-full">
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                                        <p className="mb-2 text-sm text-slate-600 font-medium"><span className="text-[#CE2626] font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-slate-500">JPG, PNG, or WEBP (Max multiple)</p>
                                    </div>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>

                            {/* Image Previews */}
                            {previewUrls.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section 4: Remarks */}
                        <div className="mb-10">
                             <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Remarks</label>
                             <textarea 
                                name="remarks"
                                rows="4"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-[#161E54] focus:border-transparent block p-4 transition-all resize-none"
                                placeholder="Describe any specific observations..."
                            ></textarea>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-slate-100">
                             <button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'draft')}
                                disabled={loading}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 px-6 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50"
                             >
                                 <Save size={20} /> Save as Draft
                             </button>
                             <button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'submitted')}
                                disabled={loading}
                                className="flex-1 text-white font-bold py-4 px-6 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                                style={{ backgroundColor: THEME_ACCENT }}
                             >
                                 <Send size={20} /> Submit Final
                             </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeAuditPage;
