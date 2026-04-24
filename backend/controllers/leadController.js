const Lead = require('../models/Lead');
const Acquisition = require('../models/Acquisition');
const socketUtils = require('../utils/socket');
const { notifyByRole } = require('../utils/notifyUtils');

// @desc    Create new lead
// @route   POST /api/leads
exports.createLead = async (req, res, next) => {
    try {
        const lead = await Lead.create(req.body);
        const io = socketUtils.getIO();
        io.emit('leadCreated', lead);

        // TRIGGER: Sales creates a lead → notify Manager
        const salesName = req.user?.name || req.user?.username || 'Sales';
        await notifyByRole(
            ['Manager'],
            '🎯 New Sales Lead Created',
            `${salesName} has added a new lead: "${lead.companyName || lead.contactPerson || 'Unknown'}" (${lead.steelBrand || ''}, Req: ${lead.requirement || 0} units). Review in Pipeline.`,
            'customer'
        );

        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all leads
// @route   GET /api/leads
exports.getLeads = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        const leads = await Lead.find(filter).populate('assignedTo', 'name username role');
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res, next) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('assignedTo', 'name username role');
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        const io = socketUtils.getIO();
        io.emit('leadUpdated', lead);
        
        res.json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res, next) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        const io = socketUtils.getIO();
        io.emit('leadDeleted', req.params.id);
        
        res.json({ message: 'Lead removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit Lead to Acquisition Board
// @route   PUT /api/leads/send-to-acquisition/:id
exports.submitToAcquisition = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        // Robust data extraction with commercial fallbacks
        const acquisitionPayload = {
            customerName: lead.contactPerson || lead.companyName || 'Unknown Customer',
            companyName: lead.companyName || 'Unknown Company',
            projectName: lead.projectName || 'Project-X deployment',
            material: lead.steelBrand || 'Steel',
            quantity: Number(lead.requirement) || 1, 
            ratePerTon: Number(req.body.ratePerTon) || (lead.requirement > 0 ? (lead.budget / lead.requirement) : 50000),
            deliveryDate: lead.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            address: lead.deliveryAddress || 'On-site deployment address pending',
            createdBy: req.user._id,
            timeline: [{
                status: 'NEW',
                note: 'GRADUATION: Deal successfully migrated from Sales CRM to Logistics Acquisition.',
                user: req.user._id
            }]
        };

        const acquisition = await Acquisition.create(acquisitionPayload);

        // Update Lead status
        lead.status = 'SUBMITTED'; 
        lead.notes = (lead.notes || '') + '\n[DEPLOYMENT] Lead graduated to Acquisition Board.';
        await lead.save();

        const io = socketUtils.getIO();
        io.emit('leadUpdated', lead);
        io.emit('acquisitionDealCreated', acquisition);

        // TRIGGER: Sales submits lead to acquisition → notify Manager
        const salesName = req.user?.name || req.user?.username || 'Sales';
        await notifyByRole(
            ['Manager'],
            '📦 Lead Submitted to Acquisition',
            `${salesName} has elevated lead "${acquisition.customerName}" to the Acquisition Board for "${acquisition.material}" (${acquisition.quantity} units). Manager verification required.`,
            'deal'
        );

        res.json({ lead, acquisition });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
