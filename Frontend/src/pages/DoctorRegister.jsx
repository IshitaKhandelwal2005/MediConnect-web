import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function DoctorRegister() {
  const [docImg, setDocImg] = useState(false)
  const [docFile, setDocFile] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General Physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [loading, setLoading] = useState(false)

  const { backendUrl } = useContext(AppContext)
  const navigate = useNavigate()

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    if (!docImg) {
      return toast.error('Profile image is required')
    }
    if (!docFile) {
      return toast.error('Verification document is required')
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', docImg)
      formData.append('document', docFile)
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', fees)
      formData.append('about', about)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

      const { data } = await axios.post(backendUrl + '/api/doctor/register', formData)

      if (data.success) {
        toast.success(data.message || 'Registration submitted! Pending admin approval.')
        navigate('/login')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-[80vh] flex items-center justify-center py-10 px-4'>
      <form className='w-full max-w-4xl bg-white border border-zinc-200 shadow-xl rounded-2xl p-8 text-zinc-600 text-sm' onSubmit={onSubmitHandler}>
        <div className='mb-6'>
          <h2 className='text-2xl font-semibold text-neutral-800'>Doctor Registration</h2>
          <p className='text-gray-400 mt-1'>Please fill in your professional details and upload verification documents.</p>
        </div>

        <div className='flex flex-col md:flex-row gap-8 mb-8'>
          {/* Profile Picture Upload */}
          <div className='flex flex-col items-center gap-2 border border-dashed border-zinc-300 rounded-xl p-4 flex-1 justify-center bg-zinc-50'>
            <p className='font-medium text-neutral-700'>Profile Photo</p>
            <label htmlFor='doc-img' className='cursor-pointer flex flex-col items-center'>
              <img className='w-24 h-24 bg-zinc-200 rounded-full object-cover border-2 border-zinc-300 hover:scale-105 transition-all duration-300' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
            </label>
            <input onChange={(e) => setDocImg(e.target.files[0])} type='file' id='doc-img' className='hidden' accept='image/*' />
            <span className='text-xs text-zinc-400 mt-1'>{docImg ? docImg.name : 'Select JPG/PNG image'}</span>
          </div>

          {/* Verification Document Upload */}
          <div className='flex flex-col items-center gap-2 border border-dashed border-zinc-300 rounded-xl p-4 flex-1 justify-center bg-zinc-50'>
            <p className='font-medium text-neutral-700'>Official Verification Document (PDF/Image)</p>
            <label htmlFor='doc-file' className='cursor-pointer flex flex-col items-center justify-center p-3 bg-zinc-200 rounded-lg border-2 border-zinc-300 hover:bg-zinc-300 transition-all duration-300 w-16 h-16'>
              <img className='w-8 h-8 opacity-70' src={assets.upload_area} alt="" />
            </label>
            <input onChange={(e) => setDocFile(e.target.files[0])} type='file' id='doc-file' className='hidden' accept='image/*,.pdf' />
            <span className='text-xs text-zinc-400 mt-1'>{docFile ? docFile.name : 'Upload degree or license doc'}</span>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10'>
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <p className='font-medium'>Doctor Name</p>
              <input onChange={(e) => setName(e.target.value)} value={name} className='border border-zinc-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-neutral-800' type='text' placeholder='Name' required />
            </div>
            <div className='flex flex-col gap-1'>
              <p className='font-medium'>Doctor Email</p>
              <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-zinc-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-neutral-800' type='email' placeholder='Email' required />
            </div>
            <div className='flex flex-col gap-1'>
              <p className='font-medium'>Doctor Password</p>
              <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-zinc-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-neutral-800' type='password' placeholder='Password' required />
            </div>
            <div className='flex flex-col gap-1'>
              <p className='font-medium'>Experience</p>
              <select onChange={(e) => setExperience(e.target.value)} value={experience} className='border border-zinc-300 bg-white rounded-lg px-3 py-2 w-full focus:outline-none focus:border-neutral-800'>
                <option value='1 Year'>1 Year</option>
                <option value='2 Year'>2 Year</option>
                <option value='3 Year'>3 Year</option>
                <option value='4 Year'>4 Year</option>
                <option value='5 Year'>5 Year</option>
                <option value='6 Year'>6 Year</option>
                <option value='7 Year'>7 Year</option>
                <option value='8 Year'>8 Year</option>
                <option value='9 Year'>9 Year</option>
                <option value='10 Year'>10 Year</option>
                <option value='12+ Years'>12+ Years</option>
              </select>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='font-medium'>Consultation Fees</p>
              <input onChange={(e) => setFees(e.target.value)} value={fees} className='border border-zinc-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-neutral-800' type='number' placeholder='Fees' required />
            </div>
          </div>

          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <p className='font-medium'>Speciality</p>
              <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className='border border-zinc-300 bg-white rounded-lg px-3 py-2 w-full focus:outline-none focus:border-neutral-800'>
                <option value='General Physician'>General Physician</option>
                <option value='Gynecologist'>Gynecologist</option>
                <option value='Dermatologist'>Dermatologist</option>
                <option value='Pediatricians'>Pediatricians</option>
                <option value='Neurologist'>Neurologist</option>
                <option value='Gastroenterologist'>Gastroenterologist</option>
              </select>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='font-medium'>Education / Degree</p>
              <input onChange={(e) => setDegree(e.target.value)} value={degree} className='border border-zinc-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-neutral-800' type='text' placeholder='Education' required />
            </div>
            <div className='flex flex-col gap-1'>
              <p className='font-medium'>Clinic Address</p>
              <input onChange={(e) => setAddress1(e.target.value)} value={address1} className='border border-zinc-300 rounded-lg px-3 py-2 w-full mb-2 focus:outline-none focus:border-neutral-800' type='text' placeholder='Address Line 1' required />
              <input onChange={(e) => setAddress2(e.target.value)} value={address2} className='border border-zinc-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-neutral-800' type='text' placeholder='Address Line 2' required />
            </div>
          </div>
        </div>

        <div className='mt-6'>
          <p className='font-medium mb-1'>About Doctor</p>
          <textarea onChange={(e) => setAbout(e.target.value)} value={about} className='w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-800' placeholder='Write details about yourself, specialization, achievements...' rows={4} required />
        </div>

        <div className='mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-zinc-100 pt-6'>
          <button type='button' onClick={() => navigate('/login')} className='text-zinc-500 hover:text-neutral-800 font-medium transition-all py-2 px-4'>
            Already registered? Login here
          </button>
          <button type='submit' disabled={loading} className='w-full sm:w-auto bg-[#1D2129] text-white hover:bg-neutral-800 font-medium py-3 px-12 rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed'>
            {loading ? 'Submitting Registration...' : 'Register Professional Account'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DoctorRegister
