import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import StripePayment from '../components/StripePayment'
const MyAppointments =()=> {


  const {backendUrl,token}=useContext(AppContext)
  const [appointments,setAppointments] =useState([])
  const [showPayment, setShowPayment] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const months= ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]


  const slotDateFormat =(slotDate)=>{
    const dateArray =slotDate.split('_')
    return dateArray[0]+ " "+ months[Number(dateArray[1])]+" "+dateArray[2]
  }
  const getUserAppointments =async() =>{
    try{
      const {data}=await axios.get(backendUrl+'/api/user/appointments',{headers:{token}})

      if(data.success)
      {
        setAppointments(data.appointments.reverse())
      }
    }
    catch(error)
    {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment =async (appointmentId) =>{
    try{
      const {data}=await axios.post(backendUrl +'/api/user/cancel-appointment',{appointmentId},{headers:{token}})
      if(data.success)
      {
        toast.success(data.message)
        getUserAppointments()
      }
      else
      {
        toast.error(data.message)
      }

    }
    catch(error)
    {
      console.log(error)
      toast.error(error.message)
    }
  }

  const handlePayment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    getUserAppointments()
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
    setSelectedAppointment(null)
  }

  
  useEffect(()=>{

    if(token)
    {
      getUserAppointments()
    }
  },[token])
  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
      <div>
        {
          appointments.map((item,index)=>(
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
              <div>
                <img className='w-32 bg-[#1D2129]' src={item.docData.image} alt="" />
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                <p>{item.docData.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                <p className='text-xs'>{item.docData.address.line1}</p>
                <p className='text-xs'>{item.docData.address.line2}</p>
                <p className='text-xs mt-1'><span>Date and Time :</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
              </div>
              <div></div>
              <div className='flex flex-col gap-2 justify-end'>
                  {!item.cancelled && !item.isCompleted && !item.payment && <button onClick={()=>handlePayment(item)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-[#1D2129] hover:text-white transition-all duration-300'>Pay Online</button>}
                  {!item.cancelled && !item.isCompleted && <button onClick={()=>cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-[#1D2129] hover:text-white transition-all duration-300'>Cancel Appointment</button>}
                  {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
                  {item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}
                  {item.payment && !item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Paid</button>}
              </div>
            </div>
          ))
        }
      </div>

      {showPayment && selectedAppointment && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <StripePayment
            appointmentId={selectedAppointment._id}
            amount={selectedAppointment.amount}
            doctorName={selectedAppointment.docData.name}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      )}
    </div>
  )
}

export default MyAppointments