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

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // For development, allow any localhost origin
            if (origin.startsWith('http://localhost:')) {
                return callback(null, true);
            }
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
})); // frontend //different domains can access api

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, 
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => getRedisClient().sendCommand(args),
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
