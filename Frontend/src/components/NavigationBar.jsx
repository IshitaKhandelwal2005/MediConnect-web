import React,{useContext}from 'react'
import { assets } from '../assets/assets'
import { useAuthContext } from '../context/AuthContext';
import { useAdminContext } from '../context/AdminContext';
import { useDoctorContext } from '../context/DoctorContext';
import { useAppContext } from '../context/AppContext';
import {useNavigate} from 'react-router-dom'
import axios from 'axios';

function NavigationBar() {
    const { atoken, setAToken, dtoken, setDToken } = useAuthContext();
    const { setDashData, setAdminDoctors } = useAdminContext();
    const { setProfileData, setDoctorAppointments } = useDoctorContext();
    const { backendUrl } = useAppContext();
    const navigate = useNavigate();

    const logout = async () => {
        try {
            if (atoken) await axios.post(backendUrl + '/api/admin/logout');
            if (dtoken) await axios.post(backendUrl + '/api/doctor/logout');
        } catch(err) { console.log(err) }
        
        localStorage.removeItem('atoken')
        localStorage.removeItem('dtoken')
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