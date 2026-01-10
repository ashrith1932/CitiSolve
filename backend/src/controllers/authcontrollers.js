const usermodal = require("../models/usermodel.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ============================================
// HELPER: Generate OTP
// ============================================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// HELPER: Send OTP Email
// ============================================
async function sendOTPEmail(email, otp) {
  await transporter.sendMail({
    from: `"CitiSolve OTP" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: "Your Login OTP",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your OTP is ${otp}</h2>
        <p>CitiSolve sends a secure, time-bound OTP.</p>
        <p>Do not share this OTP with anyone.</p>
        <p>Valid for 10 minutes.</p>
      </div>
    `,
  });
}

// ============================================
// 1. SIGNUP - Initial Step
// ============================================
const signup = async (req, res) => {
  try {
    const { fullname, email, password, ward_department, role } = req.body;

    // Validation
    if (!fullname || !email || !password || !ward_department || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await usermodal.checkExistingUser(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in session (NOT in database yet)
    req.session.pendingAuth = {
      type: 'signup',
      fullname,
      email,
      password: hashedPassword,
      ward: role === 'citizen' ? ward_department : null,
      department: role === 'staff' || role === 'admin' ? ward_department : null,
      role,
      otp,
      otpExpiry
    };

    await req.session.save();

    // Send OTP
    await sendOTPEmail(email, otp);

    return res.status(200).json({ 
      message: "OTP sent to your email",
      email // Send back email for UI display
    });

  } catch (err) {
    console.error("❌ Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// 2. LOGIN - Initial Step
// ============================================
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check user credentials
    const result = await usermodal.checkuser(email, password, role);
    
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in session
    req.session.pendingAuth = {
      type: 'login',
      userId: result.user.id,
      email: result.user.email,
      fullname: result.user.fullname,
      role: result.user.role,
      ward: result.user.ward,
      department: result.user.department,
      otp,
      otpExpiry
    };

    await req.session.save();

    // Send OTP
    await sendOTPEmail(email, otp);

    return res.status(200).json({ 
      message: "OTP sent to your email",
      email
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// 3. VERIFY OTP - Final Step (Both Signup & Login)
// ============================================
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    // Check if pending auth exists
    if (!req.session.pendingAuth) {
      return res.status(401).json({ message: "No pending authentication" });
    }

    const { otp: storedOTP, otpExpiry, type } = req.session.pendingAuth;

    // Verify OTP
    if (otp !== storedOTP) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Check expiry
    if (Date.now() > otpExpiry) {
      delete req.session.pendingAuth;
      await req.session.save();
      return res.status(401).json({ message: "OTP expired. Please try again." });
    }

    // ============================================
    // SIGNUP: Create user in database
    // ============================================
    if (type === 'signup') {
      const { fullname, email, password, ward, department, role } = req.session.pendingAuth;
      
      const newUser = await usermodal.createuser(
        fullname,
        email,
        password, // Already hashed
        role === 'citizen' ? ward : department,
        role
      );

      // Set active session
      req.session.userId = newUser.id;
      req.session.email = newUser.email;
      req.session.fullname = newUser.fullname;
      req.session.role = newUser.role;
      req.session.ward = newUser.ward;
      req.session.department = newUser.department;
    }
    
    // ============================================
    // LOGIN: Activate session
    // ============================================
    else if (type === 'login') {
      const { userId, email, fullname, role, ward, department } = req.session.pendingAuth;
      
      req.session.userId = userId;
      req.session.email = email;
      req.session.fullname = fullname;
      req.session.role = role;
      req.session.ward = ward;
      req.session.department = department;
    }

    // Clear pending auth
    delete req.session.pendingAuth;
    
    await req.session.save();

    return res.status(200).json({
      message: type === 'signup' ? "Account created successfully" : "Login successful",
      user: {
        id: req.session.userId,
        email: req.session.email,
        fullname: req.session.fullname,
        role: req.session.role,
        ward: req.session.ward,
        department: req.session.department
      }
    });

  } catch (err) {
    console.error("❌ OTP verification error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// 4. RESEND OTP
// ============================================
const resendOTP = async (req, res) => {
  try {
    if (!req.session.pendingAuth) {
      return res.status(401).json({ message: "No pending authentication" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    req.session.pendingAuth.otp = otp;
    req.session.pendingAuth.otpExpiry = otpExpiry;

    await req.session.save();

    // Send OTP
    await sendOTPEmail(req.session.pendingAuth.email, otp);

    return res.status(200).json({ message: "New OTP sent" });

  } catch (err) {
    console.error("❌ Resend OTP error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// 5. GET CURRENT USER
// ============================================
const getMe = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    return res.status(200).json({
      id: req.session.userId,
      role: req.session.role,
      email: req.session.email,
      fullname: req.session.fullname,
      ward: req.session.ward,
      department: req.session.department
    });
  } catch (err) {
    console.error("❌ Error fetching user data:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// 6. LOGOUT
// ============================================
const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout error:", err);
      return res.status(500).json({ message: "Error logging out" });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: "Logged out successfully" });
  });
};

module.exports = {
  signup,
  login,
  verifyOTP,
  resendOTP,
  getMe,
  logout
};