const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Customer = require('../models/Customer');

exports.getSalesStats = async (req, res) => {
    try {
        const totalLeads = await Lead.countDocuments();
        const activeDeals = await Deal.countDocuments({ status: { $nin: ['Closed Won', 'Closed Lost'] } });
        const convertedCustomers = await Lead.countDocuments({ status: 'Customer' });
        
        const deals = await Deal.find({ status: 'Closed Won' });
        const totalRevenue = deals.reduce((acc, deal) => acc + deal.value, 0);
        
        const pendingFollowups = 12; // Simulated constant for static UI parts

        res.json({
            totalLeads,
            activeDeals,
            convertedCustomers,
            totalRevenue,
            pendingFollowups
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPipelineData = async (req, res) => {
    try {
        const leads = await Lead.find().sort({ updatedAt: -1 });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
