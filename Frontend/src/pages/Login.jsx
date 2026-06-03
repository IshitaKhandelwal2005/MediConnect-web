import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import {AppContext} from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
const Login=()=> {

  const {backendUrl,token,setToken,atoken,setAToken,dtoken,setDToken}=useContext(AppContext)
  const [state,setState]=useState('Sign Up')
  const [profession,setProfession]=useState('User')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [name,setName]=useState('')
  const navigate=useNavigate()

  // Set default credentials based on profession
  useEffect(()=>{
    if(state === 'Login'){
      if(profession === 'Admin'){
        setEmail('admin@mediconnect.com')
        setPassword('qwerty123')
      } else if(profession === 'Doctor'){
        setEmail('doctor@mediconnect.com')
        setPassword('doctor123')
      } else {
        setEmail('')
        setPassword('')
      }
    }
  },[profession, state])
  const onSubmitHandler =async (event)=>{
    event.preventDefault()

    try{

      if(state=='Sign Up'){
        const {data}=await axios.post(backendUrl + '/api/user/register',{name,password,email})
        if(data.success)
        {
          localStorage.setItem('token',data.token)
          setToken(data.token)
          toast.success('Account created successfully')
        }
        else
        {
          toast.error(data.message)
        }
      }
      else
      {
        // Login based on profession
        let endpoint
        let tokenKey
        
        if(profession === 'User'){
          endpoint = '/api/user/login'
          tokenKey = 'token'
        } else if(profession === 'Doctor'){
          endpoint = '/api/doctor/login'
          tokenKey = 'dtoken'
        } else if(profession === 'Admin'){
          endpoint = '/api/admin/login'
          tokenKey = 'atoken'
        }

        const {data}=await axios.post(backendUrl + endpoint,{password,email})
        if(data.success)
        {
          localStorage.setItem(tokenKey,data.token)
          if(profession === 'User'){
            setToken(data.token)
            setTimeout(() => navigate('/'), 100)
          } else if(profession === 'Doctor'){
            setDToken(data.token)
            setTimeout(() => navigate('/doctor-dashboard'), 100)
          } else if(profession === 'Admin'){
            setAToken(data.token)
            setTimeout(() => navigate('/admin-dashboard'), 100)
          }
          toast.success('Login successful')
        }
        else
        {
          toast.error(data.message)
        }
      }
    }
    catch(error)
    {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    if(token)
    {
      navigate('/')
    }
  },[token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
        <p>Please {state === 'Sign Up' ? "Create Account" : "Login"} to continue</p>
        
        {state === 'Login' && (
          <div className='w-full'>
            <p>Profession</p>
            <select 
              className='border border-zinc-300 rounded w-full p-2 mt-1 bg-white'
              value={profession}
              onChange={(e)=>setProfession(e.target.value)}
            >
              <option value="User">User</option>
              <option value="Doctor">Doctor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        )}

        {
          state === "Sign Up" && <div className='w-full'>
          <p>Full Name</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e)=>setName(e.target.value)} value={name} />
        </div>
        }
        
        <div className='w-full'>
          <p>Email</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e)=>setEmail(e.target.value)} value={email} />
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e)=>setPassword(e.target.value)} value={password} />
        </div>
        <button type='submit' className='bg-[#1D2129] text-white w-full py-2 rounded-md text-base' >{state === 'Sign Up' ? "Create Account" : "Login"}</button>
        {
          state === "Sign Up"?
          <p>Already have an account? <span onClick={()=>setState("Login")} className='text-gray-800 underline cursor-pointer'>Login Here</span></p>
          : <p>Create an new account? <span onClick={()=>setState("Sign Up")} className='text-gray-800 underline cursor-pointer'>Click here</span> </p>
        }
      </div>
    </form>
  )
}

export default Login