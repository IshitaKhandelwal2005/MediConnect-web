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
            body: { userId: 'user123', docId: 'doc123', slotDate: '20-10-2023', slotTime: '10:00 AM' }
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
            markModified: jest.fn(),
            toObject: jest.fn().mockReturnValue({ _id: 'doc123', fees: 100 }),
            save: jest.fn().mockResolvedValue(true)
        };
        doctorModel.findById = jest.fn().mockResolvedValue(mockDoctorData);
        
        const mockUserData = { _id: 'user123' };
        userModel.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockUserData) });

        // Mock appointment model instantiation
        appointmentModel.prototype.save = jest.fn().mockResolvedValue(true);

        await bookAppointment(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Appointment booked' });
        expect(mockDoctorData.save).toHaveBeenCalled();
    });

    it('should fail if doctor is not available', async () => {
        const mockDoctorData = { _id: 'doc123', slots_booked: {}, available: false };
        doctorModel.findById = jest.fn().mockResolvedValue(mockDoctorData);
        
        await bookAppointment(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'doctor not available' });
    });
});
