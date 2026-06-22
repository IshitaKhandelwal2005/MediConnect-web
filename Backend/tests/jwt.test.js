import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import jwt from 'jsonwebtoken';

describe('JWT Utility', () => {
    const payload = { id: 'user123', role: 'user' };

    beforeAll(() => {
        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    });

    it('should generate an access token and a refresh token', () => {
        const tokens = generateTokens(payload);
        
        expect(tokens).toHaveProperty('accessToken');
        expect(tokens).toHaveProperty('refreshToken');

        // Verify payload
        const decodedAccess = jwt.verify(tokens.accessToken, process.env.JWT_SECRET);
        expect(decodedAccess.id).toBe(payload.id);
        expect(decodedAccess.role).toBe(payload.role);
    });

    it('should correctly verify a valid refresh token', () => {
        const tokens = generateTokens(payload);
        const decoded = verifyRefreshToken(tokens.refreshToken);
        
        expect(decoded.id).toBe(payload.id);
        expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for an invalid refresh token', () => {
        expect(() => {
            verifyRefreshToken('invalid.token.here');
        }).toThrow();
    });
});
