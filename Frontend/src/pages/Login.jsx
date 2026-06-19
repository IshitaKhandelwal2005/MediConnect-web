import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'

const Login = () => {
  const { backendUrl, token, setToken, atoken, setAToken, dtoken, setDToken } = useContext(AppContext)
  const [state, setState] = useState('Login') // 'Sign Up' or 'Login'
  const [profession, setProfession] = useState('User') // 'User', 'Doctor', 'Admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  // OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSending, setOtpSending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  // Handle signup navigation from doctor register
  useEffect(() => {
    if (location.state?.signup) {
      setState('Sign Up')
      setStep(1)
    }
  }, [location.state])

  // Reset step to 1 when switching between Login/Signup
  useEffect(() => {
    setStep(1)
  }, [state])

  // Set default credentials based on profession
  useEffect(() => {
    if (state === 'Login') {
      if (profession === 'Admin') {
        setEmail('admin@mediconnect.com')
        setPassword('qwerty123')
      } else if (profession === 'Doctor') {
        setEmail('doctor@mediconnect.com')
        setPassword('doctor123')
      } else {
        setEmail('')
        setPassword('')
      }
    }
  }, [profession, state])

  // Resend OTP timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer(t => t - 1), 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  // Validate step 1 fields
  const validateStep = () => {
    if (step === 1) {
      if (!name.trim()) { toast.error('Please enter your full name'); return false }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { toast.error('Please enter a valid email address'); return false }
      if (password.length < 8) { toast.error('Password must be at least 8 characters long'); return false }
    }
    return true
  }

  const prevStep = () => setStep(prev => prev - 1)

  const nextStep = async () => {
    if (!validateStep()) return

    // Step 2 → Step 3: validate personal info then send OTP
    if (step === 2) {
      if (!phone.trim()) { toast.error('Phone number is required'); return }
      if (!gender || gender === 'Not Selected') { toast.error('Gender selection is required'); return }
      setOtpSending(true)
      try {
        const { data } = await axios.post(backendUrl + '/api/user/send-otp', { email, name })
        if (data.success) {
          toast.success('OTP sent to ' + email)
          setStep(3)
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

    setStep(prev => prev + 1)
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setOtpSending(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/send-otp', { email, name })
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
      document.getElementById(`user-otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`user-otp-${index - 1}`)?.focus()
    }
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Sign Up') {
        const otpString = otp.join('')
        if (otpString.length !== 6) {
          return toast.error('Please enter the complete 6-digit OTP')
        }
        const { data } = await axios.post(backendUrl + '/api/user/register', {
          name,
          password,
          email,
          phone,
          gender,
          otp: otpString,
          address: { line1: address1, line2: address2 }
        })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Account created successfully')
        } else {
          toast.error(data.message)
        }
      } else {
        // Login
        let endpoint, tokenKey
        if (profession === 'User') { endpoint = '/api/user/login'; tokenKey = 'token' }
        else if (profession === 'Doctor') { endpoint = '/api/doctor/login'; tokenKey = 'dtoken' }
        else if (profession === 'Admin') { endpoint = '/api/admin/login'; tokenKey = 'atoken' }

        const { data } = await axios.post(backendUrl + endpoint, { password, email })
        if (data.success) {
          localStorage.setItem(tokenKey, data.token)
          if (profession === 'User') { setToken(data.token); setTimeout(() => navigate('/'), 100) }
          else if (profession === 'Doctor') { setDToken(data.token); setTimeout(() => navigate('/doctor-dashboard'), 100) }
          else if (profession === 'Admin') { setAToken(data.token); setTimeout(() => navigate('/admin-dashboard'), 100) }
          toast.success('Login successful')
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) navigate('/')
  }, [token])

  return (
    <div className='min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-md bg-white border border-zinc-200 shadow-2xl rounded-2xl p-8 sm:p-10 transition-all duration-300'>

        {/* Header */}
        <div className='text-center mb-6'>
          <h2 className='text-3xl font-extrabold text-neutral-800 tracking-tight'>
            {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className='text-zinc-400 mt-2 text-sm'>
            {state === 'Sign Up' ? 'Sign up to register as patient' : 'Please sign in to your dashboard'}
          </p>
        </div>

        {/* Progress bar (Sign Up only) */}
        {state === 'Sign Up' && (
          <div className='mb-8'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-xs font-semibold text-zinc-400 uppercase tracking-wider'>Step {step} of 3</span>
              <span className='text-xs font-bold text-neutral-800'>
                {step === 1 && 'Account Credentials'}
                {step === 2 && 'Personal Information'}
                {step === 3 && 'Verify Email'}
              </span>
            </div>
            <div className='w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200/50'>
              <div className='bg-[#1D2129] h-full transition-all duration-300 ease-out' style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Profession tabs (Login) or Signup type tabs (Sign Up) */}
        {state === 'Login' ? (
          <div className='flex w-full mb-6 bg-zinc-100 p-1 rounded-xl border border-zinc-200'>
            {['User', 'Doctor', 'Admin'].map(p => (
              <button
                key={p}
                type='button'
                onClick={() => setProfession(p)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                  profession === p
                    ? 'bg-white text-neutral-800 shadow-sm border border-zinc-200/50'
                    : 'text-zinc-500 hover:text-neutral-800'
                }`}
              >
                {p === 'User' ? 'Patient' : p}
              </button>
            ))}
          </div>
        ) : (
          <div className='flex w-full mb-6 bg-zinc-100 p-1 rounded-xl border border-zinc-200'>
            <button
              type='button'
              className='flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 bg-white text-neutral-800 shadow-sm border border-zinc-200/50'
            >
              Patient Signup
            </button>
            <button
              type='button'
              onClick={() => navigate('/doctor-register')}
              className='flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 text-zinc-500 hover:text-neutral-800'
            >
              Doctor Signup
            </button>
          </div>
        )}

        {/* ── Form Fields ── */}
        <div className='space-y-4 mb-6'>

          {/* LOGIN fields */}
          {state === 'Login' && (
            <>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Email Address</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='email' placeholder='email@example.com'
                  onChange={(e) => setEmail(e.target.value)} value={email} required
                />
              </div>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Password</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='password' placeholder='••••••••'
                  onChange={(e) => setPassword(e.target.value)} value={password} required
                />
              </div>
            </>
          )}

          {/* SIGN UP: Step 1 */}
          {state === 'Sign Up' && step === 1 && (
            <div className='space-y-4 animate-fadeIn'>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Full Name</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='text' placeholder='John Doe'
                  onChange={(e) => setName(e.target.value)} value={name} required
                />
              </div>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Email Address</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='email' placeholder='email@example.com'
                  onChange={(e) => setEmail(e.target.value)} value={email} required
                />
              </div>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Password</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='password' placeholder='••••••••'
                  onChange={(e) => setPassword(e.target.value)} value={password} required
                />
              </div>
            </div>
          )}

          {/* SIGN UP: Step 2 */}
          {state === 'Sign Up' && step === 2 && (
            <div className='space-y-4 animate-fadeIn'>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Phone Number</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='tel' placeholder='9876543210'
                  onChange={(e) => setPhone(e.target.value)} value={phone} required
                />
              </div>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Gender</label>
                <select
                  className='border border-zinc-300 bg-white rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition-all text-neutral-800'
                  onChange={(e) => setGender(e.target.value)} value={gender} required
                >
                  <option value=''>Select Gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Address Line 1 (Optional)</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='text' placeholder='Building, Street name'
                  onChange={(e) => setAddress1(e.target.value)} value={address1}
                />
              </div>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>City & State (Optional)</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='text' placeholder='City, State'
                  onChange={(e) => setAddress2(e.target.value)} value={address2}
                />
              </div>
            </div>
          )}

          {/* SIGN UP: Step 3 — OTP */}
          {state === 'Sign Up' && step === 3 && (
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
                    id={`user-otp-${idx}`}
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
        </div>

        {/* ── Action Buttons ── */}
        {state === 'Login' ? (
          <button
            type='submit'
            className='bg-[#1D2129] text-white w-full py-3 rounded-lg text-sm font-semibold hover:bg-neutral-800 hover:scale-[1.01] transition-all duration-200 shadow-md'
          >
            Login
          </button>
        ) : (
          <div className='flex justify-between items-center gap-4'>
            {step > 1 && (
              <button
                type='button'
                onClick={prevStep}
                className='text-neutral-700 hover:text-black font-semibold py-3 px-6 border border-zinc-300 rounded-lg transition-all hover:bg-zinc-50 text-sm'
              >
                Back
              </button>
            )}

            {step === 1 && (
              <button
                type='button'
                onClick={nextStep}
                className='bg-[#1D2129] text-white hover:bg-neutral-800 font-semibold py-3 px-8 rounded-lg transition-all shadow-md ml-auto text-sm w-full text-center'
              >
                Next Step
              </button>
            )}

            {step === 2 && (
              <button
                type='button'
                onClick={nextStep}
                disabled={otpSending}
                className='bg-[#1D2129] text-white hover:bg-neutral-800 font-semibold py-3 px-8 rounded-lg transition-all shadow-md ml-auto text-sm flex-1 text-center disabled:opacity-60'
              >
                {otpSending ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            )}

            {step === 3 && (
              <button
                type='submit'
                className='bg-[#1D2129] text-white hover:bg-neutral-800 font-semibold py-3 px-8 rounded-lg transition-all shadow-md ml-auto text-sm flex-1 text-center'
              >
                Create Account
              </button>
            )}
          </div>
        )}

        {/* Footer toggle */}
        <div className='mt-6 border-t border-zinc-100 pt-6 text-center text-xs'>
          {state === 'Sign Up' ? (
            <p className='text-zinc-500'>
              Already have an account?{' '}
              <span onClick={() => setState('Login')} className='text-neutral-800 underline font-semibold cursor-pointer hover:text-black'>
                Login Here
              </span>
            </p>
          ) : (
            <p className='text-zinc-500'>
              Don't have an account?{' '}
              <span onClick={() => setState('Sign Up')} className='text-neutral-800 underline font-semibold cursor-pointer hover:text-black'>
                Create Account
              </span>
            </p>
          )}
        </div>

      </form>
    </div>
  )
}

export default Login