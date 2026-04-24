const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Customer = require('../models/Customer');

exports.getSalesStats = async (req, res) => {
    try {
        const salesId = req.user._id;
        const match = { assignedTo: salesId };

        const totalLeads = await Lead.countDocuments(match);
        const activeLeads = await Lead.countDocuments({ ...match, status: { $in: ['lead', 'prospect', 'qualified'] } });
        const convertedCustomers = await Lead.countDocuments({ ...match, status: 'customer' });
        
        // Revenue Aggregation from leads (budget of converted customers)
        const revenueStats = await Lead.aggregate([
            { $match: { ...match, status: 'customer' } },
            { $group: { _id: null, total: { $sum: '$budget' } } }
        ]);

        // Pipeline Status Distribution
        const pipelineDistribution = await Lead.aggregate([
            { $match: match },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Monthly Lead Trend
        const monthlyLeads = await Lead.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 }
        ]);

        res.json({
            totalLeads,
            activeLeads,
            convertedCustomers,
            totalRevenue: revenueStats[0]?.total || 0,
            pipelineDistribution,
            monthlyLeads: monthlyLeads.map(m => ({
                month: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
                count: m.count
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPipelineData = async (req, res) => {
    try {
        const leads = await Lead.find({ assignedTo: req.user._id }).sort({ updatedAt: -1 });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
