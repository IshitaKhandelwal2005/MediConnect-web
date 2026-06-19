import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const HealthRecords = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' or 'prescriptions'
    const [records, setRecords] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Upload Form States
    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Delete Modal State
    const [deleteModalRecord, setDeleteModalRecord] = useState(null);

    // Fetch user health records
    const fetchUserRecords = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const { data } = await axios.get(backendUrl + '/api/user/health-records', {
                headers: { token }
            });
            if (data.success) {
                setRecords(data.healthRecords);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user appointments (to get official doctor prescriptions)
    const fetchUserAppointments = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', {
                headers: { token }
            });
            if (data.success) {
                // Filter appointments that have a prescription uploaded by a doctor
                const completedWithPrescriptions = data.appointments.filter(
                    app => app.isCompleted && app.prescription
                );
                setAppointments(completedWithPrescriptions.reverse());
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserRecords();
            fetchUserAppointments();
        }
    }, [token]);

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = (file) => {
        // Enforce file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.warn('Only PDF and Image files (JPEG, PNG, GIF) are allowed.');
            return;
        }
        // Enforce 10MB size limit
        if (file.size > 10 * 1024 * 1024) {
            toast.warn('File size cannot exceed 10MB.');
            return;
        }

        setSelectedFile(file);
        // Pre-fill file name input with original name (without extension) if empty
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setFileName(nameWithoutExt);
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.warn('Please select or drop a file to upload.');
            return;
        }
        if (records.length >= 20) {
            toast.error('Maximum upload limit of 20 files reached.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', fileName.trim() || selectedFile.name);

        try {
            const { data } = await axios.post(backendUrl + '/api/user/upload-health-record', formData, {
                headers: {
                    token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success) {
                toast.success('Document uploaded successfully');
                setFileName('');
                setSelectedFile(null);
                fetchUserRecords();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteRecord = async () => {
        if (!deleteModalRecord) return;
        try {
            const { data } = await axios.delete(
                backendUrl + `/api/user/health-record/${deleteModalRecord._id}`,
                { headers: { token } }
            );

            if (data.success) {
                toast.success('Record deleted successfully');
                setDeleteModalRecord(null);
                fetchUserRecords();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const slotDateFormat = (slotDate) => {
        if (!slotDate) return '';
        const dateArray = slotDate.split('_');
        if (dateArray.length === 3) {
            const day = Number(dateArray[0]);
            const month = Number(dateArray[1]) - 1;
            const year = Number(dateArray[2]);
            const date = new Date(year, month, day);
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return slotDate;
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {/* Header statistics block */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 to-emerald-950 p-8 shadow-xl mb-8 text-white">
                <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-teal-800/10 blur-2xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Electronic Health Records</h1>
                        <p className="text-teal-200/90 text-sm max-w-xl">
                            Securely upload and manage your diagnostic reports, immunizations, and clinical documents, or view official prescriptions from your doctors.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center md:min-w-44 flex flex-col items-center justify-center">
                        <span className="text-xs uppercase tracking-wider font-semibold text-teal-300">File Storage</span>
                        <span className="text-4xl font-extrabold mt-1">{records.length} <span className="text-lg text-teal-300 font-normal">/ 20</span></span>
                        <div className="w-full bg-teal-950/40 rounded-full h-1.5 mt-2 overflow-hidden border border-white/10">
                            <div className="bg-teal-400 h-full rounded-full transition-all duration-300" style={{ width: `${(records.length / 20) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-gray-200 mb-8 gap-4">
                <button
                    onClick={() => setActiveTab('uploads')}
                    className={`pb-4 text-base font-semibold transition-all relative ${activeTab === 'uploads' ? 'text-teal-950 border-b-2 border-teal-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    My Uploads ({records.length})
                </button>
                <button
                    onClick={() => setActiveTab('prescriptions')}
                    className={`pb-4 text-base font-semibold transition-all relative ${activeTab === 'prescriptions' ? 'text-teal-950 border-b-2 border-teal-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Prescription History ({appointments.length})
                </button>
            </div>

            {activeTab === 'uploads' ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-start">
                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Upload New Document</h2>

                        {records.length >= 20 ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                                <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                                <p className="text-sm font-semibold text-amber-800">Storage limit reached</p>
                                <p className="text-xs text-amber-600 mt-1">Please delete older files to upload new ones.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={triggerFileSelect}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive
                                            ? 'border-teal-500 bg-teal-50/50'
                                            : selectedFile
                                                ? 'border-emerald-500 bg-emerald-50/10'
                                                : 'border-gray-300 hover:border-teal-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,image/*"
                                        onChange={handleFileInput}
                                    />

                                    {selectedFile ? (
                                        <div className="space-y-2">
                                            <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                {selectedFile.type === 'application/pdf' ? '📄' : '🖼️'}
                                            </div>
                                            <p className="text-xs font-semibold text-emerald-800 truncate max-w-full px-2">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                    setFileName('');
                                                }}
                                                className="text-xs text-rose-500 hover:underline"
                                            >
                                                Remove File
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="text-3xl">📤</div>
                                            <p className="text-sm font-semibold text-gray-700">Drag & Drop file here</p>
                                            <p className="text-xs text-gray-400">or click to browse from device</p>
                                            <p className="text-[10px] text-gray-400">Allowed: PDF, PNG, JPG, GIF (Max 10MB)</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                        Document Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Blood Test - June 2026"
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all text-sm"
                                        required
                                        disabled={!selectedFile}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading || !selectedFile}
                                    className="w-full bg-teal-900 text-white font-semibold py-3 rounded-xl hover:bg-teal-950 transition-all disabled:opacity-50 text-sm shadow-md"
                                >
                                    {uploading ? 'Uploading Document...' : 'Upload File'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Cards Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center h-48">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-900"></div>
                            </div>
                        ) : records.length === 0 ? (
                            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                                <div className="text-4xl mb-3">📁</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No uploaded records</h3>
                                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                    You have not uploaded any health records yet. Use the upload panel to store your reports.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {records.map((item, index) => (
                                    <div
                                        key={item._id || index}
                                        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className={`p-3 rounded-lg flex-shrink-0 text-xl ${item.fileType === 'pdf' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {item.fileType === 'pdf' ? '📄' : '🖼️'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-bold text-gray-900 truncate" title={item.name}>
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Uploaded on {new Date(item.uploadedAt).toLocaleDateString()}
                                                </p>
                                                <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1.5 ${item.fileType === 'pdf'
                                                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                                    }`}>
                                                    {item.fileType}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 border-t border-gray-100 pt-3 mt-4">
                                            <a
                                                href={item.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-center bg-gray-50 border border-gray-200 rounded-lg py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                            >
                                                View / Download
                                            </a>
                                            <button
                                                onClick={() => setDeleteModalRecord(item)}
                                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-100 rounded-lg p-2 transition-colors"
                                                title="Delete record"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Prescriptions Tab */
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Doctor Prescriptions</h2>

                    {appointments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">💊</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No prescriptions found</h3>
                            <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                You do not have any official prescriptions uploaded by doctors in your appointment history yet.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Doctor</th>
                                        <th scope="col" className="px-6 py-3">Appointment Date</th>
                                        <th scope="col" className="px-6 py-3">Uploaded Prescriptions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((item, index) => (
                                        <tr key={item._id || index} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <img className="w-10 h-10 rounded-full object-cover bg-gray-100 border" src={item.docData.image} alt={item.docData.name} />
                                                    <div>
                                                        <p className="font-bold text-gray-900">{item.docData.name}</p>
                                                        <p className="text-xs text-gray-400">{item.docData.speciality}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-700">{slotDateFormat(item.slotDate)}</p>
                                                <p className="text-xs text-gray-400">{item.slotTime}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.prescription ? (
                                                    <a
                                                        href={item.prescription}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-teal-100 transition-all shadow-sm"
                                                    >
                                                        ⬇️ Download Prescription
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No file</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalRecord && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl mb-4">
                            ⚠️
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 mb-2">Delete Health Record</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteModalRecord.name}"</span>? This action is permanent and cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModalRecord(null)}
                                className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteRecord}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-md"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthRecords;
