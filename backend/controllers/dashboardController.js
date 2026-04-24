const Material = require('../models/Material');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalMaterials = await Material.countDocuments();
        const lowStockItems = await Material.countDocuments({ status: 'Low Stock' });
        const employeeCount = await Employee.countDocuments();
        const customerCount = await Customer.countDocuments();
        
        const orders = await Order.find({});
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        
        // New stats
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const completedOrders = await Order.countDocuments({ status: 'Received' });
        const totalProfit = totalRevenue * 0.25; // Simulated profit for now

        res.json({
            totalMaterials,
            lowStockItems,
            employeeCount,
            customerCount,
            totalRevenue,
            pendingOrders,
            completedOrders,
            totalProfit
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
