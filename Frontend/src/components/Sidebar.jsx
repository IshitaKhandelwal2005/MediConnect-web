import React, { useContext } from 'react'
import { useAuthContext } from '../context/AuthContext';import {NavLink} from 'react-router-dom'
import { assets } from '../assets/assets'
function Sidebar() {

  const { atoken, dtoken } = useAuthContext();
  return (
    <div className='min-h-screen bg-white border-r border-gray-200 w-64 flex-shrink-0'>
        {
          atoken &&
          <ul className='text-gray-700 mt-6 px-4 space-y-2'>

          <NavLink to={'/admin-dashboard'} className={({isActive})=> `flex items-center gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all ${isActive?'bg-[#002000] text-white':'hover:bg-gray-100'}`}>
            <img src={assets.home_icon} alt="" className='w-5 h-5' />
            <p className='font-medium'>Dashboard</p>
          </NavLink>
          <NavLink to={'/all-appointments'} className={({isActive})=> `flex items-center gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all ${isActive?'bg-[#002000] text-white':'hover:bg-gray-100'}`}>
            <img src={assets.appointment_icon} alt="" className='w-5 h-5' />
            <p className='font-medium'>Appointments</p>
          </NavLink>
          <NavLink to={'doctor-list'} className={({isActive})=> `flex items-center gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all ${isActive?'bg-[#002000] text-white':'hover:bg-gray-100'}`}>
            <img src={assets.people_icon} alt="" className='w-5 h-5' />
            <p className='font-medium'>Doctors List</p>
          </NavLink>

          </ul>
        }
        {
          dtoken &&
          <ul className='text-gray-700 mt-6 px-4 space-y-2'>

          <NavLink to={'/doctor-dashboard'} className={({isActive})=> `flex items-center gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all ${isActive?'bg-[#002000] text-white':'hover:bg-gray-100'}`}>
            <img src={assets.home_icon} alt="" className='w-5 h-5' />
            <p className='font-medium'>Dashboard</p>
          </NavLink>
          <NavLink to={'/doctor-appointments'} className={({isActive})=> `flex items-center gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all ${isActive?'bg-[#002000] text-white':'hover:bg-gray-100'}`}>
            <img src={assets.appointment_icon} alt="" className='w-5 h-5' />
            <p className='font-medium'>Appointments</p>
          </NavLink>
          <NavLink to={'doctor-profile'} className={({isActive})=> `flex items-center gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all ${isActive?'bg-[#002000] text-white':'hover:bg-gray-100'}`}>
            <img src={assets.people_icon} alt="" className='w-5 h-5' />
            <p className='font-medium'>Profile</p>
          </NavLink>

          </ul>
        }
    </div>
  )
}

export default Sidebar