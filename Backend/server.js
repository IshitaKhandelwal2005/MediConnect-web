import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import multer from 'multer'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import paymentRouter from './routes/paymentRoute.js'
import { startReminderJob } from './jobs/appointmentReminders.js'

const app=express() // routes,middleware
const port=process.env.PORT || 4000

connectDB()
connectCloudinary()
startReminderJob()
app.use(express.json())
app.use(cors({
    origin: '*', // Allows all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
})); // frontend //different domains can access api


app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.use('/api/payment',paymentRouter)


app.get('/',(req,res)=>{
    res.send('API working')
})

app.listen(port ,()=>console.log("server started",port))
