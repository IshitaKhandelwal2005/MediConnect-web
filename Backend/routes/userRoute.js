import express from 'express'
import { bookAppointment,paymentRazorpay, cancelAppointment,listAppointment,getProfile, loginUser, registerUser, updateProfile, sendOtp, refreshTokenUser, logoutUser } from '../controllers/userController.js'
import { addReview, getReviews } from '../controllers/reviewController.js'
import { uploadHealthRecord, deleteHealthRecord, getHealthRecords } from '../controllers/ehrController.js'
import authUser from '../middleware/authUser.js'
import upload from '../middleware/multer.js'


const userRouter =express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/send-otp', sendOtp)
userRouter.post('/login',loginUser)
userRouter.post('/refresh-token', refreshTokenUser)
userRouter.post('/logout', logoutUser)
userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/payment-razorpay',authUser,paymentRazorpay)
userRouter.post('/add-review',authUser,addReview)
userRouter.get('/reviews/:docId',getReviews)

// EHR routes
userRouter.post('/upload-health-record', upload.single('file'), authUser, uploadHealthRecord)
userRouter.delete('/health-record/:recordId', authUser, deleteHealthRecord)
userRouter.get('/health-records', authUser, getHealthRecords)

export default userRouter