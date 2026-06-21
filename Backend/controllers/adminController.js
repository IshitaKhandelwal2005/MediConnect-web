
import doctorModel from "../models/doctorModel.js"
import userModel from "../models/userModel.js"
import appointmentModel from "../models/appointmentModel.js"
import jwt from "jsonwebtoken"
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js'
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js'

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const { accessToken, refreshToken } = generateTokens({ email, role: 'admin' })

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            })

            res.json({ success: true, token: accessToken })
        }
        else {
            res.json({ success: false, message: "invalid credentials" })
        }
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const allDoctors = async (req, res) => {
    try {
        const cacheKey = 'admin:doctors:list';
        const cachedData = await cacheGet(cacheKey);
        if (cachedData) {
            console.log("Cache HIT (Admin) - Returning from Redis");
            return res.json({ success: true, doctors: cachedData });
        }
        console.log("Cache MISS (Admin) - Fetching from DB");
        const doctors = await doctorModel.find({}).select('-password')
        await cacheSet(cacheKey, doctors);
        res.json({ success: true, doctors })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


const appointmentsAdmin = async (req, res) => {

    try {
        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


const appointmentCancel = async (req, res) => {

    try {
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e != slotTime)
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        
        await cacheDel('doctors:approved:list')
        await cacheDel('admin:dashboard')
        res.json({ success: true, message: "Appointment cancelled" })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const adminDashboard = async (req, res) => {
    try {
        const cacheKey = 'admin:dashboard';
        const cachedData = await cacheGet(cacheKey);
        if (cachedData) {
            return res.json({ success: true, dashData: cachedData });
        }

        const doctors = await doctorModel.find({ isApproved: true })
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }
        await cacheSet(cacheKey, dashData, 300); // 5 minutes TTL
        res.json({ success: true, dashData })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const approveDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }
        await doctorModel.findByIdAndUpdate(docId, { isApproved: true });
        await cacheDel('admin:doctors:list');
        await cacheDel('doctors:approved:list');
        await cacheDel('admin:dashboard');
        res.json({ success: true, message: "Doctor approved successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const refreshTokenAdmin = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.json({ success: false, message: "No refresh token provided" });
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded || decoded.role !== 'admin') {
            return res.json({ success: false, message: "Invalid refresh token" });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens({ email: decoded.email, role: 'admin' });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({ success: true, token: accessToken });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
        });
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { loginAdmin, allDoctors, adminDashboard, appointmentCancel, appointmentsAdmin, approveDoctor, refreshTokenAdmin, logoutAdmin }


