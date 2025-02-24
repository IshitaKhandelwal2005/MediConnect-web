import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

function AllAppointments() {
  const { atoken, getAllAppointments, appointments,cancelAppointment } = useContext(AdminContext);
  const {calculateAge,slotDateFormat,currency}=useContext(AppContext)
  useEffect(() => {
    if (atoken) {
      getAllAppointments();
    }
  }, [atoken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date and Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>
        {appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-100"
              key={index}
            >
              <p className="max-sm:hidden">{index + 1}</p>
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={item?.userData?.image || "/default-avatar.png"}
                  alt="User"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
                <p>{item?.userData?.name || "Unknown"}</p>
              </div>
              <p>{calculateAge(item.userData.dob) || "--"}</p>
              <p>{slotDateFormat(item.slotDate) || "Not Available"},{item.slotTime || "not "}</p>
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full' src={item.docData.image} alt="" />
                <p>{item.docData.name}</p>
              </div>
              <p>{currency}{item.amount || '--'}</p>
              {item.cancelled
              ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                :
                item.isCompleted ?
                <p className='text-green-500 text-xs font-medium'>Completed</p>
                 :<img onClick={()=>cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
              }
            </div>
          ))
        ) : (
          <p className="text-center py-5 text-gray-500">No appointments found.</p>
        )}
      </div>
    </div>
  );
}

export default AllAppointments;
