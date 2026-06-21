import { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const AppContext = createContext();

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppContextProvider");
    }
    return context;
};

const AppContextProvider = ({ children }) => {
    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL 
    const [doctors, setDoctors] = useState([])

    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const slotDateFormat = (dateString) => {
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
    }

    const calculateAge = (dob) => {
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    useEffect(() => {
        getDoctorsData()
    }, [])

    const value = useMemo(() => ({
        doctors, setDoctors, getDoctorsData,
        currencySymbol, backendUrl,
        slotDateFormat, calculateAge
    }), [doctors, currencySymbol, backendUrl]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider