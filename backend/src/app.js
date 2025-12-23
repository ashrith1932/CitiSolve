const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/authroutes');
const citizenroutes = require('./routes/citizenroutes');
const staffroutes = require('./routes/staffroutes');
const adminroutes = require('./routes/adminroutes');

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.Front_END_URL, // Your React app URL
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("trust proxy", 1); // IMPORTANT for Render

app.use(session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,          // Render uses HTTPS
    sameSite: "lax",      // Needed for cross-site (Vercel → Render)
    httpOnly: true
  }
}));


// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Session ID:', req.sessionID);
  console.log('User ID in session:', req.session?.userId);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth',citizenroutes);
app.use('/api/auth',staffroutes);
app.use('/api/auth',adminroutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    sessionId: req.sessionID,
    userId: req.session?.userId || 'Not logged in'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message
  });
});

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

module.exports=app;
