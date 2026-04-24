const Leave = require('../models/Leave');
const { getIO } = require('../utils/socket');
const { notifyByRole, notifyUser } = require('../utils/notifyUtils');
const User = require('../models/User');

// @desc    Apply for leave
// @route   POST /api/leaves
exports.applyLeave = async (req, res) => {
    try {
        const leave = await Leave.create({
            ...req.body,
            userId: req.user._id,
            status: 'pending'
        });

        const io = getIO();
        io.emit('leaveCreated', leave);

        // TRIGGER: Employee submits leave → notify HR
        const employeeName = req.user.name || req.user.username || 'An employee';
        const dateRange = `${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()}`;
        await notifyByRole(
            ['HR'],
            '📅 New Leave Request',
            `${employeeName} has submitted a ${leave.type} leave request for ${dateRange}.`,
            'leave'
        );

        // TRIGGER: Employee submits leave → notify Manager (if mapped)
        if (req.user.managerId) {
            await notifyUser(
                req.user.managerId,
                '📅 Team Leave Request',
                `${employeeName} has applied for ${leave.type} leave (${dateRange}). Review required.`,
                'leave',
                'Manager'
            );
        }

        res.status(201).json(leave);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all leaves (Manager/HR/Admin)
// @route   GET /api/leaves/all
exports.getAllLeaves = async (req, res) => {
    console.log('Fetching all leaves. User:', req.user?._id, 'Role:', req.user?.role);
    try {
        const leaves = await Leave.find({})
            .populate('userId', 'name role email')
            .populate('reviewedBy', 'name role')
            .sort({ createdAt: -1 });
        return res.json(leaves);
    } catch (error) {
        console.error('SERVER LEAVE ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my
exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ userId: req.user._id })
            .populate('reviewedBy', 'name role')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id
exports.updateLeaveStatus = async (req, res) => {
    console.log('Updating leave status. ID:', req.params.id, 'By User:', req.user?._id, 'Status:', req.body.status);
    try {
        const leave = await Leave.findById(req.params.id);
        if (leave) {
            leave.status = req.body.status;
            leave.reviewedBy = req.user._id;
            leave.reviewedAt = new Date();
            const updatedLeave = await leave.save();
            res.json(updatedLeave);

            // Emit socket and notification in background (errors here won't block the response)
            try {
                const io = getIO();
                io.emit('leaveUpdated', updatedLeave);
                
                const applicant = await User.findById(leave.userId).select('role');
                await notifyUser(
                    leave.userId, 
                    'Leave Status Updated', 
                    `Your leave request has been ${updatedLeave.status}`, 
                    'leave',
                    applicant?.role || 'Employee'
                );
            } catch (err) {
                console.error('Post-update background error:', err);
            }
        } else {
            res.status(404).json({ message: 'Leave not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
