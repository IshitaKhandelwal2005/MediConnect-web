import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {AppContext} from '../context/AppContext'
import { assets } from '../assets/assets';
import axios from 'axios'
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
const Appointments =()=> {
  const {docId}=useParams();
  const {doctors,currencySymbol,backendUrl,token,getDoctorsData}=useContext(AppContext);
  const [docInfo,setDocInfo]=useState(null);
  const [docSlots,setDocSlots]=useState([])
  const [slotIndex,setSlotIndex]=useState(0)
  const [slotTime,setSlotTime]=useState('')
  const navigate=useNavigate()
  const daysOfWeek =['SUN','MON','TUE','WED','THU','FRI','SAT']
  const fetchDocInfo =async()=>{
    const docInfo =doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }
  
  const getAvailableSlots =async()=>{
    if (!docInfo || !docInfo.slots_booked) {
      return; // Exit function early if docInfo is null or slots_booked is undefined
    }
  
    setDocSlots([])

    let today=new Date()
    for(let i=0;i<7;i++)
    {
      let currentDate=new Date(today)
      currentDate.setDate(today.getDate()+i)

      let endtime =new Date()
      endtime.setDate(today.getDate()+i)
      endtime.setHours(21,0,0,0)

      if(today.getDate()===currentDate.getDate())
      {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours()+1 : 10)
        currentDate.setMinutes(currentDate.getMinutes()>30 ? 30:0)

      }
      else
      {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots =[]
      while(currentDate<endtime)
      {
        let formattedTime =currentDate.toLocaleTimeString([],{hour: '2-digit',minute:'2-digit'})
        
        let day=currentDate.getDate()
        let month=currentDate.getMonth()+1
        let year=currentDate.getFullYear()

        const slotDate=day +"_" + month +"_"+year
        const slotTime =formattedTime

        const isSlotAvailable=docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false: true

        if(isSlotAvailable)
        {
          timeSlots.push({
            datetime:new Date(currentDate),
            time:formattedTime
          })
        }
        

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }
      setDocSlots(prev => ([...prev,timeSlots]))

    }
  }

  const bookAppointment = async()=>{
    if(!token){
      toast.warn('Login to book Appointment')
      return navigate('/login')
    }

    try{
      const date=docSlots[slotIndex][0].datetime

      let day=date.getDate()
      let month=date.getMonth()+1;
      let year=date.getFullYear()

      const slotDate =day + "_" +month +"_"+year
      const {data}=await axios.post(backendUrl +'/api/user/book-appointment',{docId,slotDate,slotTime},{headers:{token}})
      if(data.success)
      {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
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

  useEffect(()=>{
    fetchDocInfo()
  },[doctors,docId])


  useEffect(()=>{
    getAvailableSlots()
  },[docInfo])

  useEffect(()=>{
    
  },[docSlots])


  if (!docInfo) {
    return <p>Not Found...</p>;
  }
  return (
    <div>
      <div className='flex flex-col sm:flex-row gap-4 mx-3 md:mx-5 lg:mx-8'>
        <div>
          <img className='bg-[#1D2129] rounded-lg w-full sm:max-w-72' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border-2 border-gray-400 rounded-lg p-8 py-7 mx-2 sm:mx-0 sm:mt-0'>
          <p className='flex gap-2 items-center text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full' >{docInfo.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img className='cursor-pointer' src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>
      <div className='mx-4 md:mx-8 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item,index)=>(
              <div onClick={()=>setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex===index ? 'bg-[#1D2129] text-white' :'border border-gray-400'}`} key={index}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length && docSlots[slotIndex].map((item,index)=>(
            <p onClick={()=>setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-[#1D2129] text-white' :' text-gray-400 border border-gray-400'}`} key={index}>
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>
        <div>
          <button onClick={bookAppointment} className='bg-[#1D2129] rounded-full text-white text-sm font-light px-14 py-3 my-6'>Book an Appointment</button>
        </div>
      </div>
      <RelatedDoctors docId={docId} speciality={docInfo.speciality}/>
    </div>
  )
}

export default Appointments