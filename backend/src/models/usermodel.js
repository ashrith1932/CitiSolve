// models/usermodel.js - CORRECTED VERSION

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    index: true  // ✅ Add index for faster queries
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String, 
    enum: ['admin', 'staff', 'citizen'],  // ✅ FIXED: Changed 'user' to 'staff'
    default: 'citizen'  // ✅ Default should be 'citizen' for public users
  },
    
  state: { 
    type: String, 
    required: function() { return this.role === 'staff' || this.role=='admin'; }  // ✅ Now matches enum
  },
  district: { 
    type: String, 
    required: function() { return this.role === 'staff' || this.role=='admin'; }  // ✅ Now matches enum
  },
  department: {
    type: String,
    enum: ['roads', 'power', 'sanitation', 'water', 'other'],
    required: function() { return this.role === 'staff'; }
  },
  verifyOtp: { 
    type: String, 
    default: "" 
  },
  verifyOtpExpireAt: { 
    type: Number, 
    default: 0 
  },
  resetOtp: { 
    type: String, 
    default: "" 
  },
  resetOtpExpireAt: { 
    type: Number, 
    default: 0 
  },
  isAccountVerified: {
    type: Boolean,
    default: false
  },
  refreshToken: {
    type: String,
    default: null,
    index: true  // ✅ Add index for faster token lookups
  },
}, { timestamps: true });

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const userModel = mongoose.model('user', userSchema);

export default userModel;