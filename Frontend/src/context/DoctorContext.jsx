import { createContext, useContext, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "./AppContext";
import { useAuthContext } from "./AuthContext";

export const DoctorContext = createContext();

export const useDoctorContext = () => {
    const context = useContext(DoctorContext);
    if (!context) {
        throw new Error("useDoctorContext must be used within a DoctorContextProvider");
    }
    return context;
};

const DoctorContextProvider = ({ children }) => {
    const { backendUrl, getDoctorsData } = useAppContext();
    const { dtoken } = useAuthContext();

    const [profileData, setProfileData] = useState(false);
    const [doctorAppointments, setDoctorAppointments] = useState([]);
    const [doctorDashData, setDoctorDashData] = useState(false);

    const getDoctorAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dtoken } });
            if (data.success) {
                setDoctorAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { dtoken } });
            if (data.success) {
                toast.success(data.message);
                getDoctorAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const cancelDoctorAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dtoken } });
            if (data.success) {
                toast.success(data.message);
                getDoctorAppointments();
                getDoctorsData(); // Refresh slots so cancelled slot reappears in booking UI
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getDoctorDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dtoken } });
            if (data.success) {
                setDoctorDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getProfile = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dtoken } });
            if (data.success) {
                setProfileData(data.profileData);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const value = useMemo(() => ({
        profileData, setProfileData, getProfile,
        doctorAppointments, setDoctorAppointments, getDoctorAppointments,
        completeAppointment, cancelDoctorAppointment,
        doctorDashData, setDoctorDashData, getDoctorDashData
    }), [profileData, doctorAppointments, doctorDashData]);

    return (
        <DoctorContext.Provider value={value}>
            {children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;
