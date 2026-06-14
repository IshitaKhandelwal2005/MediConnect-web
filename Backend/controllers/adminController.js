
import doctorModel from "../models/doctorModel.js"
import userModel from "../models/userModel.js"
import appointmentModel from "../models/appointmentModel.js"
import jwt from "jsonwebtoken"

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
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
        const doctors = await doctorModel.find({}).select('-password')
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
        res.json({ success: true, message: "Appointment cancelled" })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }
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
        res.json({ success: true, message: "Doctor approved successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { loginAdmin, allDoctors, adminDashboard, appointmentCancel, appointmentsAdmin, approveDoctor }


