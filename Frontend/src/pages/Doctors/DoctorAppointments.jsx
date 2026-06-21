import React, { useContext, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuthContext } from '../../context/AuthContext';
import { useDoctorContext } from '../../context/DoctorContext';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorAppointments = () => {
  const { calculateAge, slotDateFormat, currencySymbol, backendUrl } = useAppContext();
  const { dtoken } = useAuthContext();
  const { doctorAppointments, getDoctorAppointments, cancelDoctorAppointment } = useDoctorContext();;

  // Patient EHR Modal state
  const [ehrModalOpen, setEhrModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [ehrLoading, setEhrLoading] = useState(false);
  const [ehrError, setEhrError] = useState('');

  // Complete Appointment Modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingAppointmentId, setCompletingAppointmentId] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    getDoctorAppointments();
  }, [dtoken]);

  // EHR Access handler
  const openEhrModal = async (patient, appointment) => {
    setSelectedPatient({
      id: patient._id,
      name: patient.name,
      image: patient.image,
      dob: patient.dob,
      slotDate: appointment.slotDate,
      slotTime: appointment.slotTime
    });
    setEhrModalOpen(true);
    setEhrLoading(true);
    setEhrError('');
    setPatientRecords([]);

    try {
      const { data } = await axios.get(
        backendUrl + `/api/doctor/patient-records/${patient._id}`,
        { headers: { dtoken } }
      );

      if (data.success) {
        setPatientRecords(data.healthRecords || []);
      } else {
        setEhrError(data.message || 'Access restricted.');
      }
    } catch (error) {
      console.error(error);
      setEhrError(error.response?.data?.message || error.message || 'Error fetching records.');
    } finally {
      setEhrLoading(false);
    }
  };

  // Completion logic
  const handleOpenCompleteModal = (appointmentId) => {
    setCompletingAppointmentId(appointmentId);
    setPrescriptionFile(null);
    setCompleteModalOpen(true);
  };

  const handleCompleteAppointment = async (e) => {
    e.preventDefault();
    if (!completingAppointmentId) return;

    setCompleting(true);
    const formData = new FormData();
    formData.append('appointmentId', completingAppointmentId);
    if (prescriptionFile) {
      formData.append('prescription', prescriptionFile);
    }

    try {
      const { data } = await axios.post(
        backendUrl + '/api/doctor/complete-appointment',
        formData,
        {
          headers: {
            dtoken,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data.success) {
        toast.success(data.message || 'Appointment completed');
        getDoctorAppointments();
        setCompleteModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to complete appointment');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Error occurred');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll shadow-sm'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_2.5fr_1fr_1.5fr_1.5fr] gap-1 py-3 px-6 border-b font-semibold bg-gray-50 text-gray-700'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date and Time</p>
          <p>Fees</p>
          <p className="text-center">EHR Records</p>
          <p className="text-center">Action</p>
        </div>

        {doctorAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No appointments booked yet.
          </div>
        ) : (
          doctorAppointments.slice().reverse().map((item, index) => (
            <div
              className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_2.5fr_1fr_1.5fr_1.5fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 transition-colors'
              key={item._id || index}
            >
              <p className='max-sm:hidden'>{index + 1}</p>
              <div className='flex items-center gap-2'>
                <img className='w-8 h-8 rounded-full object-cover border' src={item.userData.image} alt="" />
                <p className='font-medium text-gray-900'>{item.userData.name}</p>
              </div>
              <div>
                <p className='text-xs inline border border-gray-300 px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-600 font-medium'>
                  {item.payment ? 'Online' : 'Cash'}
                </p>
              </div>
              <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
              <p className="font-medium">{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
              <p className="font-semibold text-gray-900">{currencySymbol}{item.amount}</p>
              
              {/* EHR Records column */}
              <div className="flex justify-center">
                <button
                  onClick={() => openEhrModal(item.userData, item)}
                  className="bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 hover:text-teal-850 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  📁 View EHR
                </button>
              </div>

              {/* Action column */}
              <div className="flex justify-center items-center">
                {item.cancelled ? (
                  <p className='text-rose-500 text-xs font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full'>Cancelled</p>
                ) : item.isCompleted ? (
                  <p className='text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full'>Completed</p>
                ) : (
                  <div className='flex gap-1.5'>
                    <button
                      onClick={() => cancelDoctorAppointment(item._id)}
                      className="p-1.5 hover:bg-rose-50 border rounded-lg transition-colors border-gray-200"
                      title="Cancel Appointment"
                    >
                      <img className='w-5' src={assets.cancel_icon} alt="Cancel" />
                    </button>
                    <button
                      onClick={() => handleOpenCompleteModal(item._id)}
                      className="p-1.5 hover:bg-emerald-50 border rounded-lg transition-colors border-gray-200"
                      title="Complete Appointment"
                    >
                      <img className='w-5' src={assets.tick_icon} alt="Complete" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* EHR Viewer Modal */}
      {ehrModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full border object-cover" src={selectedPatient.image} alt="" />
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">{selectedPatient.name}</h3>
                  <p className="text-xs text-gray-400">Age: {calculateAge(selectedPatient.dob)}</p>
                </div>
              </div>
              <button
                onClick={() => setEhrModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {ehrLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-900 mb-2"></div>
                  <p className="text-xs text-gray-400">Verifying access window & fetching EHR records...</p>
                </div>
              ) : ehrError ? (
                <div className="text-center py-12 px-4">
                  <div className="text-4xl mb-4">🔒</div>
                  <h4 className="text-lg font-extrabold text-gray-900 mb-2">Access Restricted</h4>
                  <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                    {ehrError}
                  </p>
                  <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-3 inline-block">
                    <p className="text-xs text-gray-500 font-medium">
                      Slot Date: <span className="font-bold text-gray-750">{slotDateFormat(selectedPatient.slotDate)}</span>
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Slot Time: <span className="font-bold text-gray-750">{selectedPatient.slotTime}</span>
                    </p>
                  </div>
                </div>
              ) : patientRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📁</div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">No uploaded records</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    This patient has not uploaded any medical files to their portal.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Patient EHR Documents ({patientRecords.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {patientRecords.map((record, index) => (
                      <div key={record._id || index} className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:bg-gray-50/50 transition-all">
                        <div className="flex gap-2.5 items-start">
                          <div className={`p-2.5 rounded-lg text-lg ${
                            record.fileType === 'pdf' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {record.fileType === 'pdf' ? '📄' : '🖼️'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 truncate" title={record.name}>
                              {record.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Uploaded {new Date(record.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={record.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-center bg-gray-50 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 hover:border-teal-200 rounded-lg py-2 mt-4 text-[11px] font-bold text-gray-700 transition-all"
                        >
                          View / Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setEhrModalOpen(false)}
                className="bg-gray-950 text-white font-semibold px-6 py-2 rounded-xl text-xs hover:bg-gray-800 transition-colors"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Appointment & Prescription Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <form
            onSubmit={handleCompleteAppointment}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-4">
              ✔
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Complete Appointment</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Mark this appointment as complete. You can optionally attach a prescription file (PDF or Image) which will be stored securely in the patient's medical history.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Attach Prescription File (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setPrescriptionFile(e.target.files[0])}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 file:cursor-pointer hover:file:bg-teal-100"
                  />
                </div>
                {prescriptionFile && (
                  <p className="text-[10px] text-emerald-600 mt-1.5 font-medium">
                    ✓ Attached: {prescriptionFile.name} ({(prescriptionFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                disabled={completing}
                className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={completing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1"
              >
                {completing ? 'Completing...' : 'Mark Completed'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
