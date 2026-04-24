const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Check-in
// @route   POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const existing = await Attendance.findOne({
            userId: req.user._id,
            date: today
        });

        if (existing) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const attendance = await Attendance.create({
            userId: req.user._id,
            date: today,
            checkIn: new Date(),
            status: 'Present'
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Check-out
// @route   POST /api/attendance/checkout
exports.checkOut = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            userId: req.user._id,
            date: today
        });

        if (!attendance) {
            return res.status(404).json({ message: 'No check-in record found for today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        const checkOutTime = new Date();
        const checkInTime = new Date(attendance.checkIn);
        const durationInHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

        attendance.checkOut = checkOutTime;
        attendance.status = durationInHours < 5 ? 'Absent' : 'Present';
        
        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get today's attendance for all employees (HR)
// @route   GET /api/attendance/today
exports.getTodayAttendance = async (req, res) => {
    try {
        const dateStr = req.query.date || new Date().toISOString().split('T')[0];
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0);

        const attendances = await Attendance.find({ date: targetDate })
            .populate('userId', 'name role email employeeId');
            
        res.json(attendances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my
exports.getMyAttendance = async (req, res) => {
    try {
        const attendances = await Attendance.find({ userId: req.user._id })
            .sort({ date: -1 })
            .limit(30);
        res.json(attendances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
