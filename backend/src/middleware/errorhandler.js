// middleware/errorHandler.js
import multer from 'multer';
import jwt from 'jsonwebtoken';

export const multerErrorHandler = (err, req, res, next) => {
  // Multer errors
  if (err instanceof multer.MulterError) {
    const messages = {
      'LIMIT_FILE_SIZE': 'File too large. Maximum size is 5MB',
      'LIMIT_FILE_COUNT': 'Too many files. Maximum is 5 images',
      'LIMIT_UNEXPECTED_FILE': 'Unexpected field name for file upload'
    };
    
    return res.status(400).json({
      success: false,
      error: messages[err.code] || err.message
    });
  }
  
  // Custom file filter error
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next(err);
};