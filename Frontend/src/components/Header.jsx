import React from 'react'
import {assets} from '../assets/assets'
const Header =()=> {
  return (
    <div className='flex flex-row flex-wrap bg-[#1D2129] rounded-lg px-6 md:px-10 lg:px-20'>
      <div className='flex flex-col items-center md:items-start md:w-1/2 justify-center gap-6 md:gap-4 py-10 m-auto text-white md:py-[10vw] md:mb-[-30px]'>
        <p className='text-center sm:text-left text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight'>
          Book Appointments <br /> With Trusted Doctors
        </p>
        <div className='flex flex-col md:flex-row font-light items-center gap-3 text-sm'>
          <img className='w-28' src={assets.group_profiles} alt="" />
          <p className='text-center md:text-start'>
            Simply browse through our extensive list of trusted doctors, <br className='hidden md:block'/>schedule your appointment hassle-free.
          </p>
        </div>
        <a href="#speciality" className='flex items-center gap-1 md:gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300'>Book Appointment
          <img className='w-3' src={assets.arrow_icon} alt="" />
        </a>
      </div>
      <div className='md:w-1/2 relative'>
        <img className='w-full md:absolute bottom-0 h-auto rounded-lg' src={assets.header_img} alt="" />
      </div>
    </div>
  )
}

export default Header