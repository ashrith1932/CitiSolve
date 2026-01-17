
// ============================================

// controllers/complaintController.js

// 1. Submit Complaint (Already covered)
export const submitComplaint = async (req, res) => {
  try {
    const { title, description, category, state, district, landmark, pincode, images } = req.body;
    const citizenId =req.userId
    
    const complaint = await complaintModel.create({
      title,
      description,
      category,
      state,
      district,
      landmark,
      pincode,
      images,
      citizen: citizenId,
      status: 'pending'
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Complaint submitted successfully',
      complaint 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// 2. ✅ VIEW SINGLE COMPLAINT BY ID (Citizen)
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const citizenId = req.userId;
    
    // ✅ ADD THIS: Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid complaint ID'
      });
    }
    
    const complaint = await complaintModel
      .findOne({ _id: id, citizen: citizenId })
      .populate('assignedTo', 'name email')
      .populate('citizen', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found or unauthorized' 
      });
    }
    
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// 3. ✅ VIEW ALL COMPLAINTS BY CITIZEN
export const getMyCitizensComplaints = async (req, res) => {
  try {
    const citizenId = req.userId;
    
    const { status, page = 1, limit = 10 } = req.query;
    
    // ✅ ADD THIS: Validate and limit pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));  // Max 50 per page
    
    const query = { citizen: citizenId };
    if (status) {
      query.status = status;
    }
    
    const complaints = await complaintModel
      .find(query)
      .populate('assignedTo', 'name email state district')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);
    
    const total = await complaintModel.countDocuments(query);
    
    res.json({ 
      success: true, 
      complaints,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalComplaints: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// controllers/supportController.js

// 4. ✅ SUBMIT SUPPORT MESSAGE
export const submitSupportMessage = async (req, res) => {
  try {
    const { subject, category, message } = req.body;
    const citizenId =req.userId
    
    const support = await supportModel.create({
      subject,
      category,
      message,
      citizen: citizenId,
      status: 'open'
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Support message submitted successfully',
      support 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// 5. ✅ VIEW ALL SUPPORT MESSAGES BY CITIZEN
export const getMySupportMessages = async (req, res) => {
  try {
    const citizenId =req.userId
    
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { citizen: citizenId };
    if (status) {
      query.status = status;
    }
    
    const messages = await supportModel
      .find(query)
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await supportModel.countDocuments(query);
    
    res.json({ 
      success: true, 
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// 6. ✅ VIEW SINGLE SUPPORT MESSAGE BY ID
export const getSupportMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const citizenId =req.userId
    
    const message = await supportModel
      .findOne({ _id: id, citizen: citizenId })
      .populate('respondedBy', 'name email');
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Support message not found or unauthorized' 
      });
    }
    
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
