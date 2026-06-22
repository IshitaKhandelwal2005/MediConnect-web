import { jest } from '@jest/globals';
import { appointmentComplete } from '../controllers/doctorController.js';
import appointmentModel from '../models/appointmentModel.js';
import { v2 as cloudinary } from 'cloudinary';

// Mocks applied in tests

describe('Prescription System - appointmentComplete', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            body: { docId: 'doc123', appointmentId: 'app123' },
            file: { path: '/tmp/prescription.jpg', mimetype: 'image/jpeg', originalname: 'prescription.jpg' }
        };
        mockRes = {
            json: jest.fn()
        };
    });

    it('should successfully complete appointment and upload prescription', async () => {
        // Mock appointment existence
        appointmentModel.findById = jest.fn().mockResolvedValue({ docId: { toString: () => 'doc123' } });
        appointmentModel.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
        
        // Mock Cloudinary upload
        cloudinary.uploader.upload = jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/prescription.jpg' });

        await appointmentComplete(mockReq, mockRes);

        expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/tmp/prescription.jpg', { resource_type: 'image', folder: 'mediconnect/prescriptions' });
        expect(appointmentModel.findByIdAndUpdate).toHaveBeenCalledWith('app123', { 
            isCompleted: true,
            prescription: 'https://cloudinary.com/prescription.jpg'
        });
        expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'APPOINTMENT COMPLETED' });
    });

    it('should fail if appointment docId does not match logged in doctor', async () => {
        appointmentModel.findById = jest.fn().mockResolvedValue({ docId: { toString: () => 'differentDocId' } });
        await appointmentComplete(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Mark Failed' });
    });
});
