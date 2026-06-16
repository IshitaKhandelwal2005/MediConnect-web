import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const Doctors = () => {
  const { speciality } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || '';
  const [searchCity, setSearchCity] = useState(cityParam);
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false)
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchCity(searchParams.get('city') || '');
  }, [searchParams]);

  const handleSearchChange = (value) => {
    setSearchCity(value);
    if (value) {
      setSearchParams({ city: value });
    } else {
      setSearchParams({});
    }
  };

  const handleSpecialityClick = (spec) => {
    const cityQuery = searchCity ? `?city=${encodeURIComponent(searchCity)}` : '';
    if (speciality === spec) {
      navigate(`/doctors${cityQuery}`);
    } else {
      navigate(`/doctors/${spec}${cityQuery}`);
    }
  };

  const applyFilter = () => {
    let filtered = doctors;

    if (speciality) {
      filtered = filtered.filter(doc => doc.speciality === speciality)
    }

    if (searchCity.trim()) {
      const searchLower = searchCity.trim().toLowerCase();
      filtered = filtered.filter(doc => {
        const line1 = doc.address?.line1?.toLowerCase() || '';
        const line2 = doc.address?.line2?.toLowerCase() || '';
        return line1.includes(searchLower) || line2.includes(searchLower);
      });
    }

    setFilterDoc(filtered);
  }

  useEffect(() => { applyFilter() }, [doctors, speciality, searchCity])
  return (
    <div>
      {/* <p className='text-gray-600'>Browse through the doctors specialist.</p>
       */}
      {/* Search Bar */}
      <div className='my-6 max-w-md relative'>
        <input
          type="text"
          placeholder="Search doctors by city..."
          value={searchCity}
          onChange={(e) => handleSearchChange(e.target.value)}
          className='w-full pl-10 pr-10 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D2129] focus:border-transparent transition-all shadow-sm'
        />
        <span className='absolute left-3.5 top-3 text-zinc-400 text-sm'>
          📍
        </span>
        {searchCity && (
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            className='absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600 font-semibold'
          >
            ✕
          </button>
        )}
      </div>

      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-[#1D2129] text-white' : ''}`} onClick={() => setShowFilter(prev => !prev)}>Filters</button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={() => handleSpecialityClick('General physician')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>General physician</p>
          <p onClick={() => handleSpecialityClick('Gynecologist')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>Gynecologist</p>
          <p onClick={() => handleSpecialityClick('Dermatologist')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>Dermatologist</p>
          <p onClick={() => handleSpecialityClick('Pediatricians')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>Pediatricians</p>
          <p onClick={() => handleSpecialityClick('Neurologist')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>Neurologist</p>
          <p onClick={() => handleSpecialityClick('Gastroenterologist')} className='w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded hover:bg-[#1D2129] hover:text-white transition-all cursor-pointer'>Gastroenterologist</p>
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {
            filterDoc.map((item, index) => (
              <div onClick={() => navigate(`/appointments/${item._id}`)} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                <img className='bg-[#1D2129] w-full h-48 object-cover' src={item.image} alt="" />
                <div className='p-4 bg-gray-50 text-gray-700'>
                  <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : 'text-gray-600'}`}>
                    <p className={`w-2 h-2 ${item.available ? ' bg-green-500' : 'bg-gray-600'} rounded-full`}></p><p>{item.available ? 'Available' : 'Not Available'}</p>
                  </div>
                  <p className='text-base font-medium'>{item.name}</p>
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