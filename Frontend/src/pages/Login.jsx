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

  // Set default credentials based on profession to help the user test easily
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
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Sign Up') {
        if (!phone.trim()) {
          return toast.error('Phone number is required')
        }
        if (!gender || gender === 'Not Selected') {
          return toast.error('Gender selection is required')
        }
        const { data } = await axios.post(backendUrl + '/api/user/register', { 
          name, 
          password, 
          email, 
          phone, 
          gender,
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
        // Login based on profession
        let endpoint
        let tokenKey

        if (profession === 'User') {
          endpoint = '/api/user/login'
          tokenKey = 'token'
        } else if (profession === 'Doctor') {
          endpoint = '/api/doctor/login'
          tokenKey = 'dtoken'
        } else if (profession === 'Admin') {
          endpoint = '/api/admin/login'
          tokenKey = 'atoken'
        }

        const { data } = await axios.post(backendUrl + endpoint, { password, email })
        if (data.success) {
          localStorage.setItem(tokenKey, data.token)
          if (profession === 'User') {
            setToken(data.token)
            setTimeout(() => navigate('/'), 100)
          } else if (profession === 'Doctor') {
            setDToken(data.token)
            setTimeout(() => navigate('/doctor-dashboard'), 100)
          } else if (profession === 'Admin') {
            setAToken(data.token)
            setTimeout(() => navigate('/admin-dashboard'), 100)
          }
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
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <div className='min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-md bg-white border border-zinc-200 shadow-2xl rounded-2xl p-8 sm:p-10 transition-all duration-300'>
        <div className='text-center mb-6'>
          <h2 className='text-3xl font-extrabold text-neutral-800 tracking-tight'>
            {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className='text-zinc-400 mt-2 text-sm'>
            {state === 'Sign Up' ? 'Sign up to register as patient' : 'Please sign in to your dashboard'}
          </p>
        </div>

        {/* Step Indicator / Progress Bar */}
        {state === 'Sign Up' && (
          <div className='mb-8'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                Step {step} of 2
              </span>
              <span className='text-xs font-bold text-neutral-800'>
                {step === 1 && 'Account Credentials'}
                {step === 2 && 'Personal Information'}
              </span>
            </div>
            <div className='w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200/50'>
              <div 
                className='bg-[#1D2129] h-full transition-all duration-300 ease-out' 
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Tab Selection for Profession (Login vs Signup) */}
        {state === 'Login' ? (
          <div className='flex w-full mb-6 bg-zinc-100 p-1 rounded-xl border border-zinc-200'>
            <button
              type='button'
              onClick={() => setProfession('User')}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                profession === 'User'
                  ? 'bg-white text-neutral-800 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-neutral-800'
              }`}
            >
              Patient
            </button>
            <button
              type='button'
              onClick={() => setProfession('Doctor')}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                profession === 'Doctor'
                  ? 'bg-white text-neutral-800 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-neutral-800'
              }`}
            >
              Doctor
            </button>
            <button
              type='button'
              onClick={() => setProfession('Admin')}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                profession === 'Admin'
                  ? 'bg-white text-neutral-800 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-neutral-800'
              }`}
            >
              Admin
            </button>
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

        <div className='space-y-4 mb-6'>
          {/* LOGIN MODE */}
          {state === 'Login' && (
            <>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Email Address</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='email'
                  placeholder='email@example.com'
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Password</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='password'
                  placeholder='••••••••'
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
              </div>
            </>
          )}

          {/* SIGN UP MODE: STEP 1 */}
          {state === 'Sign Up' && step === 1 && (
            <div className='space-y-4 animate-fadeIn'>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Full Name</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='text'
                  placeholder='John Doe'
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Email Address</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='email'
                  placeholder='email@example.com'
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Password</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='password'
                  placeholder='••••••••'
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
              </div>
            </div>
          )}

          {/* SIGN UP MODE: STEP 2 */}
          {state === 'Sign Up' && step === 2 && (
            <div className='space-y-4 animate-fadeIn'>
              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Phone Number</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='tel'
                  placeholder='9876543210'
                  onChange={(e) => setPhone(e.target.value)}
                  value={phone}
                  required
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Gender</label>
                <select
                  className='border border-zinc-300 bg-white rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition-all text-neutral-800'
                  onChange={(e) => setGender(e.target.value)}
                  value={gender}
                  required
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
                  type='text'
                  placeholder='Building, Street name'
                  onChange={(e) => setAddress1(e.target.value)}
                  value={address1}
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Address Line 2 (Optional)</label>
                <input
                  className='border border-zinc-300 rounded-lg w-full p-3 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white focus:border-transparent transition-all'
                  type='text'
                  placeholder='Area, City'
                  onChange={(e) => setAddress2(e.target.value)}
                  value={address2}
                />
              </div>
            </div>
          )}
        </div>

        {state === 'Login' ? (
          <button
            type='submit'
            className='bg-[#1D2129] text-white w-full py-3 rounded-lg text-sm font-semibold hover:bg-neutral-800 hover:scale-[1.01] transition-all duration-200 shadow-md'
          >
            Login
          </button>
        ) : (
          <div className='flex justify-between items-center mt-6 gap-4'>
            {step > 1 && (
              <button
                type='button'
                onClick={prevStep}
                className='text-neutral-700 hover:text-black font-semibold py-3 px-6 border border-zinc-300 rounded-lg transition-all hover:bg-zinc-50 text-sm'
              >
                Back
              </button>
            )}
            
            {step === 1 ? (
              <button
                type='button'
                onClick={nextStep}
                className='bg-[#1D2129] text-white hover:bg-neutral-800 font-semibold py-3 px-8 rounded-lg transition-all shadow-md ml-auto text-sm w-full text-center'
              >
                Next Step
              </button>
            ) : (
              <button
                type='submit'
                className='bg-[#1D2129] text-white hover:bg-neutral-800 font-semibold py-3 px-8 rounded-lg transition-all shadow-md ml-auto text-sm flex-1 text-center'
              >
                Create Account
              </button>
            )}
          </div>
        )}

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