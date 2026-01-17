import jwt from 'jsonwebtoken';
import userModel from '../models/usermodel';
const userAuth = async (req, res, next) => {
    try {
         const token = req.cookies.accessToken; // Get token from cookie


        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login again'
            });
        }

        // Verify access token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user info to request (no role restriction)
        req.userId = decoded.id;
        req.userRole = decoded.role;
        
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access token expired. Please refresh token',
                expired: true
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

export default userAuth;