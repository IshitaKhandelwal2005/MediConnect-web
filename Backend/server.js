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
import { verifyEmailTransport } from './utils/emailService.js'

const app = express() // routes,middleware
const port = process.env.PORT || 4000

// Trust reverse proxies (e.g., Render/Cloudflare) so req.ip and rate limiting work correctly.
app.set('trust proxy', 1)

connectDB()
connectCloudinary()
connectRedis()
startReminderJob()

verifyEmailTransport()
    .then(() => console.log('Email transport verified'))
    .catch((error) => console.log('Email transport verification failed:', error.message))

app.use(express.json())
app.use(cookieParser())

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://medi-connect-web.vercel.app',
    // 'https://medi-connect-web-wine.vercel.app',
    'https://medi-connect-redic5msz-ishitas-projects-cdb5fa95.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/$/, '');

        // If origin matches allowed list, ends with .vercel.app, or onrender.com
        if (
            allowedOrigins.includes(cleanOrigin) ||
            cleanOrigin.endsWith('.vercel.app') ||
            cleanOrigin.includes('onrender.com') ||
            process.env.NODE_ENV !== 'production'
        ) {
            return callback(null, origin);
        }

        // Reflect origin dynamically to satisfy credentials: true requirement
        return callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'atoken', 'dtoken'],
    optionsSuccessStatus: 200
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
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

app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)
app.use('/api/payment', paymentRouter)

app.get('/', (req, res) => {
    res.send('API working')
})

app.listen(port, () => console.log("server started", port))
