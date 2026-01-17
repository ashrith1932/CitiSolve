// controllers/complaintController.js
import complaintModel from '../models/complaintModel.js';
import mongoose from 'mongoose';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

// ✅ YOUR 5 CATEGORIES
const VALID_CATEGORIES = ['roads', 'power', 'sanitation', 'water', 'other'];

export const submitComplaint = async (req, res) => {
  const uploadedUrls = [];
  
  try {
    const { title, description, category, state, district, landmark, pincode,comment } = req.body;
    const citizenId = req.userId;
    
    // Validate required fields
    if (!title?.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    if (!description?.trim()) {
      return res.status(400).json({ success: false, error: 'Description is required' });
    }
    if (!category) {
      return res.status(400).json({ success: false, error: 'Category is required' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid category. Must be one of: roads, power, sanitation, water, other` 
      });
    }
    if (!state?.trim()) {
      return res.status(400).json({ success: false, error: 'State is required' });
    }
    if (!district?.trim()) {
      return res.status(400).json({ success: false, error: 'District is required' });
    }
    if (!pincode?.trim()) {
      return res.status(400).json({ success: false, error: 'Pincode is required' });
    }
    
    // Validate pincode format
    if (!/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Pincode must be exactly 6 digits' 
      });
    }

      // ✅ OPTIONAL: Validate comment length if provided
    if (comment && comment.trim().length > 500) {
      return res.status(400).json({ 
        success: false, 
        error: 'Comment cannot exceed 500 characters' 
      });
    }
    
    // Validate authentication
    if (!citizenId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
  // if (req.files.length > 5) {
  //   return res.status(400).json({
  //     success: false,
  //     error: 'Maximum 5 images allowed'
  //   });
  // }
  const files = (req.files || []).filter(
  f => f && f.buffer && f.size > 0
);

if (files.length > 5) {
  return res.status(400).json({
    success: false,
    error: 'Maximum 5 images allowed'
  });
}


  for (const file of req.files) {
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: 'Only image files are allowed'
      });
    }

    const url = await uploadToCloudinary(file.buffer, 'complaints');
    uploadedUrls.push(url);
  }
}

    
    // Create complaint
    const complaint = await complaintModel.create({
      title: title.trim(),
      description: description.trim(),
      category: category,
      state: state.trim(),
      district: district.trim(),
      landmark: landmark?.trim() || '',
      pincode: pincode.trim(),
      images: uploadedUrls,
      citizen: citizenId,
      status: 'pending'
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Complaint submitted successfully',
      complaint 
    });
    
  } catch (error) {
    // Cleanup uploaded images on error
    for (const url of uploadedUrls) {
      try {
        await deleteFromCloudinary(url);
      } catch (cleanupError) {
        console.error('Image cleanup failed:', cleanupError);
      }
    }
    
    console.error('Submit complaint error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        error: messages.join(', ') 
      });
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const citizenId = req.userId;
    
    const complaint = await complaintModel
      .findOne({ _id: id, citizen: citizenId })
      .populate('assignedTo', 'name email state district')
      .populate('citizen', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        error: 'Complaint not found' 
      });
    }
    
    res.json({ success: true, complaint });
    
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getMyCitizensComplaints = async (req, res) => {
  try {
    const citizenId = req.userId;
    const { status = 'all', category = 'all', search, page = 1, limit = 10 } = req.query;

    const query = { citizen: citizenId };

    // ✅ STATUS FILTER
    if (status !== 'all') {
      const validStatuses = ['pending', 'assigned', 'in-progress', 'resolved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: all, ${validStatuses.join(', ')}`
        });
      }
      query.status = status;
    }

    // ✅ CATEGORY FILTER
    if (category !== 'all') {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Must be one of: all, ${VALID_CATEGORIES.join(', ')}`
        });
      }
      query.category = category;
    }

    // ✅ SEARCH FILTER
    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { landmark: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // ✅ PAGINATION
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [complaints, total] = await Promise.all([
      complaintModel
        .find(query)
        .populate('assignedTo', 'name email state district')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      complaintModel.countDocuments(query)
    ]);

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
    console.error('Get complaints error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getCitizenAnalytics = async (req, res) => {
  try {
    const citizenId = req.userId;

    if (!citizenId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

 
    const query = { citizen: new mongoose.Types.ObjectId(citizenId) };

    // Status distribution for pie chart
    const statusDistribution = await complaintModel.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Category breakdown for bar graph
    const categoryBreakdown = await complaintModel.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Debug: Log raw data
    console.log('citizenId:', citizenId);
    console.log('Raw statusDistribution:', statusDistribution);
    console.log('Raw categoryBreakdown:', categoryBreakdown);

    // Total counts
    const [total, resolved, inProgress, pending] = await Promise.all([
      complaintModel.countDocuments(query),
      complaintModel.countDocuments({ ...query, status: 'resolved' }),
      complaintModel.countDocuments({ ...query, status: 'in-progress' }),
      complaintModel.countDocuments({ ...query, status: 'pending' })
    ]);

    // Format status distribution
    const allStatuses = ['pending', 'in-progress', 'resolved'];
    const statusMap = {};
    statusDistribution.forEach(item => {
      statusMap[item._id] = item.count;
    });
    const formattedStatus = allStatuses.map(status => ({
      status,
      count: statusMap[status] || 0
    }));

    // Format category breakdown
    const allCategories = ['roads', 'power', 'sanitation', 'water', 'other'];
    const categoryMap = {};
    categoryBreakdown.forEach(item => {
      categoryMap[item._id] = item.count;
    });
    const formattedCategory = allCategories.map(category => ({
      category,
      count: categoryMap[category] || 0
    }));

    console.log('Formatted status:', formattedStatus);
    console.log('Formatted category:', formattedCategory);

    res.json({
      success: true,
      analytics: {
        statusDistribution: formattedStatus,
        categoryBreakdown: formattedCategory,
        summary: {
          total,
          resolved,
          inProgress,
          pending
        }
      }
    });

  } catch (error) {
    console.error('Get citizen analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
