import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/authRoutes.js";
import complaintRouter from './src/routes/complaintRoutes.js';
import supportRouter from './src/routes/supportRoutes.js';
import { multerErrorHandler } from './src/middleware/errorhandler.js';
import staffRouter from './src/routes/staffroutes.js'
import adminRouter from './src/routes/adminRoutes.js'

mongoose.connect("mongodb://localhost:27017/CitiSolve"),{
    useNewUrlParser: true,
    useUnifiedTopology : true
}

const app = express();
const PORT = process.env.PORT || 3000;
const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://localhost:5173'  // Your frontend domain
        : 'http://localhost:3000',   // Dev frontend
    credentials: true,               // Allow cookies
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const allowedOrigins = ['http://localhost:5173']

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin : allowedOrigins ,credentials: true }));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth',authRouter);
app.use('/api/complaints',complaintRouter);
app.use('/api/support',supportRouter);

app.use(multerErrorHandler); 

// app.use('/api/user',citizenRouter);
app.use('/api/staff',staffRouter);
app.use('/api/admin',adminRouter);
app.get('/' , (req, res)=>{
  res.send("API WORKING!!");
})
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎪 Caravan Chronicle server running on port ${PORT}`);
});
