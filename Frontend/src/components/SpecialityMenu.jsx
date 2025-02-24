import React from 'react'
import { specialityData } from '../assets/assets'
import {Link} from 'react-router-dom'
const SpecialityMenu =()=> {
  return (
    <div id='speciality' className='flex flex-col items-center gap-4 py-16 text-gray-800'>
        <h1 className='text-3xl font-medium'>Find by Speciality</h1>
        <p className='font-light text-center text-sm sm:w-1/3'>Simply browse through our extensive list of trusted doctors,schedule your appointment hassle-free.</p>
        <div className='flex flex-wrap justify-center gap-4 pt-5 w-full'>
            {specialityData.map((item,index)=>(
                <Link onClick={()=>scrollTo(0,0)} className='cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index} to={`/doctors/${item.speciality}`}>
                    <img src={item.image} alt="" />
                    <p className='text-center'>{item.speciality}</p>
                </Link>
            ))}
        </div>
    </div>
  )
}

export default SpecialityMenu