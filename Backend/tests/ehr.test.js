import { jest } from '@jest/globals';
import { uploadHealthRecord } from '../controllers/ehrController.js';
import userModel from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary';

// Mocks applied in tests

describe('EHR System - uploadHealthRecord', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            body: { userId: 'user123', recordType: 'Lab Result', description: 'Test record', recordDate: '20-10-2023' },
            file: { path: '/tmp/test.jpg', originalname: 'test.jpg', mimetype: 'image/jpeg' }
        };
        mockRes = {
            json: jest.fn()
        };
    });

    it('should successfully upload an EHR document', async () => {
        // Mock user existence with save method
        const mockUser = { _id: 'user123', healthRecords: [], save: jest.fn().mockResolvedValue(true) };
        userModel.findById = jest.fn().mockResolvedValue(mockUser);
        userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
        
        // Mock Cloudinary upload
        cloudinary.uploader.upload = jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/test.jpg' });

        await uploadHealthRecord(mockReq, mockRes);

        expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/tmp/test.jpg', { resource_type: 'image', folder: 'mediconnect/ehr' });
        // The save method on our mocked user should have been called
        const userInstance = await userModel.findById('user123');
        expect(userInstance.save).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Health record uploaded successfully', record: expect.any(Object) });
    });

    it('should fail if no file is provided', async () => {
        mockReq.file = undefined;
        await uploadHealthRecord(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'No file uploaded' });
    });
});
