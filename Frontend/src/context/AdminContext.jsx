import { createContext, useContext, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "./AppContext";
import { useAuthContext } from "./AuthContext";

export const AdminContext = createContext();

export const useAdminContext = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdminContext must be used within an AdminContextProvider");
    }
    return context;
};

const AdminContextProvider = ({ children }) => {
    const { backendUrl, getDoctorsData } = useAppContext();
    const { atoken } = useAuthContext();

    const [adminDoctors, setAdminDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/all-doctors', {}, { headers: { atoken } });
            if (data.success) {
                setAdminDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { atoken } });
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const approveDoctor = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/approve-doctor', { docId }, { headers: { atoken } });
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { atoken } });
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { atoken } });
            if (data.success) {
                toast.success(data.message);
                getAllAppointments();
                getDoctorsData(); // Refresh slots
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { atoken } });
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const value = useMemo(() => ({
        adminDoctors, setAdminDoctors, getAllDoctors,
        changeAvailability, approveDoctor,
        appointments, setAppointments, getAllAppointments, cancelAppointment,
        dashData, setDashData, getDashData
    }), [adminDoctors, appointments, dashData]);

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;
