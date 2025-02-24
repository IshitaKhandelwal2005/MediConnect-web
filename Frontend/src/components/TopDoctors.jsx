import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
const TopDoctors=()=> {
    const navigate=useNavigate()
    const {doctors}=useContext(AppContext)
  return (
    <div className='flex flex-col gap-4 items-center text-gray-800 my-16 md:mx-10'>
        <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
        <p className='font-light sm:w-1/3 text-center text-sm'>Simply browse through the extensive list of trusted doctors.</p>
        <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
            {doctors.slice(0,10).map((item,index)=>(
                <div onClick={()=>{navigate(`/appointments/${item._id}`);scrollTo(0,0)}} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                    <img className='bg-[#1D2129]' src={item.image} alt="" />
                    <div className='p-4 bg-gray-50 text-gray-700'>
                        <div className={`flex items-center gap-2 text-sm text-center ${item.available?'text-green-500':'text-gray-600'}`}>
                            <p className={`w-2 h-2 ${item.available ? ' bg-green-500':'bg-gray-600'} rounded-full`}></p><p>{item.available ? 'Available':'Not Available'}</p>
                        </div>
                        <p className='text-lg font-medium'>{item.name}</p>
                        <p className='text-sm'>{item.speciality}</p>
                    </div>
                </div>
            ))}
        </div>
        <button onClick={()=>{navigate('/doctors');scrollTo(0,0)}} className='bg-[#1D2129] rounded-full text-white px-12 py-3 mt-10 hover:scale-110 transition-all'>More</button>
    </div>
  )
}

export default TopDoctors