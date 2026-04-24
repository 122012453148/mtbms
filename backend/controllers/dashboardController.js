const Material = require('../models/Material');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Revenue = require('../models/Revenue');
const SalaryBudget = require('../models/SalaryBudget');
const SupportTicket = require('../models/SupportTicket');
const ActivityLog = require('../models/ActivityLog');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalMaterials = await Material.countDocuments();
        const lowStockItems = await Material.countDocuments({ status: 'Low Stock' });
        const employeeCount = await User.countDocuments({ role: { $ne: 'Admin' } });
        const customerCount = await Customer.countDocuments();
        const supportTickets = await SupportTicket.countDocuments({ status: { $ne: 'Closed' } });
        
        const recentActivity = await ActivityLog.find().sort({ createdAt: -1 }).limit(5);
        const revenueStats = await Revenue.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueStats[0]?.total || 0;

        // Monthly Revenue Aggregation
        const monthlySales = await Revenue.aggregate([
            {
                $group: {
                    _id: { month: { $month: '$date' }, year: { $year: '$date' } },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 }
        ]);

        // Budget Allocation
        const budgetStats = await SalaryBudget.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' }, remaining: { $sum: '$remainingAmount' } } }
        ]);

        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const completedOrders = await Order.countDocuments({ status: 'Received' });
        
        res.json({
            totalMaterials,
            lowStockItems,
            employeeCount,
            customerCount,
            totalRevenue,
            monthlySales: monthlySales.map(m => ({
                month: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
                revenue: m.revenue
            })),
            budget: {
                total: budgetStats[0]?.total || 0,
                remaining: budgetStats[0]?.remaining || 0
            },
            pendingOrders,
            completedOrders,
            supportTickets,
            recentActivity,
            totalProfit: totalRevenue * 0.25
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
