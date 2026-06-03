import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorDashboard = () => {

  const {dtoken,doctorDashData,getDoctorDashData,completeAppointment,cancelDoctorAppointment,slotDateFormat,currencySymbol}=useContext(AppContext)
  useEffect(()=>{
    if(dtoken)
    {
      getDoctorDashData()
    }
  },[dtoken])


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
          
                  <div className='pt-4 border border-t-0'>
                    {
                      doctorDashData.latestAppointments.map((item,index)=>(
                        <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
                          <img className='rounded-full w-10' src={item.userData.image} alt="" />
                          <div className='flex-1 text-sm'>
                            <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                            <p className='text-gray-600'>{slotDateFormat(item.slotDate)}</p>
                          </div>
                          {
                                          item.cancelled ? 
                                          <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                                          :
                                          item.isCompleted ?
                                          <p className='text-green-500 text-xs font-medium'>Completed</p>
                                          :
                                          <div className='flex'>
                                          <img onClick={()=>cancelDoctorAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                                          <img onClick={()=>completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                                        </div>
                          }
                        </div>
          
                      ))
                    }
                  </div>
      </div>
    )
}

export default DoctorDashboard
