const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const SalaryBudget = require('../models/SalaryBudget');

exports.getHRDashboardStats = async (req, res) => {
    try {
        const totalEmployees = await User.countDocuments({ role: 'Employee' });
        const totalManagers = await User.countDocuments({ role: 'Manager' });
        const totalSales = await User.countDocuments({ role: 'Sales' });
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const presentToday = await Attendance.countDocuments({ date: { $gte: today }, status: 'Present' });
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        
        // Payroll Aggregation
        const payrollStats = await Payroll.aggregate([
            { $group: { _id: null, total: { $sum: '$totalPaid' } } }
        ]);

        // Budget for the current month
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();
        const budget = await SalaryBudget.findOne({ month: currentMonth, year: currentYear });

        res.json({
            totalEmployees,
            totalManagers,
            totalSales,
            presentToday,
            pendingLeaves,
            totalPayroll: payrollStats[0]?.total || 0,
            budget: budget || { totalAmount: 0, remainingAmount: 0 }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... Add more HR crud operations as needed for the frontend components
