import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import AppContextProvider from './context/AppContext.jsx'
import AuthContextProvider from './context/AuthContext.jsx'
import AdminContextProvider from './context/AdminContext.jsx'
import DoctorContextProvider from './context/DoctorContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppContextProvider>
      <AuthContextProvider>
        <AdminContextProvider>
          <DoctorContextProvider>
            <App />
          </DoctorContextProvider>
        </AdminContextProvider>
      </AuthContextProvider>
    </AppContextProvider>
  </BrowserRouter>,
)
