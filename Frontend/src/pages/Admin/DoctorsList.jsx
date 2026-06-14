import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'

function DoctorsList() {
  const { adminDoctors, getAllDoctors, atoken, changeAvailability, approveDoctor } = useContext(AppContext)
  const [activeTab, setActiveTab] = useState('active') // 'active' or 'pending'

  useEffect(() => {
    if (atoken) {
      getAllDoctors()
    }
  }, [atoken])

  // Filter doctors based on approval status
  // If isApproved is not explicitly false, we treat them as active (handles pre-existing doctors)
  const activeDoctors = adminDoctors.filter(doc => doc.isApproved !== false)
  const pendingDoctors = adminDoctors.filter(doc => doc.isApproved === false)

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll pr-2'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-200 pb-4 mb-6'>
        <h1 className='text-2xl font-semibold text-neutral-800'>Doctors Management</h1>
        <div className='flex gap-2 mt-4 sm:mt-0 bg-zinc-100 p-1.5 rounded-lg border border-zinc-200'>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'active'
                ? 'bg-white text-neutral-800 shadow-sm'
                : 'text-zinc-500 hover:text-neutral-800'
            }`}
          >
            Active Doctors ({activeDoctors.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2 rounded-md font-medium text-sm transition-all relative ${
              activeTab === 'pending'
                ? 'bg-white text-neutral-800 shadow-sm'
                : 'text-zinc-500 hover:text-neutral-800'
            }`}
          >
            Verification Requests ({pendingDoctors.length})
            {pendingDoctors.length > 0 && (
              <span className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold border-2 border-white animate-pulse'>
                {pendingDoctors.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'active' ? (
        <div className='w-full flex flex-wrap gap-6 pt-2'>
          {activeDoctors.length === 0 ? (
            <p className='text-zinc-400 py-10 w-full text-center'>No active doctors registered yet.</p>
          ) : (
            activeDoctors.map((item, index) => (
              <div
                className='border border-zinc-200 bg-white rounded-2xl max-w-56 w-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group'
                key={index}
              >
                <img
                  className='bg-indigo-50 w-full h-48 object-cover group-hover:scale-105 transition-all duration-500'
                  src={item.image}
                  alt={item.name}
                />
                <div className='p-4'>
                  <p className='text-neutral-800 text-lg font-semibold truncate'>{item.name}</p>
                  <p className='text-zinc-500 text-sm font-medium'>{item.speciality}</p>
                  <div className='flex items-center text-sm gap-2 mt-4 border-t border-zinc-100 pt-3'>
                    <input
                      onChange={() => changeAvailability(item._id)}
                      type='checkbox'
                      checked={item.available}
                      className='w-4 h-4 text-emerald-600 border-zinc-300 rounded focus:ring-emerald-500 cursor-pointer'
                      id={`avail-${item._id}`}
                    />
                    <label htmlFor={`avail-${item._id}`} className='text-zinc-600 font-medium cursor-pointer'>
                      Available
                    </label>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className='w-full flex flex-col gap-4 pt-2'>
          {pendingDoctors.length === 0 ? (
            <p className='text-zinc-400 py-10 w-full text-center'>No verification requests pending.</p>
          ) : (
            pendingDoctors.map((item, index) => (
              <div
                className='border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6'
                key={index}
              >
                <div className='flex items-center gap-4 flex-1'>
                  <img
                    className='w-20 h-20 rounded-full object-cover border border-zinc-200 bg-zinc-50'
                    src={item.image}
                    alt={item.name}
                  />
                  <div>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <h3 className='text-lg font-bold text-neutral-800'>{item.name}</h3>
                      <span className='bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200'>
                        Pending Verification
                      </span>
                    </div>
                    <p className='text-zinc-500 font-semibold text-sm mt-0.5'>
                      {item.degree} — {item.speciality}
                    </p>
                    <p className='text-zinc-400 text-xs mt-1'>
                      Experience: <span className='text-zinc-600 font-medium'>{item.experience}</span> | Fees:{' '}
                      <span className='text-zinc-600 font-medium'>₹{item.fees}</span>
                    </p>
                    <p className='text-zinc-400 text-xs mt-0.5'>
                      Clinic Address:{' '}
                      <span className='text-zinc-600 font-medium'>
                        {item.address.line1}, {item.address.line2}
                      </span>
                    </p>
                    {item.about && (
                      <p className='text-zinc-500 text-xs mt-2 italic line-clamp-2 bg-zinc-50 p-2 rounded-lg border border-zinc-100 max-w-2xl'>
                        "{item.about}"
                      </p>
                    )}
                  </div>
                </div>

                <div className='flex sm:flex-row md:flex-col gap-3 w-full md:w-auto items-stretch'>
                  {item.document && (
                    <a
                      href={item.document}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex-1 text-center bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium py-2 px-5 rounded-full text-xs border border-zinc-300 transition-all shadow-sm'
                    >
                      View Documents
                    </a>
                  )}
                  <button
                    onClick={() => approveDoctor(item._id)}
                    className='flex-1 text-center bg-[#002000] hover:bg-emerald-800 text-white font-medium py-2.5 px-6 rounded-full text-xs transition-all shadow-md'
                  >
                    Approve Doctor
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default DoctorsList