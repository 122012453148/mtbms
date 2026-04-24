const Audit = require('../models/Audit');
const cloudinary = require('../config/cloudinary');

exports.createAudit = async (req, res) => {
  try {
    const { storeName, location, branding, cleanliness, competitor, issue, remarks, status } = req.body;
    
    // Parse location if it's a string from FormData
    let parsedLocation = {};
    if (location && typeof location === 'string') {
        try {
            parsedLocation = JSON.parse(location);
        } catch (e) {
            console.error("Error parsing location JSON", e);
        }
    } else if (location) {
        parsedLocation = location;
    }

    let imageUrls = [];

    // Check for uploaded files using Multer
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Explicitly validate required fields for non-drafts or based on scheme
    // To ensure UI form handles logic correctly
    
    // For automatic issue tagging
    let hasIssue = (cleanliness === 'Poor' || branding === 'No' || issue === 'Yes') ? 'Yes' : 'No';

    const newAudit = new Audit({
      storeName,
      location: parsedLocation,
      branding,
      cleanliness,
      competitor,
      issue: hasIssue,
      remarks,
      images: imageUrls,
      status: status || 'draft',
      createdBy: req.user ? req.user.id : null // Assuming auth middleware sets req.user
    });

    const savedAudit = await newAudit.save();
    
    // Attempt real-time update using globally stored io
    if (req.app.get('io') && savedAudit.status === 'submitted') {
        req.app.get('io').emit('auditCreated', savedAudit);
    }

    res.status(201).json(savedAudit);

  } catch (error) {
    console.error("Error creating audit:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAudits = async (req, res) => {
  try {
    const audits = await Audit.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.status(200).json(audits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAuditById = async (req, res) => {
    try {
        const audit = await Audit.findById(req.params.id).populate('createdBy', 'name email');
        if(!audit) return res.status(404).json({ message: "Audit not found"});
        res.status(200).json(audit);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateAudit = async (req, res) => {
    try {
        const audit = await Audit.findById(req.params.id);
        if(!audit) return res.status(404).json({ message: 'Audit not found' });
        
        if(audit.status === 'submitted') {
             return res.status(400).json({ message: 'Cannot edit a submitted audit' });
        }

        const updatedData = { ...req.body };
        
        if (req.body.location && typeof req.body.location === 'string') {
             try {
                updatedData.location = JSON.parse(req.body.location);
             } catch(e) {}
        }
        
        // Auto issue tagging check on update as well
        if(updatedData.cleanliness || updatedData.branding || updatedData.issue) {
            updatedData.issue = (
                (updatedData.cleanliness && updatedData.cleanliness === 'Poor') || 
                (updatedData.branding && updatedData.branding === 'No') || 
                (updatedData.issue && updatedData.issue === 'Yes') ||
                 (!updatedData.cleanliness && audit.cleanliness === 'Poor') ||
                 (!updatedData.branding && audit.branding === 'No') ||
                 (!updatedData.issue && audit.issue === 'Yes')
                ) ? 'Yes' : 'No';
        }

        let imageUrls = [...audit.images];
        if (req.files && req.files.length > 0) {
           const newImages = req.files.map(file => `/uploads/${file.filename}`);
           imageUrls = [...imageUrls, ...newImages];
           updatedData.images = imageUrls;
        }

        const updatedAudit = await Audit.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        
        if (req.app.get('io') && updatedAudit.status === 'submitted') {
            req.app.get('io').emit('auditCreated', updatedAudit);
        }

        res.status(200).json(updatedAudit);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Manager Audit Review
exports.getManagerAudits = async (req, res) => {
    try {
        const audits = await Audit.find({ status: 'submitted' })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(audits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.approveAudit = async (req, res) => {
    try {
        const audit = await Audit.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        if (!audit) return res.status(404).json({ message: 'Audit not found' });
        
        if (req.app.get('io')) {
            req.app.get('io').emit('auditUpdated', audit);
        }
        
        res.status(200).json(audit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.rejectAudit = async (req, res) => {
    try {
        const audit = await Audit.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
        if (!audit) return res.status(404).json({ message: 'Audit not found' });
        
        if (req.app.get('io')) {
            req.app.get('io').emit('auditUpdated', audit);
        }

        res.status(200).json(audit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
