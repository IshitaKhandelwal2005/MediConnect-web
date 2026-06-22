import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import { connectRedis, getRedisClient } from './config/redis.js'
import compression from 'compression'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
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
connectRedis()
startReminderJob()
app.use(express.json())
app.use(cookieParser())

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176','https://medi-connect-redic5msz-ishitas-projects-cdb5fa95.vercel.app'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
}));

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, 
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => getRedisClient().call(...args),
    }),
});
app.use('/api', limiter);


app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.use('/api/payment',paymentRouter)


app.get('/',(req,res)=>{
    res.send('API working')
})

app.listen(port ,()=>console.log("server started",port))
