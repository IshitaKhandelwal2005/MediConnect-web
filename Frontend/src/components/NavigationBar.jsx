import React,{useContext}from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import {useNavigate} from 'react-router-dom'
function NavigationBar() {

    const {atoken,setAToken,dtoken,setDToken,setProfileData,setDoctorAppointments,setDashData,setAdminDoctors}=useContext(AppContext)
    const navigate=useNavigate()

    const logout = () => {
      // Clear all tokens from localStorage
      localStorage.removeItem('atoken')
      localStorage.removeItem('dtoken')
      // Clear all context state immediately so UI re-renders clean
      setAToken('')
      setDToken('')
      setProfileData(false)
      setDoctorAppointments([])
      setDashData(false)
      setAdminDoctors([])
      navigate('/')
    }

  return (
    <div className='flex items-center justify-between text-sm py-4 px-8 border-b border-b-gray-400 bg-white'>
        <img onClick={()=>navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="logo" />
        <div className='flex items-center gap-4'>
            <p className='border px-3 py-1 rounded-full border-gray-500 text-gray-600 font-medium'>
                {atoken ? 'Admin Panel' : 'Doctor Panel'}
            </p>
            <button onClick={logout} className='bg-[#002000] text-white rounded-full px-5 py-3 hover:bg-[#003300] transition-colors'>
                Logout
            </button>
        </div>
    </div>
  )
}

export default NavigationBar