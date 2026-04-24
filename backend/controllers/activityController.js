const ActivityLog = require('../models/ActivityLog');
const Material = require('../models/Material');
const Order = require('../models/Order');

// Get recent logs
exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(20);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a log entry (utility)
exports.logAction = async (action, details, adminId) => {
    try {
        await ActivityLog.create({ action, details, admin: adminId });
    } catch (error) {
        console.error('Logging Error:', error);
    }
};

// Simulated Report Generator
exports.getReportData = async (req, res) => {
    const { type } = req.query; // daily, weekly, monthly
    try {
        // Here you would normally aggregate data based on dates
        // For demonstration, returning summary data
        const materialSummary = await Material.aggregate([
            { $group: { _id: "$category", total: { $sum: "$quantity" } } }
        ]);
        
        const salesSummary = await Order.find({ status: 'Received' }).limit(30);

        res.json({
            type,
            materialSummary,
            salesSummary,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
