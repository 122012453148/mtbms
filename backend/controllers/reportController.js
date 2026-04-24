const Material = require('../models/Material');
const Attendance = require('../models/Attendance');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

exports.generateEnterpriseReport = async (req, res) => {
    try {
        const { type } = req.query;
        let data = {};

        switch (type) {
            case 'inventory':
                data = await Material.find();
                break;
            case 'finance':
                data = await Transaction.find();
                break;
            case 'operations':
                data = await Order.find().populate('customer');
                break;
            default:
                data = { message: 'Invalid report type' };
        }

        res.json({
            generatedAt: new Date(),
            reportType: type,
            data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
