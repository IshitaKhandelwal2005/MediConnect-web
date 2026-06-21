import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js'
import validator from 'validator'
import {v2 as cloudinary} from 'cloudinary'
import otpModel from '../models/otpModel.js'
import { sendOtpEmail, sendCancellationEmail } from '../utils/emailService.js'
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js'

// Send OTP for doctor registration
const sendDoctorOtp = async (req, res) => {
    try {
        const { email } = req.body
        if (!email || !validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please provide a valid email address' })
        }

        // Check if doctor email is already registered
        const existingDoctor = await doctorModel.findOne({ email })
        if (existingDoctor) {
            return res.json({ success: false, message: 'This email is already registered. Please log in.' })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Upsert OTP
        await otpModel.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        )

        const name = req.body.name || 'Doctor'
        await sendOtpEmail(email, otp, name)

        res.json({ success: true, message: 'OTP sent to your email' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const changeAvailability=async(req,res)=>{
    try{
        const {docId}=req.body
        console.log(docId)
        const docData=await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available:!docData.available})
        await cacheDel('doctors:approved:list')
        await cacheDel('admin:doctors:list')
        res.json({success:true,message:'Availability changed'})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const doctorList =async(req,res)=>{
    try{
        const cacheKey = 'doctors:approved:list';
        const cachedData = await cacheGet(cacheKey);
        if (cachedData) {
            console.log("Cache HIT - Returning from Redis");
            return res.json({ success: true, doctors: cachedData });
        }
        console.log("Cache MISS - Fetching from DB");
        const doctors=await doctorModel.find({ isApproved: true }).select(['-password','-email']).lean()
        await cacheSet(cacheKey, doctors);
        res.json({success:true,doctors})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const loginDoctor =async(req,res)=>{
    try{
        const {email,password}=req.body
        const doctor = await doctorModel.findOne({email})

        if(!doctor)
        {
            return res.json({success:false,message:'Invalid Credentials'})
        }

        const isMatch =await bcrypt.compare(password,doctor.password)
        if(isMatch)
        {
            if (!doctor.isApproved) {
                return res.json({success:false,message:'Your account is pending admin verification and approval.'})
            }
            const { accessToken, refreshToken } = generateTokens({ id: doctor._id, role: 'doctor' })

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            })

            res.json({success:true,token: accessToken})
        }
        else
        {
            res.json({success:false,message:'Invalid Credentials'})
        }
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const appointmentsDoctor =async(req,res)=>{
    try{
        const {docId}=req.body
        const appointments=await appointmentModel.find({docId}).lean()

        res.json({success:true,appointments})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const appointmentComplete =async(req,res)=>{
    try{
        const {docId,appointmentId}=req.body
        const prescriptionFile = req.file
        
        const appointmentData = await appointmentModel.findById(appointmentId)
        if(appointmentData && appointmentData.docId.toString() === docId)
        {
            let prescriptionUrl = ""
            if (prescriptionFile) {
                const isPdf = prescriptionFile.mimetype === 'application/pdf' || prescriptionFile.originalname.toLowerCase().endsWith('.pdf');
                const uploadRes = await cloudinary.uploader.upload(prescriptionFile.path, {
                    resource_type: isPdf ? 'raw' : 'image',
                    folder: 'mediconnect/prescriptions'
                })
                prescriptionUrl = uploadRes.secure_url
            }

            await appointmentModel.findByIdAndUpdate(appointmentId,{
                isCompleted:true,
                prescription: prescriptionUrl
            })
            await cacheDel('doctors:approved:list')
            await cacheDel('admin:dashboard')
            return res.json({success:true,message:'APPOINTMENT COMPLETED'})
        }
        else
        {
            return res.json({success:false,message:'Mark Failed'})
        }
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const appointmentCancel =async(req,res)=>{
    try{
        const {docId,appointmentId}=req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        if(appointmentData && appointmentData.docId.toString() === docId)
        {
            if (appointmentData.cancelled) {
                return res.json({success:false,message:'Appointment is already cancelled'})
            }
            if (appointmentData.isCompleted) {
                return res.json({success:false,message:'Cannot cancel a completed appointment'})
            }
            
            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

            try {
                await sendCancellationEmail(appointmentData.userData.email, appointmentData.userData.name, appointmentData.docData.name, appointmentData.slotDate, appointmentData.slotTime);
            } catch (emailError) {
                console.log("Failed to send cancellation email:", emailError);
            }

            await cacheDel('doctors:approved:list')
            await cacheDel('admin:dashboard')
            return res.json({success:true,message:'APPOINTMENT CANCELLED'})
        }
        else
        {
            return res.json({success:false,message:'Cancellation Failed'})
        }
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const doctorDashboard =async(req,res)=>{
    try{
        const {docId}=req.body
        const appointments=await appointmentModel.find({docId}).lean()
        let earnings=0

        appointments.map((item)=>{
            if(item.isCompleted || item.payment){
                earnings +=item.amount
            }
        })

        let patients=[]
        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })

        const dashData= {
            earnings,
            appointments:appointments.length,
            patients:patients.length,
            latestAppointments:appointments.reverse().slice(0,5)
        }

        res.json({success:true,dashData})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const doctorProfile =async(req,res)=>{
    try{
        const {docId}=req.body;
        const profileData=await doctorModel.findById(docId).select('-password').lean()

        res.json({success:true,profileData})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const updateDoctorProfile =async(req,res)=>{
    try{
        const {docId,fees,address,available}=req.body;

        if (!fees || Number(fees) <= 0) {
            return res.json({ success: false, message: "Consultation fees must be a positive number" })
        }
        if (!address || !address.line1 || !address.line2 || !address.line1.trim() || !address.line2.trim()) {
            return res.json({ success: false, message: "Clinic address is required (both line 1 and line 2)" })
        }

        await doctorModel.findByIdAndUpdate(docId,{fees: Number(fees),address,available})
        await cacheDel('doctors:approved:list')
        await cacheDel('admin:doctors:list')
        res.json({success:true,message:'Profile Updated'})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const registerDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing details" });
        }

        const files = req.files;
        const imageFile = files && files.image ? files.image[0] : null;
        const docFile = files && files.document ? files.document[0] : null;

        if (!imageFile) {
            return res.json({ success: false, message: "Profile image is required" });
        }
        if (!docFile) {
            return res.json({ success: false, message: "Verification document is required" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (minimum 8 characters)" });
        }

        // Check if doctor already exists
        const existingDoctor = await doctorModel.findOne({ email });
        if (existingDoctor) {
            return res.json({ success: false, message: "Doctor already registered with this email" });
        }

        // Verify OTP before processing files
        const { otp } = req.body
        if (!otp) {
            return res.json({ success: false, message: 'OTP is required' })
        }
        const otpRecord = await otpModel.findOne({ email })
        if (!otpRecord) {
            return res.json({ success: false, message: 'OTP expired or not found. Please request a new one.' })
        }
        if (otpRecord.otp !== otp.toString()) {
            return res.json({ success: false, message: 'Invalid OTP. Please check and try again.' })
        }
        await otpModel.deleteOne({ email })

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const docUpload = await cloudinary.uploader.upload(docFile.path, { resource_type: "auto" });
        const docUrl = docUpload.secure_url;

        const doctorData = {
            name,
            email,
            image: imageUrl,
            document: docUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees: Number(fees),
            address: JSON.parse(address),
            isApproved: false,
            date: Date.now()
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        await cacheDel('admin:doctors:list')
        await cacheDel('admin:dashboard')
        res.json({ success: true, message: "Doctor registration submitted. Pending admin approval." });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const refreshTokenDoctor = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.json({ success: false, message: "No refresh token provided" });
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded || decoded.role !== 'doctor') {
            return res.json({ success: false, message: "Invalid refresh token" });
        }

        const doctor = await doctorModel.findById(decoded.id);
        if (!doctor || !doctor.isApproved) {
            return res.json({ success: false, message: "Doctor no longer exists or not approved" });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens({ id: doctor._id, role: 'doctor' });

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

const logoutDoctor = async (req, res) => {
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

export {changeAvailability,updateDoctorProfile,doctorProfile,doctorDashboard,doctorList,loginDoctor,appointmentsDoctor,appointmentCancel,appointmentComplete,registerDoctor,sendDoctorOtp,refreshTokenDoctor,logoutDoctor}