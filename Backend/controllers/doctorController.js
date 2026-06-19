import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import validator from 'validator'
import {v2 as cloudinary} from 'cloudinary'
const changeAvailability=async(req,res)=>{
    try{
        const {docId}=req.body
        console.log(docId)
        const docData=await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available:!docData.available})
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
        const doctors=await doctorModel.find({ isApproved: true }).select(['-password','-email'])
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
            const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET)
            res.json({success:true,token})
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
        await appointmentModel.autoCompleteAppointments()
        const appointments=await appointmentModel.find({docId})

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
        await appointmentModel.autoCompleteAppointments()
        const appointments=await appointmentModel.find({docId})
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
        const profileData=await doctorModel.findById(docId).select('-password')

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

        res.json({ success: true, message: "Doctor registration submitted. Pending admin approval." });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {changeAvailability,updateDoctorProfile,doctorProfile,doctorDashboard,doctorList,loginDoctor,appointmentsDoctor,appointmentCancel,appointmentComplete,registerDoctor}