import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Footer=()=> {
    const navigate=useNavigate()
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col md:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
            <div >
                <img className='w-40 mb-2' src={assets.logo} alt="" />
                <p className='w-full md:w-3/4 text-gray-600 leading-6'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Natus, esse dolor qui repellat ullam nihil porro voluptates, velit deleniti corrupti inventore dignissimos reprehenderit voluptatum alias veritatis nemo ratione laboriosam! Earum.</p>
            </div>
            <div >
                <p className='text-xl font-medium mb-5'>Company</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li className='cursor-pointer' onClick={()=>{navigate('/home');scrollTo(0,0)}}>Home</li>
                    <li className='cursor-pointer' onClick={()=>{navigate('/about');scrollTo(0,0)}}>About Us</li>
                    <li className='cursor-pointer' onClick={()=>{navigate('/contact');scrollTo(0,0)}}>Contact Us</li>
                    <li className='cursor-pointer' onClick={()=>{navigate('/');scrollTo(0,0)}}>Privacy Policy</li>
                </ul>
            </div>
            <div >
                <p className='text-xl font-medium mb-5'>Get In Touch</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>+1-101-9875-1258</li>
                    <li>MediConnect@gmail.com</li>
                </ul>
            </div>
        </div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright 2025@ MediConnect-All Rights Reserved.</p>
    </div>
  )
}

export default Footer