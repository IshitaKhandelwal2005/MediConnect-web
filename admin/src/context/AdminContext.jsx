import { createContext, useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'
export const AdminContext=createContext()

const AdminContextProvider =(props) =>{
    const [atoken,setAToken]=useState(localStorage.getItem('atoken')?localStorage.getItem('atoken'):'')
    const [doctors,setDoctors]=useState([])
    const backendUrl =import.meta.env.VITE_BACKEND_URL
    const [appointments,setAppointments]=useState([])
    const [dashData,setDashData]=useState(false)
    
    const getAllDoctors =async()=>{
        try{
            const {data}=await axios.post(backendUrl+'/api/admin/all-doctors',{},{headers:{atoken}})
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
            toast.error(error.message)
        }
    }

    const changeAvailability =async(docId)=>{
        try{
            const {data}=await axios.post(backendUrl +'/api/admin/change-availability',{docId},{headers:{atoken}})
            console.log(data)
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
                console.log(data.appointments)
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
                toast.success(DataTransfer.message)
                getAllAppointments()
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
                console.log(data.dashData)
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
    const value ={
        atoken,setAToken,
        backendUrl,getDashData,dashData,doctors,getAllDoctors,changeAvailability,getAllAppointments,appointments,cancelAppointment
    }
    return(
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}


export default AdminContextProvider