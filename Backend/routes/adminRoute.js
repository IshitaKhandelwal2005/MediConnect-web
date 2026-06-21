import express from 'express'
import { allDoctors, loginAdmin, appointmentsAdmin, appointmentCancel, adminDashboard, approveDoctor, refreshTokenAdmin, logoutAdmin } from '../controllers/adminController.js'
import upload from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js'
import { changeAvailability } from '../controllers/doctorController.js'

const adminRouter = express.Router()


// adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/refresh-token', refreshTokenAdmin)
adminRouter.post('/logout', logoutAdmin)
adminRouter.post('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/approve-doctor', authAdmin, approveDoctor)
adminRouter.post('/change-availability', authAdmin, changeAvailability)
adminRouter.get('/appointments', authAdmin, appointmentsAdmin)
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel)
adminRouter.get('/dashboard', authAdmin, adminDashboard)

export default adminRouter
