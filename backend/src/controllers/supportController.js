import supportModel from '../models/supportModel.js';
import transporter from "../config/nodemailer.js";
export const submitSupportMessage = async (req, res) => {
  try {
    const { subject, category, message } = req.body;
    const citizen = req.user; // Has _id, name, email from verifyToken
    
    // Save to database
    const support = await supportModel.create({
      subject,
      category,
      message,
      citizen: citizen._id,
      status: 'pending'
    });
    

    // Send email notification to admin
    const adminEmail = 'vklalith2007@gmail.com'
    

  const mailOptions = {
        to: 'duplicate20072007@gmail.com',
      subject: `New Support Message: ${subject}`,
      html: `
        <h2>New Support Message Received</h2>
        <p><strong>From:</strong> ${citizen.name} (${citizen.email})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <br>
        <p><em>Reply directly to ${citizen.email} to respond.</em></p>
      `
    };
    await transporter.sendMail(mailOptions);
    
    res.status(201).json({ 
      success: true, 
      message: 'Support message sent successfully. Admin will respond via email.',
      support 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
