import { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "./AppContext";

export const AuthContext = createContext();

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthContextProvider");
    }
    return context;
};

const AuthContextProvider = ({ children }) => {
    const { backendUrl } = useAppContext();

    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
    const [atoken, setAToken] = useState(localStorage.getItem('atoken') ? localStorage.getItem('atoken') : '');
    const [dtoken, setDToken] = useState(localStorage.getItem('dtoken') ? localStorage.getItem('dtoken') : '');
    const [userData, setUserData] = useState(false);

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } });
            if (data.success) {
                setUserData(data.userData);
            } else {
                localStorage.removeItem('token');
                setToken('');
                setUserData(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (token) {
            loadUserProfileData();
        } else {
            setUserData(false);
        }
    }, [token]);

    useEffect(() => {
        axios.defaults.withCredentials = true;

        const interceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;
                if (error.response && error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        let endpoint = '/api/user/refresh-token';
                        let tokenKey = 'token';
                        let setFunction = setToken;

                        if (originalRequest.url.includes('/api/admin/')) {
                            endpoint = '/api/admin/refresh-token';
                            tokenKey = 'atoken';
                            setFunction = setAToken;
                        } else if (originalRequest.url.includes('/api/doctor/')) {
                            endpoint = '/api/doctor/refresh-token';
                            tokenKey = 'dtoken';
                            setFunction = setDToken;
                        }

                        const res = await axios.post(backendUrl + endpoint);
                        if (res.data.success) {
                            const newToken = res.data.token;
                            localStorage.setItem(tokenKey, newToken);
                            setFunction(newToken);

                            // Update the failed request's headers and retry
                            originalRequest.headers[tokenKey] = newToken;
                            // Wait, the headers use different names.
                            if (tokenKey === 'token') originalRequest.headers['token'] = newToken;
                            if (tokenKey === 'atoken') originalRequest.headers['atoken'] = newToken;
                            if (tokenKey === 'dtoken') originalRequest.headers['dtoken'] = newToken;
                            
                            return axios(originalRequest);
                        } else {
                            localStorage.removeItem(tokenKey);
                            setFunction('');
                            setUserData(false);
                        }
                    } catch (refreshError) {
                        // Clear all state
                        setToken('');
                        setAToken('');
                        setDToken('');
                        setUserData(false);
                        localStorage.clear();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [backendUrl]);

    const value = useMemo(() => ({
        token, setToken,
        atoken, setAToken,
        dtoken, setDToken,
        userData, setUserData,
        loadUserProfileData
    }), [token, atoken, dtoken, userData]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;
