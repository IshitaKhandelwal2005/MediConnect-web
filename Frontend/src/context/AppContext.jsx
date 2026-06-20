import { createContext } from "react";
import axios from 'axios'
import { useState } from "react";
import { useEffect } from "react";
import {toast} from 'react-toastify'
export const AppContext=createContext()
const AppContextProvider = (props)=>{
    
    const currencySymbol='₹'
    const backendUrl=import.meta.env.VITE_BACKEND_URL 
    const [doctors,setDoctors]=useState([])
    const [token,setToken]=useState(localStorage.getItem('token')?localStorage.getItem('token'):'')
    const [atoken,setAToken]=useState(localStorage.getItem('atoken')?localStorage.getItem('atoken'):'')
    const [dtoken,setDToken]=useState(localStorage.getItem('dtoken')?localStorage.getItem('dtoken'):'')
    const [userData,setUserData]=useState(false)
    
    // Admin state
    const [adminDoctors,setAdminDoctors]=useState([])
    const [appointments,setAppointments]=useState([])
    const [dashData,setDashData]=useState(false)
    
    // Doctor state
    const [profileData,setProfileData]=useState(false)
    const [doctorAppointments,setDoctorAppointments]=useState([])
    const [doctorDashData,setDoctorDashData]=useState(false)
    
    const getDoctorsData =async()=>{
        try{
            const {data}=await axios.get(backendUrl + '/api/doctor/list')
            if(data.success)
            {
                setDoctors(data.doctors)
            }
            else{
                toast.error(data.message)
            }
        }
        catch(error)
        {
            console.log(error)
            toast.error(error.message)
        }
    }


    const loadUserProfileData =async()=>{
        try{
            const {data}=await axios.get(backendUrl + '/api/user/get-profile',{headers:{token}})
            if(data.success)
            {
                setUserData(data.userData)
            }
            else
            {
                // Token is invalid or expired — clear it so the user can log in again
                localStorage.removeItem('token')
                setToken('')
                setUserData(false)
            }
        }
        catch(error)
        {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Admin functions
    const getAllDoctors =async()=>{
        try{
            const {data}=await axios.post(backendUrl+'/api/admin/all-doctors',{},{headers:{atoken}})
            if(data.success)
            {
                setAdminDoctors(data.doctors)
            }
            else{
                toast.error(data.message)
            }
        
        }
        catch(error)
        {
            toast.error(error.message)
        }
    }

    const changeAvailability =async(docId)=>{
        try{
            const {data}=await axios.post(backendUrl +'/api/admin/change-availability',{docId},{headers:{atoken}})
            if(data.success)
            {
                toast.success(data.message)
                getAllDoctors()
            }
            else
            {
                toast.error(data.message)
            }
        
        }
        catch(error)
        {
            toast.error(error.message)
        }
    }

    const approveDoctor =async(docId)=>{
        try{
            const {data}=await axios.post(backendUrl +'/api/admin/approve-doctor',{docId},{headers:{atoken}})
            if(data.success)
            {
                toast.success(data.message)
                getAllDoctors()
            }
            else
            {
                toast.error(data.message)
            }
        }
        catch(error)
        {
            toast.error(error.message)
        }
    }

    const getAllAppointments =async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/admin/appointments',{headers:{atoken}})
            if(data.success)
            {
                setAppointments(data.appointments)
            }
            else
            {
                toast.error(data.message)
            }
        
        }
        catch(error)
        {
            toast.error(error.message)
        }
    }

    const cancelAppointment =async (appointmentId) =>{
        try{
            const {data}=await axios.post(backendUrl+'/api/admin/cancel-appointment',{appointmentId},{headers:{atoken}})
        
            if(data.success)
            {
                toast.success(data.message)
                getAllAppointments()
                getDoctorsData() // Refresh slots so cancelled slot reappears in booking UI
            }
            else
            {
                toast.error(data.message)
            }
        }
        catch(error)
        {
            toast.error(error.message)
        }
    }

    const getDashData =async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/admin/dashboard',{headers:{atoken}})
            if(data.success)
                {
                setDashData(data.dashData)
            }
            else
            {
                toast.error(data.message)
            }
        }
        catch(error)
        {
            toast.error(error.message)
        }
    }

    // Doctor functions
    const getDoctorAppointments = async()=>{
        try{
            const {data}= await axios.get(backendUrl+'/api/doctor/appointments',{headers:{dtoken}})
            if(data.success)
            {
                setDoctorAppointments(data.appointments)
            }
            else
            {
                toast.error(data.message)
            }
        }
        catch(error)
        {
            console.log(error)
            toast.error(error.message)
        }
    }

    const completeAppointment =async(appointmentId)=>{
        try{
            const {data}=await axios.post(backendUrl+'/api/doctor/complete-appointment',{appointmentId},{headers:{dtoken}})
            if(data.success)
            {
                toast.success(data.message)
                getDoctorAppointments()
            }
            else
            {
                toast.error(data.message)
            }
       
        }
        catch(error)
        {
            console.log(error)
            toast.error(error.message)
        }
    }

    const cancelDoctorAppointment =async(appointmentId)=>{
        try{
            const {data}=await axios.post(backendUrl+'/api/doctor/cancel-appointment',{appointmentId},{headers:{dtoken}})                               
            if(data.success)
            {
                toast.success(data.message)
                getDoctorAppointments()
                getDoctorsData() // Refresh slots so cancelled slot reappears in booking UI
            }
            else
            {
                toast.error(data.message)
            }
       
        }
        catch(error)
        {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getDoctorDashData =async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/doctor/dashboard',{headers:{dtoken}})

            if(data.success)
            {
                setDoctorDashData(data.dashData)
            }
            else
            {
                toast.error(data.message)
            }
        }
        catch(error)
        {
            console.log(error)
            toast.error(error.message)
        }
    }
    
    const getProfile =async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/doctor/profile',{headers:{dtoken}})
            if(data.success)
            {
                setProfileData(data.profileData)
            }
        }
        catch(error)
        {
            console.log(error)
            toast.error(error.message)
        }
    }

    const value ={
        doctors,currencySymbol,token,setToken,atoken,setAToken,dtoken,setDToken,backendUrl,userData,setUserData,loadUserProfileData,getDoctorsData,
        // Admin functions
        adminDoctors,setAdminDoctors,getAllDoctors,changeAvailability,approveDoctor,getAllAppointments,appointments,cancelAppointment,getDashData,dashData,setDashData,
        // Doctor functions
        profileData,setProfileData,getProfile,doctorAppointments,setDoctorAppointments,getDoctorAppointments,completeAppointment,cancelDoctorAppointment,doctorDashData,getDoctorDashData,
        // Utility functions
        slotDateFormat: (dateString) => {
            if (!dateString) return '';
            const dateArray = dateString.split('_');
            if (dateArray.length === 3) {
                const day = Number(dateArray[0]);
                const month = Number(dateArray[1]) - 1; // Months are 0-indexed in JS Date
                const year = Number(dateArray[2]);
                const date = new Date(year, month, day);
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            }
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        },
        calculateAge: (dob) => {
            const today = new Date()
            const birthDate = new Date(dob)
            let age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }
            return age
        }
    }
    
    useEffect(()=>{
        getDoctorsData()
    },[])

    useEffect(()=>{
        if(token){
            loadUserProfileData()
        }
        else
        {
            setUserData(false)
        }
    },[token])
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider