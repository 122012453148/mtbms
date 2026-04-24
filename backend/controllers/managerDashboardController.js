const Material = require('../models/Material');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const User = require('../models/User');
const Revenue = require('../models/Revenue');

exports.getManagerStats = async (req, res) => {
    try {
        const managerId = req.user._id;
        
        const totalTasks = await Task.countDocuments({ assignedTo: managerId });
        const pendingTasks = await Task.countDocuments({ assignedTo: managerId, status: { $ne: 'Completed' } });
        const completedTasks = await Task.countDocuments({ assignedTo: managerId, status: 'Completed' });
        
        // Revenue Aggregation for this manager
        const revenueStats = await Revenue.aggregate([
            { $match: { managerId } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Monthly Trend
        const monthlyRevenue = await Revenue.aggregate([
            { $match: { managerId } },
            {
                $group: {
                    _id: { month: { $month: '$date' }, year: { $year: '$date' } },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 }
        ]);

        // Project breakdown
        const projectBreakdown = await Revenue.aggregate([
            { $match: { managerId } },
            { $group: { _id: '$projectName', total: { $sum: '$totalAmount' } } },
            { $sort: { total: -1 } },
            { $limit: 5 }
        ]);

        const teamCount = await User.countDocuments({ managerId });

        res.json({
            totalTasks,
            pendingTasks,
            completedTasks,
            totalRevenue: revenueStats[0]?.total || 0,
            monthlyRevenue: monthlyRevenue.map(m => ({
                month: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
                revenue: m.revenue
            })),
            projectBreakdown,
            teamCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getManagerMaterials = async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getManagerTeam = async (req, res) => {
    try {
        const team = await Employee.find().sort({ name: 1 });
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
