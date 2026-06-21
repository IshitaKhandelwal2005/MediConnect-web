import validator from 'validator'
import bcrypt from 'bcryptjs'
import userModel from '../models/userModel.js'
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import Razorpay from 'razorpay'
import otpModel from '../models/otpModel.js'
import { sendOtpEmail, sendCancellationEmail } from '../utils/emailService.js'
import { cacheDel } from '../config/redis.js'

// Send OTP for user registration
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        if (!email || !validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please provide a valid email address' })
        }

        // Check if email is already registered
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.json({ success: false, message: 'This email is already registered. Please log in.' })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Upsert OTP (replace any existing OTP for this email)
        await otpModel.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        )

        // Send email
        const name = req.body.name || 'User'
        await sendOtpEmail(email, otp, name)

        res.json({ success: true, message: 'OTP sent to your email' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to register user

const registerUser =async(req,res)=>{

    try{
        const {name,email,password,phone,gender,address}=req.body
        if(!name || !password || !email || !phone || !gender)
        {
            return res.json({success:false,message:"missing details"})
        }

        if(!validator.isEmail(email))
        {
            return res.json({success:false,message:"enter a valid email"})
        }

        if(password.length <8)
        {
            return res.json({success:false,message:"enter a strong password"})
        }

        if (!phone.trim()) {
            return res.json({success:false,message:"please enter a valid phone number"})
        }

        if (!gender || gender === 'Not Selected' || !gender.trim()) {
            return res.json({success:false,message:"please select your gender"})
        }

        // Validate/parse optional address
        let addressObj = { line1: '', line2: '' }
        if (address) {
            if (typeof address === 'string') {
                try {
                    addressObj = JSON.parse(address)
                } catch (e) {
                    addressObj = { line1: address, line2: '' }
                }
            } else if (typeof address === 'object') {
                addressObj = {
                    line1: address.line1 || '',
                    line2: address.line2 || ''
                }
            }
        }

        // Verify OTP
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
        // Delete OTP after successful verification
        await otpModel.deleteOne({ email })

        const salt=await bcrypt.genSalt(10)
        const hashedPassword =await bcrypt.hash(password,salt)

        const userData={
            name,email,password:hashedPassword,phone,gender,address:addressObj
        }

        const newUser =new userModel(userData)
        const user=await newUser.save()

        const { accessToken, refreshToken } = generateTokens({ id: user._id, role: 'user' })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        })

        res.json({success:true,token: accessToken})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}


//api for user login

const loginUser=async (req,res) =>{
    try{
        const {email,password}=req.body
        const user =await userModel.findOne({email})
        if(!user)
        {
            return res.json({success:false,message:"user does not exist"})
        }

        const isMatch =await bcrypt.compare(password,user.password)

        if(isMatch)
        {
            const { accessToken, refreshToken } = generateTokens({ id: user._id, role: 'user' })

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
            res.json({success:false,message:"invalid credentials"})
        }

    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const refreshTokenUser = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.json({ success: false, message: "No refresh token provided" });
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded || decoded.role !== 'user') {
            return res.json({ success: false, message: "Invalid refresh token" });
        }

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.json({ success: false, message: "User no longer exists" });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens({ id: user._id, role: 'user' });

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

const logoutUser = async (req, res) => {
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

const getProfile =async(req,res)=>{
    try{

        const {userId}=req.body
        const userData=await userModel.findById(userId).select('-password').lean()
        res.json({success:true,userData})

    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const updateProfile =async(req,res)=>{
    try{
        const {userId,name,phone,address,dob,gender}=req.body
        const imageFile =req.file

        if(!name || !phone || !gender)
        {
            return res.json({success:false,message:"data missing"})
        }

        if (!phone.trim()) {
            return res.json({success:false,message:"please enter a valid phone number"})
        }

        if (gender === 'Not Selected' || !gender.trim()) {
            return res.json({success:false,message:"please select your gender"})
        }

        // Safely parse optional address
        let addressObj = { line1: '', line2: '' }
        if (address) {
            try {
                addressObj = JSON.parse(address)
            } catch (e) {
                // Ignore parse errors, keep default empty strings
            }
        }

        await userModel.findByIdAndUpdate(userId,{name,phone,address:addressObj,dob,gender})
        
        if(imageFile)
        {
            const imageUpload =await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL=imageUpload.secure_url
            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }
        res.json({success:true,message:"profile updated"})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const bookAppointment=async(req,res)=>{

    try{
        const {userId,docId,slotDate,slotTime}=req.body

        if(!slotTime || slotTime === ''){
            return res.json({success:false,message:"slotTime is required"})
        }

        const docData=await doctorModel.findById(docId)

        if(!docData.available)
        {
            return res.json({success:false,message:"doctor not available"})

        }
        let slots_booked=docData.slots_booked

        if(slots_booked[slotDate])
        {
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success:false,message:"slot not available"})
            }
            else
            {
                slots_booked[slotDate].push(slotTime)
            }
        }
        else
        {
            slots_booked[slotDate]=[]
            slots_booked[slotDate].push(slotTime)
        }

        docData.markModified('slots_booked')

        const userData =await userModel.findById(userId).select('-password')
        
        const docDataCopy = docData.toObject()
        delete docDataCopy.slots_booked
        delete docDataCopy.password

        const appointmentData ={
            userId,docId,userData,docData: docDataCopy,amount:docData.fees,slotTime,slotDate,date:Date.now()
        }

        const newAppointment =new appointmentModel(appointmentData)
        await newAppointment.save()

        try {
            await docData.save()
        } catch (err) {
            if (err.name === 'VersionError') {
                await appointmentModel.findByIdAndDelete(newAppointment._id)
                return res.json({success:false,message:"This slot was just booked by someone else. Please try again."})
            }
            await appointmentModel.findByIdAndDelete(newAppointment._id)
            throw err
        }

        await cacheDel('doctors:approved:list')
        await cacheDel('admin:dashboard')
        res.json({success:true,message:"Appointment booked"})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const listAppointment=async (req,res)=>{
    try{
        const {userId}=req.body
        const appointments =await appointmentModel.find({userId}).lean()
        res.json({success:true,appointments})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const cancelAppointment =async (req,res)=>{

    try{
        const {userId,appointmentId}=req.body

        const appointmentData =await appointmentModel.findById(appointmentId)

        if(appointmentData.userId !==userId)
        {
            res.json({success:true,message:"unauthorized action"})

        }
        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

        const {docId,slotDate,slotTime}=appointmentData
       const doctorData=await doctorModel.findById(docId)

       let slots_booked =doctorData.slots_booked

       slots_booked[slotDate]=slots_booked[slotDate].filter(e =>e!=slotTime)
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})
        
        try {
            await sendCancellationEmail(appointmentData.userData.email, appointmentData.userData.name, doctorData.name, slotDate, slotTime);
        } catch (emailError) {
            console.log("Failed to send cancellation email:", emailError);
        }

        await cacheDel('doctors:approved:list')
        await cacheDel('admin:dashboard')
        res.json({success:true,message:"Appointment cancelled"})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay =async(req,res)=>{
    try{

        const {appointmentId}=req.body
        const appointmentData=await appointmentModel.findById(appointmentId)

        if(!appointmentData || appointmentData.cancelled)
        {
            return res.json({success:false,message:"Appointment cancelled or not found"})
        }

        const options ={
            amount :appointmentData.amount *100,
            currency :process.env.CURRENCY,
            receipt:appointmentId,
        }

        const order= await razorpayInstance.orders.create(options)

        res.json({success:true,order})
    }
    catch(error)
    {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}


export {registerUser,sendOtp,loginUser,paymentRazorpay,getProfile,updateProfile,bookAppointment,listAppointment,cancelAppointment,refreshTokenUser,logoutUser}

