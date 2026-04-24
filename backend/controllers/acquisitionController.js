const Acquisition = require('../models/Acquisition');
const socketUtils = require('../utils/socket');
const { notifyByRole, notifyUser } = require('../utils/notifyUtils');

// @desc    Create new acquisition deal
// @route   POST /api/acquisition/create
exports.createDeal = async (req, res) => {
    try {
        const deal = await Acquisition.create({
            ...req.body,
            createdBy: req.user._id,
            timeline: [{
                status: 'NEW',
                note: 'Deal initiated by Sales',
                user: req.user._id
            }]
        });
        
        const io = socketUtils.getIO();
        io.emit('acquisitionDealCreated', deal);

        // TRIGGER: Sales sends deal → notify Manager
        const salesName = req.user.name || req.user.username;
        await notifyByRole(
            ['Manager'],
            '📦 New Deal Submitted for Review',
            `${salesName} submitted a new acquisition deal for "${deal.customerName}" (${deal.material}, ${deal.quantity} units). Awaiting Manager verification.`,
            'deal'
        );
        
        res.status(201).json(deal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all deals
// @route   GET /api/acquisition/all
exports.getAllDeals = async (req, res) => {
    try {
        const deals = await Acquisition.find()
            .populate('createdBy', 'name username')
            .populate('managerApprovedBy', 'name username')
            .populate('adminApprovedBy', 'name username')
            .populate('assignedEmployee', 'name username')
            .sort('-createdAt');
        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update status (Drag & Drop)
// @route   PUT /api/acquisition/update-status/:id
exports.updateStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const deal = await Acquisition.findById(req.params.id);
        
        if (!deal) return res.status(404).json({ message: 'Deal not found' });
        
        deal.status = status;
        deal.timeline.push({
            status: status,
            note: note || `Status updated to ${status}`,
            user: req.user._id
        });
        
        await deal.save();
        const io = socketUtils.getIO();
        io.emit('acquisitionDealUpdated', deal);
        
        res.json(deal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Manager Approval
// @route   PUT /api/acquisition/manager-approve/:id
exports.managerApprove = async (req, res) => {
    try {
        const { status } = req.body; // 'MANAGER VERIFIED' or 'REJECTED'
        const deal = await Acquisition.findByIdAndUpdate(req.params.id, {
            status,
            managerApprovedBy: req.user._id,
            $push: {
                timeline: {
                    status,
                    note: status === 'REJECTED' ? 'Rejected by Manager' : 'Verified by Manager',
                    user: req.user._id
                }
            }
        }, { new: true });
        
        const io = socketUtils.getIO();
        io.emit('acquisitionDealUpdated', deal);

        // TRIGGER: Manager approves deal → notify Admin
        if (status !== 'REJECTED') {
            const managerName = req.user.name || req.user.username;
            await notifyByRole(
                ['Admin'],
                '✅ Deal Verified by Manager',
                `Manager ${managerName} has verified the deal for "${deal.customerName}". Admin authorization required to proceed.`,
                'approval'
            );
        }

        res.json(deal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Admin Approval
// @route   PUT /api/acquisition/admin-approve/:id
exports.adminApprove = async (req, res) => {
    try {
        const { status } = req.body; // 'ADMIN APPROVED' or 'REJECTED'
        const deal = await Acquisition.findByIdAndUpdate(req.params.id, {
            status,
            adminApprovedBy: req.user._id,
            $push: {
                timeline: {
                    status,
                    note: status === 'REJECTED' ? 'Rejected by Admin' : 'Authorized by Admin',
                    user: req.user._id
                }
            }
        }, { new: true });
        
        const io = socketUtils.getIO();
        io.emit('acquisitionDealUpdated', deal);

        // TRIGGER: Admin approves deal → notify Manager
        const adminName = req.user.name || req.user.username;
        const isApproved = status !== 'REJECTED';
        await notifyByRole(
            ['Manager'],
            isApproved ? '🚀 Deal Approved by Admin' : '❌ Deal Rejected by Admin',
            isApproved
                ? `Admin ${adminName} has authorized the deal for "${deal.customerName}". You may now proceed to assign field tasks.`
                : `Admin ${adminName} has rejected the deal for "${deal.customerName}". Please review and resubmit.`,
            'approval'
        );

        res.json(deal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Assign Task to Employee
// @route   PUT /api/acquisition/assign-task/:id
exports.assignTask = async (req, res) => {
    try {
        const { assignedEmployee } = req.body;
        const deal = await Acquisition.findByIdAndUpdate(req.params.id, {
            status: 'TASK ASSIGNED',
            assignedEmployee,
            $push: {
                timeline: {
                    status: 'TASK ASSIGNED',
                    note: 'Task assigned to field personnel',
                    user: req.user._id
                }
            }
        }, { new: true }).populate('assignedEmployee', 'name username role');
        
        const io = socketUtils.getIO();
        io.emit('acquisitionDealUpdated', deal);

        // TRIGGER: Manager assigns deal task → notify Employee
        if (assignedEmployee) {
            await notifyUser(
                assignedEmployee,
                '📋 Field Task Assigned to You',
                `You have been assigned the field delivery task for deal: "${deal.customerName}" (${deal.material}, ${deal.quantity} units). Please review details and proceed.`,
                'task',
                deal.assignedEmployee?.role || 'Employee'
            );
        }

        res.json(deal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Complete Deal (Audit Verification)
// @route   PUT /api/acquisition/complete/:id
exports.completeDeal = async (req, res) => {
    try {
        const { auditRemarks, auditStatus, auditImages } = req.body;
        const deal = await Acquisition.findById(req.params.id);
        
        if (!deal) return res.status(404).json({ message: 'Deal not found' });
        
        deal.status = auditStatus === 'VERIFIED' ? 'COMPLETED' : deal.status;
        deal.auditStatus = auditStatus;
        deal.auditRemarks = auditRemarks;
        if (auditImages) deal.auditImages = auditImages;
        
        deal.timeline.push({
            status: deal.status,
            note: auditStatus === 'VERIFIED' ? 'Audit verified and deal completed' : 'Audit submitted for review',
            user: req.user._id
        });
        
        await deal.save();
        const io = socketUtils.getIO();
        io.emit('acquisitionDealUpdated', deal);

        // TRIGGER: Employee submits audit/completes → notify Manager & Admin
        if (auditStatus === 'VERIFIED') {
            const employeeName = req.user.name || req.user.username;
            await notifyByRole(
                ['Manager', 'Admin'],
                '🏁 Deal Completed & Audit Verified',
                `${employeeName} has completed field delivery and audit for deal "${deal.customerName}". The deal is now marked as COMPLETED.`,
                'deal'
            );
        }

        res.json(deal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
