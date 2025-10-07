const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');

// Contact form validation rules
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required (max 100 characters)'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required (max 200 characters)'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message is required (max 2000 characters)'),
];

// Submit contact form
const submitContact = async (req, res) => {
  try {
    console.log('Contact form submission received:', req.body);
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, email, subject, message } = req.body;

    // Save contact message to database
    const contactMessage = new Contact({
      name,
      email,
      subject,
      message,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    await contactMessage.save();

    // Try to send emails, but don't fail if email service is not configured
    try {
      // Create email transporter (configure with your email service)
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your preferred email service
        auth: {
          user: process.env.CONTACT_EMAIL || 'info@filmzone.rw',
          pass: process.env.CONTACT_EMAIL_PASSWORD || 'your-app-password',
        },
      });

    // Email content for admin
    const mailOptions = {
      from: process.env.CONTACT_EMAIL || 'info@filmzone.rw',
      to: process.env.ADMIN_EMAIL || 'admin@filmzone.rw',
      replyTo: email, // This allows admin to reply directly to user's email
      subject: `FilmZone Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E50914;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #E50914; text-decoration: none;">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div style="background: #E50914; color: white; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin: 0 0 10px 0;">Quick Reply Options:</h3>
            <p style="margin: 5px 0;"><a href="mailto:${email}?subject=Re: ${subject}" style="color: white; text-decoration: underline;">📧 Reply via Email</a></p>
            <p style="margin: 5px 0;"><a href="https://wa.me/250788123456?text=Re: ${subject} - ${name}" style="color: white; text-decoration: underline;">📱 Reply via WhatsApp</a></p>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            This message was sent from the FilmZone contact form. You can reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    };

      // Send email
      await transporter.sendMail(mailOptions);

      // Send auto-reply to user
      const autoReplyOptions = {
        from: process.env.CONTACT_EMAIL || 'info@filmzone.rw',
        to: email,
        subject: 'Thank you for contacting FilmZone - We\'ll get back to you soon!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #E50914 0%, #B81D13 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">FilmZone</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Your Ultimate Movie Experience</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
              <h2 style="color: #E50914; margin-top: 0;">Thank you for contacting us, ${name}!</h2>
              
              <p>We have received your message and our team will get back to you as soon as possible, typically within 24 hours.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #E50914; margin-top: 0;">Your Message Details:</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #E50914;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Need Immediate Help?</h3>
                <p>If you need urgent assistance, you can also reach us through:</p>
                <ul style="margin: 10px 0;">
                  <li><strong>WhatsApp:</strong> <a href="https://wa.me/250788123456" style="color: #25D366;">+250 788 123 456</a></li>
                  <li><strong>Phone:</strong> <a href="tel:+250788123456" style="color: #E50914;">+250 788 123 456</a></li>
                  <li><strong>Email:</strong> <a href="mailto:info@filmzone.rw" style="color: #E50914;">info@filmzone.rw</a></li>
                </ul>
              </div>
              
              <p>We appreciate your interest in FilmZone and look forward to assisting you!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://filmzone.rw" style="background: #E50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Visit FilmZone</a>
              </div>
            </div>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 10px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                This is an automated response. Please do not reply to this email directly.<br>
                To respond to your inquiry, our team will contact you at: <strong>${email}</strong>
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(autoReplyOptions);
      
      console.log('Emails sent successfully');
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue without failing - message was saved to database
    }

    res.json({
      message: 'Contact form submitted successfully',
      success: true,
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      message: 'Failed to submit contact form. Please try again later.',
      success: false,
    });
  }
};

// Get contact information
const getContactInfo = async (req, res) => {
  try {
    const contactInfo = {
      email: process.env.CONTACT_EMAIL || 'info@filmzone.rw',
      phone: process.env.CONTACT_PHONE || '+250 788 123 456',
      whatsapp: process.env.WHATSAPP_NUMBER || '+250 788 123 456',
      address: process.env.CONTACT_ADDRESS || 'Kigali, Rwanda',
      businessHours: process.env.BUSINESS_HOURS || 'Monday - Friday: 9:00 AM - 6:00 PM',
      socialMedia: {
        facebook: process.env.FACEBOOK_URL || 'https://facebook.com/filmzone',
        twitter: process.env.TWITTER_URL || 'https://twitter.com/filmzone',
        instagram: process.env.INSTAGRAM_URL || 'https://instagram.com/filmzone',
        whatsapp: process.env.WHATSAPP_URL || 'https://wa.me/250788123456',
      },
    };

    res.json({
      message: 'Contact information retrieved successfully',
      contactInfo,
    });
  } catch (error) {
    console.error('Get contact info error:', error);
    res.status(500).json({
      message: 'Failed to retrieve contact information',
    });
  }
};

// Get all contact messages (admin only)
const getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, search } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const contacts = await Contact.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);

    res.json({
      message: 'Contact messages retrieved successfully',
      contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalContacts: total,
        hasNext: skip + contacts.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ message: 'Server error retrieving contact messages' });
  }
};

// Get contact message by ID (admin only)
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findById(id).populate('assignedTo', 'name email');
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({
      message: 'Contact message retrieved successfully',
      contact
    });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving contact message' });
  }
};

// Update contact message (admin only)
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNotes, assignedTo } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    res.json({
      message: 'Contact message updated successfully',
      contact: updatedContact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Server error updating contact message' });
  }
};

// Mark contact as responded (admin only)
const markAsResponded = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    await contact.markAsResponded();

    res.json({
      message: 'Contact marked as responded successfully',
      contact
    });
  } catch (error) {
    console.error('Mark as responded error:', error);
    res.status(500).json({ message: 'Server error marking contact as responded' });
  }
};

// Get contact statistics (admin only)
const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.getContactStats();
    
    res.json({
      message: 'Contact statistics retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: 'Server error retrieving contact statistics' });
  }
};

module.exports = {
  submitContact,
  getContactInfo,
  getContactMessages,
  getContactById,
  updateContact,
  markAsResponded,
  getContactStats,
  contactValidation,
};
