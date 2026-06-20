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
            <div className="flex justify-between items-center pb-3 mt-12 border-b border-zinc-200">
                <p className="font-medium text-zinc-700">Electronic Health Records</p>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Storage</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${records.length >= 20 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-zinc-100 text-neutral-800 border-zinc-200'}`}>
                        {records.length} / 20
                    </span>
                </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-zinc-200 mb-8 gap-8 mt-6">
                <button
                    onClick={() => setActiveTab('uploads')}
                    className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'uploads' ? 'text-[#002000] border-b-2 border-[#002000]' : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                >
                    My Uploads ({records.length})
                </button>
                <button
                    onClick={() => setActiveTab('prescriptions')}
                    className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'prescriptions' ? 'text-[#002000] border-b-2 border-[#002000]' : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                >
                    Prescription History ({appointments.length})
                </button>
            </div>

            {activeTab === 'uploads' ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-start">
                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                        <h2 className="text-base font-semibold text-neutral-800 mb-4">Upload New Document</h2>

                        {records.length >= 20 ? (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                                <p className="text-sm font-semibold text-red-700">Storage limit reached</p>
                                <p className="text-xs text-red-500 mt-1">Please delete older files to upload new ones.</p>
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
                                            ? 'border-[#002000] bg-[#002000]/5'
                                            : selectedFile
                                                ? 'border-emerald-500 bg-emerald-50/10'
                                                : 'border-zinc-300 hover:border-[#002000] hover:bg-zinc-50'
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
                                            <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">
                                                {selectedFile.type === 'application/pdf' ? '📄' : '🖼️'}
                                            </div>
                                            <p className="text-xs font-semibold text-neutral-800 truncate px-2">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-[10px] text-zinc-400">
                                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                    setFileName('');
                                                }}
                                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Remove File
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-2 text-zinc-500">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                            </div>
                                            <p className="text-sm font-semibold text-neutral-700">Drag & Drop file here</p>
                                            <p className="text-xs text-zinc-400">or click to browse from device</p>
                                            <p className="text-[10px] text-zinc-400 mt-2">Allowed: PDF, PNG, JPG, GIF (Max 10MB)</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                                        Document Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Blood Test - June 2026"
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        className="w-full border border-zinc-300 rounded-lg p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all text-sm"
                                        required
                                        disabled={!selectedFile}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading || !selectedFile}
                                    className="w-full bg-[#1D2129] text-white font-semibold py-3 rounded-lg hover:bg-neutral-800 transition-all disabled:opacity-50 text-sm shadow-md"
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
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-12 text-center">
                                <p className="text-zinc-500 text-sm">You have not uploaded any health records yet.</p>
                                <p className="text-zinc-400 text-xs mt-1">Use the upload panel to store your reports securely.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {records.map((item, index) => (
                                    <div
                                        key={item._id || index}
                                        className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className="p-2.5 bg-zinc-100 rounded-lg text-lg flex-shrink-0 text-zinc-500">
                                                {item.fileType === 'pdf' ? '📄' : '🖼️'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-bold text-neutral-800 truncate" title={item.name}>
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-zinc-400 mt-0.5">
                                                    {new Date(item.uploadedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                                <span className="inline-block text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full mt-2">
                                                    {item.fileType}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-100">
                                            <a
                                                href={item.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-center bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-semibold py-2 rounded-lg text-xs transition-colors"
                                            >
                                                View
                                            </a>
                                            <button
                                                onClick={() => setDeleteModalRecord(item)}
                                                className="px-3 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-xs"
                                                title="Delete record"
                                            >
                                                Delete
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
                        <div className="bg-zinc-50 p-12 text-center rounded-xl border border-zinc-200">
                            <p className="text-zinc-500 text-sm">No prescriptions found.</p>
                            <p className="text-zinc-400 text-xs mt-1">Official prescriptions uploaded by your doctors will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white border border-zinc-200 rounded-xl">
                            <table className="w-full text-sm text-left text-zinc-600">
                                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200 tracking-wider">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-semibold">Doctor</th>
                                        <th scope="col" className="px-6 py-4 font-semibold">Appointment Date</th>
                                        <th scope="col" className="px-6 py-4 font-semibold">Uploaded Prescription</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200">
                                    {appointments.map((item, index) => (
                                        <tr key={item._id || index} className="bg-white hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img className="w-10 h-10 rounded-full object-cover bg-zinc-100" src={item.docData.image} alt={item.docData.name} />
                                                    <div>
                                                        <p className="font-bold text-neutral-800">{item.docData.name}</p>
                                                        <p className="text-xs text-zinc-500 mt-0.5">{item.docData.speciality}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-neutral-800">{slotDateFormat(item.slotDate)}</p>
                                                <p className="text-xs text-zinc-500 mt-0.5">{item.slotTime}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.prescription ? (
                                                    <a
                                                        href={item.prescription}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#002000] border border-zinc-300 bg-white hover:bg-zinc-50 px-4 py-2 rounded-lg transition-all shadow-sm"
                                                    >
                                                        Download PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-zinc-400">Not available</span>
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-800 mb-2">Delete Record</h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            Are you sure you want to delete <span className="font-semibold text-neutral-800">"{deleteModalRecord.name}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModalRecord(null)}
                                className="flex-1 bg-white border border-zinc-300 hover:bg-zinc-50 text-neutral-800 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteRecord}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthRecords;
