import { jest } from '@jest/globals';
// Ensure env variables are set BEFORE dynamic imports
process.env.RAZORPAY_KEY_ID = 'test_id';
process.env.RAZORPAY_KEY_SECRET = 'test_secret';

import { refreshTokenUser, logoutUser } from '../controllers/userController.js';
import userModel from '../models/userModel.js';
import { generateTokens } from '../utils/jwt.js';

// Mock the dependencies
jest.unstable_mockModule('razorpay', () => ({
    default: class MockRazorpay {
        constructor() {}
    }
}));

jest.unstable_mockModule('../models/userModel.js', () => ({
    default: {
        findById: jest.fn()
    }
}));

describe('User Controller - Auth', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request and response
        mockReq = {
            cookies: {},
            body: {}
        };

        mockRes = {
            json: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        process.env.JWT_SECRET = 'test_secret';
    });

    it('logoutUser should clear the refreshToken cookie', async () => {
        await logoutUser(mockReq, mockRes);
        
        expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
        expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Logged out successfully' });
    });

    it('refreshTokenUser should fail if no token is provided', async () => {
        await refreshTokenUser(mockReq, mockRes);
        
        expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'No refresh token provided' });
    });

    it('refreshTokenUser should issue a new token if valid', async () => {
        // Generate a valid token
        const { refreshToken } = generateTokens({ id: 'user123', role: 'user' });
        mockReq.cookies.refreshToken = refreshToken;

        // Mock DB call
        userModel.findById = jest.fn().mockResolvedValue({ _id: 'user123' });

        await refreshTokenUser(mockReq, mockRes);
        
        expect(userModel.findById).toHaveBeenCalledWith('user123');
        expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', expect.any(String), expect.any(Object));
        expect(mockRes.json).toHaveBeenCalledWith({ success: true, token: expect.any(String) });
    });
});
