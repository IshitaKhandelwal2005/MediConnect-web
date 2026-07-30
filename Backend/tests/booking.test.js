import { jest } from '@jest/globals';
import { bookAppointment } from '../controllers/userController.js';
import doctorModel from '../models/doctorModel.js';
import userModel from '../models/userModel.js';
import appointmentModel from '../models/appointmentModel.js';
import * as redisCache from '../config/redis.js';

describe('Booking System - bookAppointment', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            body: { userId: 'user123', docId: 'doc123', slotDate: '20_10_2023', slotTime: '10:00 AM' }
        };
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    it('should successfully book an appointment', async () => {
        const mockDoctorData = { 
            _id: 'doc123', 
            slots_booked: {}, 
            available: true,
            fees: 100,
            toObject: jest.fn().mockReturnValue({ _id: 'doc123', fees: 100 }),
        };
        doctorModel.findById = jest.fn().mockResolvedValue(mockDoctorData);
        doctorModel.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
        
        const mockUserData = { _id: 'user123' };
        userModel.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockUserData) });

        // Mock appointment model instantiation
        appointmentModel.prototype.save = jest.fn().mockResolvedValue(true);

        await bookAppointment(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Appointment booked' });
        expect(doctorModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should fail if doctor is not available', async () => {
        const mockDoctorData = { _id: 'doc123', slots_booked: {}, available: false };
        doctorModel.findById = jest.fn().mockResolvedValue(mockDoctorData);
        
        await bookAppointment(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'doctor not available' });
    });

    it('should reject a duplicate appointment slot', async () => {
        const mockDoctorData = {
            _id: 'doc123',
            slots_booked: {},
            available: true,
            fees: 100,
            toObject: jest.fn().mockReturnValue({ _id: 'doc123', fees: 100 })
        };
        doctorModel.findById = jest.fn().mockResolvedValue(mockDoctorData);
        doctorModel.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

        const mockUserData = { _id: 'user123' };
        userModel.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockUserData) });

        const duplicateError = new Error('duplicate key error');
        duplicateError.code = 11000;
        appointmentModel.prototype.save = jest.fn().mockRejectedValue(duplicateError);

        await bookAppointment(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'slot not available' });
        expect(doctorModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
});
