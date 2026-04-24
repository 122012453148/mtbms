const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Task = require('../models/Task');

exports.getEmployeeStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Attendance stats
        const presentDays = await Attendance.countDocuments({ user: userId, status: 'Present' });
        const lateDays = await Attendance.countDocuments({ user: userId, status: 'Late' });
        
        // Leave stats
        const leavesTaken = await Leave.countDocuments({ user: userId, status: 'Approved' });
        
        // Task stats
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'Completed' });

        res.json({
            presentDays,
            lateDays,
            leavesTaken,
            tasksAssigned: totalTasks,
            tasksCompleted: completedTasks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSalaryDetails = async (req, res) => {
    // Simulated salary data for Employee role
    res.json({
        monthlySalary: 4500,
        currency: 'USD',
        status: 'Paid',
        lastPayment: '2026-04-01'
    });
};
