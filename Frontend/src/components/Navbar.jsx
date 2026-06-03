import React, { useContext, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {assets} from '../assets/assets'
import { AppContext } from '../context/AppContext'
const Navbar=()=> {
    const navigate=useNavigate();
    const {token,setToken,userData}=useContext(AppContext)
    const [showMenu,setShowMenu]=useState(false)
    const logout =()=>{
        setToken(false)
        localStorage.removeItem('token')
    }
  return (
    <div className='flex items-center justify-between text-sm py-4 px-4 sm:px-8 border-b border-b-gray-400 bg-white sticky top-0 z-50'>
        <img onClick={()=>{navigate('/')}} className='w-44 cursor-pointer' src={assets.logo} alt="logo" />
        <ul className='hidden md:flex items-start gap-8 font-medium'>
            <NavLink to='/' className={({isActive})=>isActive?'text-[#002000]':'text-gray-700'}>
                <li className='py-1 hover:text-[#002000] transition-colors'>HOME</li>
                <hr className='border-none outline-none h-0.5 bg-[#002000] w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to='/doctors' className={({isActive})=>isActive?'text-[#002000]':'text-gray-700'}>
                <li className='py-1 hover:text-[#002000] transition-colors'>ALL DOCTORS</li>
                <hr className='border-none outline-none h-0.5 bg-[#002000] w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to='/about' className={({isActive})=>isActive?'text-[#002000]':'text-gray-700'}>
                <li className='py-1 hover:text-[#002000] transition-colors'>ABOUT</li>
                <hr className='border-none outline-none h-0.5 bg-[#002000] w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to='/contact' className={({isActive})=>isActive?'text-[#002000]':'text-gray-700'}>
                <li className='py-1 hover:text-[#002000] transition-colors'>CONTACT</li>
                <hr className='border-none outline-none h-0.5 bg-[#002000] w-3/5 m-auto hidden'/>
            </NavLink>
        </ul>
        <div className='flex items-center gap-4'>
            {
                token && userData?
                <div className='flex items-center gap-2 cursor-pointer group relative'>
                   <img className='w-8 sm:w-10 rounded-full' src={userData.image} alt="profile" /> 
                   <img src={assets.dropdown_icon} alt="dropdown" />
                   <div className='absolute top-0 right-0 pt-16 text-base font-medium z-20 hidden group-hover:block'>
                    <div className='text-gray-600 min-w-48 rounded-lg bg-white shadow-lg flex flex-col gap-4 p-4 border'>
                        <p className='hover:text-black cursor-pointer' onClick={()=>navigate('/my-profile')}>My Profile</p>
                        <p className='hover:text-black cursor-pointer' onClick={()=>navigate('/my-appointments')}>My Appointments</p>
                        <p className='hover:text-black cursor-pointer' onClick={logout}>Logout</p>
                    </div>
                   </div>
                </div>
                :<button onClick={()=>navigate('/login')} className='bg-[#002000] text-white rounded-full px-6 py-3 hover:bg-[#003300] transition-colors'>Create Account</button>
            }
            <img onClick={()=>setShowMenu(true)} className='w-10 md:hidden' src={assets.menu_icon} alt="" />
            
            <div className={`${showMenu ? 'fixed w-full':'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
                <div className='flex items-center justify-between px-5 py-6'>
                    <img className='w-36' src={assets.logo} alt="" />
                    <img className='w-7' onClick={()=>setShowMenu(false)} src={assets.cross_icon} alt="" />
                </div>
                <ul className='flex flex-col items-center gap-4 mt-5 px-5 text-lg font-medium'>
                    <NavLink onClick={()=>setShowMenu(false)} to='/'><p className='px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors'> Home</p></NavLink>
                    <NavLink onClick={()=>setShowMenu(false)} to='/doctors'><p className='px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors'>All Doctors</p></NavLink>
                    <NavLink onClick={()=>setShowMenu(false)} to='/about'><p className='px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors'>About</p></NavLink>
                    <NavLink onClick={()=>setShowMenu(false)} to='/contact'><p className='px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors'>Contact</p></NavLink>
                </ul>
            </div>
        </div>
    </div>
  )
}

export default Navbar