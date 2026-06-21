import React, { useContext, useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';import axios from 'axios'
import { toast } from 'react-toastify'
import StripePayment from '../components/StripePayment'
const MyAppointments =()=> {


  const { backendUrl, currencySymbol, getDoctorsData } = useAppContext();
  const { token } = useAuthContext();
  const [appointments,setAppointments] =useState([])
  const [showPayment, setShowPayment] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  
  // Receipt Modal state
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptAppointment, setReceiptAppointment] = useState(null)

  const months= ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  const openReceiptModal = (appointment) => {
    setReceiptAppointment(appointment)
    setShowReceipt(true)
  }


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
        getDoctorsData() // Refresh doctor slots so the freed time reappears in the booking UI
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
                  
                  {/* Receipts & Prescriptions access */}
                  {!item.cancelled && (item.payment || item.isCompleted) && (
                    <button onClick={() => openReceiptModal(item)} className='text-xs text-teal-700 text-center sm:min-w-48 py-2 border border-teal-200 rounded bg-teal-50/30 hover:bg-teal-50 hover:text-teal-850 font-medium transition-all duration-300 shadow-sm'>
                      View Receipt
                    </button>
                  )}
                  {item.isCompleted && item.prescription && (
                    <a href={item.prescription} target="_blank" rel="noopener noreferrer" className='text-xs text-emerald-700 text-center sm:min-w-48 py-2 border border-emerald-200 rounded bg-emerald-50/30 hover:bg-emerald-50 hover:text-emerald-850 font-bold transition-all duration-300 shadow-sm flex items-center justify-center gap-1'>
                      📄 Prescription
                    </a>
                  )}
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

      {/* Online Payment Receipt Modal */}
      {showReceipt && receiptAppointment && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border animate-in fade-in zoom-in-95 duration-200 relative text-gray-700'>
            <button
              onClick={() => setShowReceipt(false)}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg font-bold'
            >
              ✕
            </button>
            <div className='text-center border-b pb-4 mb-4'>
              <h3 className='text-lg font-extrabold text-teal-950'>Payment Receipt</h3>
              <p className='text-[10px] text-gray-450 mt-1 font-mono'>Receipt No: REC-{receiptAppointment._id.slice(-6).toUpperCase()}</p>
            </div>
            
            <div className='space-y-4 text-xs'>
              <div className='flex justify-between'>
                <span className='font-medium text-gray-400'>Date & Time:</span>
                <span className='text-gray-900 font-bold'>{slotDateFormat(receiptAppointment.slotDate)} | {receiptAppointment.slotTime}</span>
              </div>
              
              <div className='border-t pt-3'>
                <p className='text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-1.5'>Patient Details</p>
                <div className='flex justify-between'>
                  <span className='font-medium text-gray-400'>Name:</span>
                  <span className='text-gray-950 font-semibold'>{receiptAppointment.userData.name}</span>
                </div>
              </div>

              <div className='border-t pt-3'>
                <p className='text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-1.5'>Provider Details</p>
                <div className='flex justify-between'>
                  <span className='font-medium text-gray-400'>Doctor:</span>
                  <span className='text-gray-950 font-semibold'>{receiptAppointment.docData.name}</span>
                </div>
                <div className='flex justify-between mt-1'>
                  <span className='font-medium text-gray-400'>Speciality:</span>
                  <span className='text-gray-950 font-semibold'>{receiptAppointment.docData.speciality}</span>
                </div>
              </div>

              <div className='border-t border-b py-3 my-2 bg-teal-50/30 px-3 rounded-xl border-dashed border-teal-200'>
                <div className='flex justify-between items-center'>
                  <span className='font-bold text-teal-950 text-sm'>Total Paid</span>
                  <span className='text-base font-extrabold text-teal-950'>{currencySymbol || '₹'}{receiptAppointment.amount}</span>
                </div>
                <div className='flex justify-between items-center mt-1 text-[10px] text-emerald-600 font-bold'>
                  <span>Status</span>
                  <span className='flex items-center gap-1'>✓ Paid Online</span>
                </div>
              </div>
            </div>

            <div className='mt-6 flex gap-3'>
              <button
                onClick={() => setShowReceipt(false)}
                className='flex-1 bg-gray-950 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-md'
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className='flex-1 bg-teal-50 border border-teal-200 hover:bg-teal-150 text-teal-700 font-semibold py-2.5 rounded-xl text-xs transition-all'
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments