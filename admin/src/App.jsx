import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import {AdminContext} from './context/AdminContext'
import NavigationBar from './components/NavigationBar';
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom';
import DashBoard from './pages/Admin/DashBoard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import { DoctorContext } from './context/DoctorContext';
import { DoctorDashboard } from './pages/Doctors/DoctorDashboard';
import {DoctorAppointments} from './pages/Doctors/DoctorAppointments';
import { DoctorProfile } from './pages/Doctors/DoctorProfile';

function App() {

  const {atoken}=useContext(AdminContext)
  const {dtoken}=useContext(DoctorContext)
  return (atoken || dtoken?(
    <div className='bg-[#F8F9FD]'>
      
      <ToastContainer/>
      <NavigationBar/>
      <div className='flex items-start'>
        <Sidebar/>
        <Routes>
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<DashBoard/>} />
          <Route path='/all-appointments' element={<AllAppointments/>} />
          <Route path='/add-doctor' element={<AddDoctor/>} />
          <Route path='/doctor-list' element={<DoctorsList/>} />
          
          
          <Route path='/doctor-dashboard' element={<DoctorDashboard/>} />
          <Route path='/doctor-appointments' element={<DoctorAppointments/>} />
          <Route path='/doctor-profile' element={<DoctorProfile/>} />
        </Routes>
      </div>
    </div>
  )
  :
  (
    <>
    
      <Login/>
      <ToastContainer/>
    </>
  ))
}

export default App