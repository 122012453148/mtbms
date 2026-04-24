const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

exports.getHRDashboardStats = async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const presentToday = await Attendance.countDocuments({ date: { $gte: today }, status: 'Present' });
        const absentToday = await Attendance.countDocuments({ date: { $gte: today }, status: 'Absent' });
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        
        const payroll = await Payroll.find({});
        const totalPayroll = payroll.reduce((acc, p) => acc + p.totalPaid, 0);

        res.json({
            totalEmployees,
            presentToday,
            absentToday,
            pendingLeaves,
            totalPayroll
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... Add more HR crud operations as needed for the frontend components
