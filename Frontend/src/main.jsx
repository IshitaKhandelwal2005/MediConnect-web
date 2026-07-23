import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import AppContextProvider from './context/AppContext.jsx'
import AuthContextProvider from './context/AuthContext.jsx'
import AdminContextProvider from './context/AdminContext.jsx'
import DoctorContextProvider from './context/DoctorContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
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
    </BrowserRouter>
  </QueryClientProvider>,
)
