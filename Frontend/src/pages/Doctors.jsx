import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
const Doctors =()=> {
  const {speciality}=useParams();
  const [filterDoc,setFilterDoc]=useState([]);
  const [showFilter,setShowFilter]=useState(false)
  const {doctors}=useContext(AppContext);
  const navigate=useNavigate();

  const applyFilter =()=>{
    if(speciality){
      setFilterDoc(doctors.filter(doc => doc.speciality===speciality))
    }else{
      setFilterDoc(doctors)
    }

  }
  useEffect(()=>{applyFilter()},[doctors,speciality])
  return (
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-[#1D2129] text-white':''}`} onClick={()=>setShowFilter(prev => !prev)}>Filters</button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter? 'flex':'hidden sm:flex'}`}>
          <p onClick={()=>speciality==='General physician' ? navigate('/doctors') : navigate('/doctors/General physician')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>General physician</p>
          <p onClick={()=>speciality==='Gynecologist' ? navigate('/doctors') : navigate('/doctors/Gynecologist')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>Gynecologist</p>
          <p onClick={()=>speciality==='Dermatologist' ? navigate('/doctors') : navigate('/doctors/Dermatologist')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>Dermatologist</p>
          <p onClick={()=>speciality==='Pediatricians' ? navigate('/doctors') : navigate('/doctors/Pediatricians')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>Pediatricians</p>
          <p onClick={()=>speciality==='Neurologist' ? navigate('/doctors') : navigate('/doctors/Neurologist')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>Neurologist</p>
          <p onClick={()=>speciality==='Gastroenterologist' ? navigate('/doctors') : navigate('/doctors/Gastroenterologist')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>Gastroenterologist</p>
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {
            filterDoc.map((item,index)=>(
              <div onClick={()=>navigate(`/appointments/${item._id}`)} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                  <img className='bg-[#1D2129]' src={item.image} alt="" />
                  <div className='p-4 bg-gray-50 text-gray-700'>
                  <div className={`flex items-center gap-2 text-sm text-center ${item.available?'text-green-500':'text-gray-600'}`}>
                            <p className={`w-2 h-2 ${item.available ? ' bg-green-500':'bg-gray-600'} rounded-full`}></p><p>{item.available ? 'Available':'Not Available'}</p>
                        </div>
                      <p className='text-lg font-medium'>{item.name}</p>
                      <p className='text-sm'>{item.speciality}</p>
                  </div>
              </div>
          ))
          }
        </div>
      </div>
    </div>
  )
}

export default Doctors