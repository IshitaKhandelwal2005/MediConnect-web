import { useState } from 'react'
import './App.css'
import {Route,Routes} from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import Contact from './pages/Contact'
import About from './pages/About'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointments from './pages/Appointments'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import {ToastContainer ,toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { useContext } from 'react'
import { AppContext } from './context/AppContext'
import NavigationBar from './components/NavigationBar'
import Sidebar from './components/Sidebar'
import DashBoard from './pages/Admin/DashBoard'
import AllAppointments from './pages/Admin/AllAppointments'
import AddDoctor from './pages/Admin/AddDoctor'
import DoctorsList from './pages/Admin/DoctorsList'
import DoctorDashboard from './pages/Doctors/DoctorDashboard'
import DoctorAppointments from './pages/Doctors/DoctorAppointments'
import DoctorProfile from './pages/Doctors/DoctorProfile'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'

function App() {
  const {atoken, dtoken} = useContext(AppContext)
  
  return(
    <div className='w-full'>
      <ToastContainer/>
      {(atoken || dtoken) ? (
        <div className='bg-gray-50 min-h-screen'>
          <NavigationBar/>
          <div className='flex items-start'>
            <Sidebar/>
            <div className='flex-1 p-8'>
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
        </div>
      ) : (
        <>
          <Navbar/>
          <div className='px-4 sm:px-8'>
            <Routes>
              <Route path='/' element={<Home/>}></Route>
              <Route path='/doctors' element={<Doctors/>}></Route>
              <Route path='/doctors/:speciality' element={<Doctors/>}></Route>
              <Route path='/login' element={<Login/>}></Route>
              <Route path='/contact' element={<Contact/>}></Route>
              <Route path='/about' element={<About/>}></Route>
              <Route path='/my-profile' element={<MyProfile/>}></Route>
              <Route path='/my-appointments' element={<MyAppointments/>}></Route>
              <Route path='/appointments/:docId' element={<Appointments/>}></Route>
              <Route path='/payment-success' element={<PaymentSuccess/>}></Route>
              <Route path='/payment-cancel' element={<PaymentCancel/>}></Route>
            </Routes>
          </div>
          <Footer/>
        </>
      )}
    </div>
  )
}

export default App
