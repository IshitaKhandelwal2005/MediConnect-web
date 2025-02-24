import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner=() =>{
    const navigate=useNavigate()
  return (
    <div className='flex bg-[#1D2129] justify-center text-center items-center rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10'>
        <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
            <p className='text-white font-medium text-2xl md:text-4xl'>Book Apppointment</p>
            <p className='text-white font-medium text-2xl md:text-4xl py-4'>With 100+ trusted doctors </p>
            <button className='bg-gray-200 rounded-full px-8 py-4 mt-4 hover:scale-110 transition-all' onClick={()=>{navigate('/login'); scrollTo(0,0)}}>Create Account</button>
        </div>
        <div>
            <img className='hidden relative md:block bottom-0 right-0 max-w-md' src={assets.appointment_img} alt="" />
        </div>
    </div>
  )
}

export default Banner