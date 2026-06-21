import jwt from 'jsonwebtoken';

const generateTokens = (payload) => {
    // Access token valid for 15 minutes
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    // Refresh token valid for 30 days
    // Fallback to JWT_SECRET if JWT_REFRESH_SECRET is not provided
    const refreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh');
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '30d' });

    return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh');
    return jwt.verify(token, refreshSecret);
};

export { generateTokens, verifyRefreshToken };
