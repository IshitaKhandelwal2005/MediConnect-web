import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
  const {
    dtoken,
    doctorDashData,
    getDoctorDashData,
    cancelDoctorAppointment,
    slotDateFormat,
    currencySymbol,
    backendUrl
  } = useContext(AppContext);

  // Complete Appointment Modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingAppointmentId, setCompletingAppointmentId] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (dtoken) {
      getDoctorDashData();
    }
  }, [dtoken]);

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
        getDoctorDashData();
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

  return doctorDashData && (
    <div className='m-5'>
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-grap-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-10' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-lg font-semibold text-gray-600'>{currencySymbol}{doctorDashData.earnings}</p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </div>

        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-grap-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-10' src={assets.appointment_icon} alt="" />
          <div>
            <p className='text-lg font-semibold text-gray-600'>{doctorDashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>

        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-grap-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-10' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-lg font-semibold text-gray-600'>{doctorDashData.patients}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>
      </div>

      <div className='bg-white '>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Booking</p>
        </div>
      </div>

      <div className='pt-4 border border-t-0 bg-white'>
        {doctorDashData.latestAppointments.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            No bookings yet.
          </div>
        ) : (
          doctorDashData.latestAppointments.map((item, index) => (
            <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-50 border-b last:border-b-0' key={index}>
              <img className='rounded-full w-10' src={item.userData.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-850 font-medium'>{item.userData.name}</p>
                <p className='text-gray-400'>{slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled ? (
                <p className='text-red-400 text-xs font-medium bg-red-50 border border-red-100 px-2 py-0.5 rounded-full'>Cancelled</p>
              ) : item.isCompleted ? (
                <p className='text-emerald-500 text-xs font-medium bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full'>Completed</p>
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
          ))
        )}
      </div>

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
            <p className="text-xs text-gray-450 mb-6 leading-relaxed">
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
                  <p className="text-[10px] text-emerald-650 mt-1.5 font-medium">
                    ✓ Attached: {prescriptionFile.name} ({(prescriptionFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 text-sm">
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
}

export default DoctorDashboard;
