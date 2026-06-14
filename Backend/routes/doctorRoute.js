import express from "express";
import {doctorList,doctorDashboard,updateDoctorProfile,doctorProfile,loginDoctor,appointmentsDoctor,appointmentCancel,appointmentComplete,registerDoctor} from '../controllers/doctorController.js'
import authDoctor from "../middleware/authDoctor.js";
import upload from "../middleware/multer.js";

const doctorRouter=express.Router();

doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.post('/register', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]), registerDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
doctorRouter.get('/profile',authDoctor,doctorProfile)
doctorRouter.post('/update-profile',authDoctor,updateDoctorProfile)

export default doctorRouter