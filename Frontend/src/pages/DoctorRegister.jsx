import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function DoctorRegister() {
  // Step tracker
  const [step, setStep] = useState(1)

  // Form states
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
  const [confirmPassword, setConfirmPassword] = useState('')
  // Password visibility toggles
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  // OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSending, setOtpSending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const { backendUrl } = useContext(AppContext)
  const navigate = useNavigate()

  // Validate step transitions
  const validateStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error('Please enter your full name')
        return false
      }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        toast.error('Please enter a valid email address')
        return false
      }
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters long')
        return false
      }
      if (!confirmPassword) {
        toast.error('Please confirm your password')
        return false
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match')
        return false
      }
    } else if (step === 2) {
      if (!speciality) {
        toast.error('Please select a speciality')
        return false
      }
      if (!degree.trim()) {
        toast.error('Please enter your educational degree')
        return false
      }
      if (!fees || Number(fees) <= 0) {
        toast.error('Please enter a valid consultation fee')
        return false
      }
    }
    return true
  }

  const nextStep = async () => {
    if (!validateStep()) return
    // Step 3 → Step 4: send OTP
    if (step === 3) {
      if (!address1.trim() || !address2.trim()) { toast.error('Clinic address is required'); return }
      if (!docImg) { toast.error('Profile photo is required'); return }
      if (!docFile) { toast.error('Verification document is required'); return }
      if (!about.trim()) { toast.error('Please write details about yourself'); return }
      setOtpSending(true)
      try {
        const { data } = await axios.post(backendUrl + '/api/doctor/send-otp', { email, name })
        if (data.success) {
          toast.success('OTP sent to ' + email)
          setStep(4)
          setOtp(['', '', '', '', '', ''])
          setResendTimer(60)
        } else {
          toast.error(data.message)
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        setOtpSending(false)
      }
      return
    }
    setStep((prev) => prev + 1)
  }

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer(t => t - 1), 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setOtpSending(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/doctor/send-otp', { email, name })
      if (data.success) {
        toast.success('OTP resent to ' + email)
        setOtp(['', '', '', '', '', ''])
        setResendTimer(60)
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setOtpSending(false)
    }
  }

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`doc-otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`doc-otp-${index - 1}`)?.focus()
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      return toast.error('Please enter the complete 6-digit OTP')
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
      formData.append('otp', otpString)

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
      <div className='w-full max-w-md bg-white border border-zinc-200 shadow-2xl rounded-2xl p-8 sm:p-10 text-zinc-600 text-sm transition-all duration-300'>
        
        {/* Header */}
        <div className='mb-8 text-center'>
          <h2 className='text-3xl font-extrabold text-neutral-800 tracking-tight'>Doctor Registration</h2>
          <p className='text-zinc-400 mt-2'>Become a verified MediConnect professional partner</p>
        </div>

        {/* Tab Selection for Signup */}
        <div className='flex w-full mb-6 bg-zinc-100 p-1 rounded-xl border border-zinc-200'>
          <button
            type='button'
            onClick={() => navigate('/login', { state: { signup: true } })}
            className='flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 text-zinc-500 hover:text-neutral-800'
          >
            Patient Signup
          </button>
          <button
            type='button'
            className='flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 bg-white text-neutral-800 shadow-sm border border-zinc-200/50'
          >
            Doctor Signup
          </button>
        </div>

        {/* Step Indicator / Progress Bar */}
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
              Step {step} of 4
            </span>
            <span className='text-xs font-bold text-neutral-800'>
              {step === 1 && 'Account Credentials'}
              {step === 2 && 'Professional Information'}
              {step === 3 && 'Bio & Verification'}
              {step === 4 && 'Verify Email'}
            </span>
          </div>
          <div className='w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200/50'>
            <div 
              className='bg-[#1D2129] h-full transition-all duration-300 ease-out' 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={onSubmitHandler}>
          {/* Step 1: Account Information */}
          {step === 1 && (
            <div className='space-y-5 animate-fadeIn'>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Full Name</label>
                <input 
                  onChange={(e) => setName(e.target.value)} 
                  value={name} 
                  className='border border-zinc-300 rounded-lg px-3 py-3 w-full bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all' 
                  type='text' 
                  placeholder='Dr. John Doe' 
                  required 
                />
              </div>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Email Address</label>
                <input 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  className='border border-zinc-300 rounded-lg px-3 py-3 w-full bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all' 
                  type='email' 
                  placeholder='doctor@example.com' 
                  required 
                />
              </div>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Password</label>
                <div className='relative'>
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className='border border-zinc-300 rounded-lg px-3 py-3 w-full pr-10 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                    type={showPw ? 'text' : 'password'}
                    placeholder='••••••••'
                    required
                  />
                  {password && (
                    <button type='button' onClick={() => setShowPw(v => !v)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors'>
                      {showPw
                        ? <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' /></svg>
                        : <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' /></svg>
                      }
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Confirm Password</label>
                <div className='relative'>
                  <input
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    className={`border rounded-lg px-3 py-3 w-full pr-10 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all ${
                      confirmPassword && confirmPassword !== password ? 'border-red-400' : 'border-zinc-300'
                    }`}
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder='••••••••'
                    required
                  />
                  {confirmPassword && (
                    <button type='button' onClick={() => setShowConfirmPw(v => !v)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors'>
                      {showConfirmPw
                        ? <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' /></svg>
                        : <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' /></svg>
                      }
                    </button>
                  )}
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className='text-xs text-red-500 mt-1'>Passwords do not match</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Professional Details */}
          {step === 2 && (
            <div className='space-y-5 animate-fadeIn'>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Speciality</label>
                <select 
                  onChange={(e) => setSpeciality(e.target.value)} 
                  value={speciality} 
                  className='border border-zinc-300 bg-white rounded-lg px-3 py-3 w-full focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all'
                >
                  <option value='General Physician'>General Physician</option>
                  <option value='Gynecologist'>Gynecologist</option>
                  <option value='Dermatologist'>Dermatologist</option>
                  <option value='Pediatricians'>Pediatricians</option>
                  <option value='Neurologist'>Neurologist</option>
                  <option value='Gastroenterologist'>Gastroenterologist</option>
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Education / Degree</label>
                <input 
                  onChange={(e) => setDegree(e.target.value)} 
                  value={degree} 
                  className='border border-zinc-300 rounded-lg px-3 py-3 w-full bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all' 
                  type='text' 
                  placeholder='MBBS, MD' 
                  required 
                />
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Experience</label>
                  <select 
                    onChange={(e) => setExperience(e.target.value)} 
                    value={experience} 
                    className='border border-zinc-300 bg-white rounded-lg px-3 py-3 w-full focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all'
                  >
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
                <div>
                  <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Consultation Fees (₹)</label>
                  <input 
                    onChange={(e) => setFees(e.target.value)} 
                    value={fees} 
                    className='border border-zinc-300 rounded-lg px-3 py-3 w-full bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all' 
                    type='number' 
                    placeholder='500' 
                    required 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Clinic, Photo & Document Uploads */}
          {step === 3 && (
            <div className='space-y-5 animate-fadeIn'>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Clinic Address</label>
                <input 
                  onChange={(e) => setAddress1(e.target.value)} 
                  value={address1} 
                  className='border border-zinc-300 rounded-lg px-3 py-3 w-full bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all mb-2' 
                  type='text' 
                  placeholder='Address Line 1 (Building, Street)' 
                  required 
                />
                <input 
                  onChange={(e) => setAddress2(e.target.value)} 
                  value={address2} 
                  className='border border-zinc-300 rounded-lg px-3 py-3 w-full bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all' 
                  type='text' 
                  placeholder='City & State' 
                  required 
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {/* Profile Photo */}
                <div className='flex flex-col items-center justify-center border border-dashed border-zinc-300 rounded-xl p-4 bg-zinc-50 hover:bg-zinc-100 transition-all'>
                  <p className='font-semibold text-neutral-700 text-xs uppercase mb-2'>Profile Photo</p>
                  <label htmlFor='doc-img' className='cursor-pointer flex flex-col items-center'>
                    <img className='w-16 h-16 bg-zinc-200 rounded-full object-cover border-2 border-zinc-300 hover:scale-105 transition-all duration-300' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
                  </label>
                  <input onChange={(e) => setDocImg(e.target.files[0])} type='file' id='doc-img' className='hidden' accept='image/*' />
                  <span className='text-[10px] text-zinc-400 mt-2 truncate max-w-full'>{docImg ? docImg.name : 'Click to select JPG/PNG'}</span>
                </div>

                {/* Verification License Document */}
                <div className='flex flex-col items-center justify-center border border-dashed border-zinc-300 rounded-xl p-4 bg-zinc-50 hover:bg-zinc-100 transition-all'>
                  <p className='font-semibold text-neutral-700 text-xs uppercase mb-2'>Verification Document</p>
                  <label htmlFor='doc-file' className='cursor-pointer flex flex-col items-center justify-center p-2 bg-zinc-200 rounded-lg border-2 border-zinc-300 hover:bg-zinc-300 transition-all w-12 h-12'>
                    <img className='w-6 h-6 opacity-60' src={assets.upload_area} alt="" />
                  </label>
                  <input onChange={(e) => setDocFile(e.target.files[0])} type='file' id='doc-file' className='hidden' accept='image/*,.pdf' />
                  <span className='text-[10px] text-zinc-400 mt-2 truncate max-w-full'>{docFile ? docFile.name : 'Upload PDF or License photo'}</span>
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>About Bio</label>
                <textarea 
                  onChange={(e) => setAbout(e.target.value)} 
                  value={about} 
                  className='w-full border border-zinc-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition-all' 
                  placeholder='Write about your medical specialization, achievements, and clinic hours...' 
                  rows={3} 
                  required 
                />
              </div>
            </div>
          )}

          {/* Step 4: OTP Verification */}
          {step === 4 && (
            <div className='space-y-5 animate-fadeIn'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <svg className='w-6 h-6 text-neutral-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <p className='text-sm text-zinc-500 leading-relaxed'>
                  We sent a 6-digit code to<br />
                  <span className='font-semibold text-neutral-800'>{email}</span>
                </p>
              </div>

              {/* 6-box OTP Input */}
              <div className='flex gap-2 justify-center'>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`doc-otp-${idx}`}
                    type='text'
                    inputMode='numeric'
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className='w-11 h-12 text-center text-xl font-bold border border-zinc-300 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all'
                  />
                ))}
              </div>

              <div className='text-center'>
                {resendTimer > 0 ? (
                  <p className='text-xs text-zinc-400'>Resend OTP in <span className='font-semibold text-neutral-700'>{resendTimer}s</span></p>
                ) : (
                  <button
                    type='button'
                    onClick={handleResendOtp}
                    disabled={otpSending}
                    className='text-xs text-neutral-700 underline hover:text-black font-semibold disabled:opacity-50'
                  >
                    {otpSending ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className='mt-8 flex justify-between items-center border-t border-zinc-100 pt-6'>
            {step > 1 ? (
              <button 
                type='button' 
                onClick={prevStep} 
                className='text-neutral-700 hover:text-black font-semibold py-2 px-6 border border-zinc-300 rounded-lg transition-all hover:bg-zinc-50'
              >
                Back
              </button>
            ) : (
              <button 
                type='button' 
                onClick={() => navigate('/login')} 
                className='text-zinc-400 hover:text-neutral-800 font-semibold py-2 px-4 transition-all'
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button 
                type='button' 
                onClick={nextStep} 
                className='bg-[#1D2129] text-white hover:bg-neutral-800 font-semibold py-3 px-8 rounded-lg transition-all shadow-md ml-auto'
              >
                Next Step
              </button>
            ) : step === 3 ? (
              <button
                type='button'
                onClick={nextStep}
                disabled={otpSending}
                className='bg-emerald-700 text-white hover:bg-emerald-800 font-semibold py-3 px-10 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ml-auto'
              >
                {otpSending ? 'Sending OTP...' : 'Submit & Verify Email'}
              </button>
            ) : (
              <button 
                type='submit' 
                disabled={loading} 
                className='bg-emerald-700 text-white hover:bg-emerald-800 font-semibold py-3 px-10 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ml-auto'
              >
                {loading ? 'Submitting Registration...' : 'Verify & Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoctorRegister
