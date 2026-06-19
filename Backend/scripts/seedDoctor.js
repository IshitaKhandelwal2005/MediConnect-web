import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import doctorModel from '../models/doctorModel.js'
import dotenv from 'dotenv'

dotenv.config()

const seedDoctor = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/mediconnect`)
        console.log('Connected to MongoDB')

        // Delete existing doctor if exists
        await doctorModel.deleteOne({ email: 'doctor@mediconnect.com' })
        console.log('Deleted existing doctor (if any)')

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash('doctor123', salt)

        // Create doctor
        const doctorData = {
            name: 'Dr. John Smith',
            email: 'doctor@mediconnect.com',
            password: hashedPassword,
            image: 'https://res.cloudinary.com/diehagnjg/image/upload/v1710000000/placeholder_doctor.jpg',
            speciality: 'General Physician',
            degree: 'MBBS',
            experience: '5 Years',
            about: 'Dr. John Smith is an experienced general physician with over 5 years of practice. He specializes in preventive care and general health consultations.',
            fees: 50,
            address: {
                line1: '123 Medical Center',
                line2: 'Health Street, City'
            },
            date: Date.now(),
            available: true,
            isApproved: true,
            slots_booked: {}
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        console.log('Doctor created successfully!')
        console.log('================================')
        console.log('DOCTOR CREDENTIALS:')
        console.log('Email: doctor@mediconnect.com')
        console.log('Password: doctor123')
        console.log('================================')
        console.log('ADMIN CREDENTIALS:')
        console.log('Email: admin@mediconnect.com')
        console.log('Password: qwerty123')
        console.log('================================')

        process.exit(0)
    } catch (error) {
        console.error('Error seeding doctor:', error)
        process.exit(1)
    }
}

seedDoctor()
