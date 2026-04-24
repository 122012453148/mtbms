const Revenue = require('../models/Revenue');
const Material = require('../models/Material');
const socketUtils = require('../utils/socket');

// POST /api/revenue  — Manager adds a sale
const addRevenue = async (req, res) => {
    try {
        const { companyName, projectName, material = 'Steel', quantity, rate, date, notes, unit = 'ton' } = req.body;

        if (!companyName || !projectName || !quantity || !rate) {
            return res.status(400).json({ message: 'companyName, projectName, quantity and rate are required' });
        }

        const totalAmount = parseFloat(quantity) * parseFloat(rate);

        const revenue = await Revenue.create({
            managerId: req.user._id,
            companyName,
            projectName,
            material,
            quantity: parseFloat(quantity),
            unit,
            rate: parseFloat(rate),
            totalAmount,
            date: date ? new Date(date) : new Date(),
            notes
        });

        // Deduct stock using the material controller's high-precision engine
        const { deductStockForSale } = require('./materialController');
        try {
            await deductStockForSale(material, quantity, req.user._id, req.user.role);
        } catch (stockErr) {
            return res.status(400).json({ message: stockErr.message });
        }

        // Broadcast via Socket.io
        const io = socketUtils.getIO();
        if (io) io.emit('revenueAdded', revenue);

        const populated = await Revenue.findById(revenue._id).populate('managerId', 'name role');
        res.status(201).json(populated);
    } catch (err) {
        console.error('[Revenue] addRevenue error:', err);
        res.status(500).json({ message: err.message });
    }
};

// GET /api/revenue  — All records (Admin + Manager)
const getAllRevenue = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'Manager') filter.managerId = req.user._id;
        if (req.query.company) filter.companyName = { $regex: req.query.company, $options: 'i' };
        if (req.query.from || req.query.to) {
            filter.date = {};
            if (req.query.from) filter.date.$gte = new Date(req.query.from);
            if (req.query.to)   filter.date.$lte = new Date(req.query.to);
        }

        const records = await Revenue.find(filter)
            .populate('managerId', 'name role')
            .sort({ date: -1 });

        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/revenue/summary  — Aggregated analytics
const getRevenueSummary = async (req, res) => {
    try {
        const matchStage = {};
        if (req.user.role === 'Manager') matchStage.managerId = req.user._id;

        const [totalResult] = await Revenue.aggregate([
            { $match: matchStage },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, totalQty: { $sum: '$quantity' } } }
        ]);

        const companyWise = await Revenue.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$companyName',
                    totalRevenue: { $sum: '$totalAmount' },
                    totalQty: { $sum: '$quantity' },
                    deals: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        const monthly = await Revenue.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    qty: { $sum: '$quantity' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);

        // Find remaining steel stock
        const steelMat = await Material.findOne({ name: { $regex: /steel/i } });
        const steelStock = steelMat ? steelMat.quantity : 0;

        res.json({
            totalRevenue: totalResult?.total || 0,
            totalQtySold: totalResult?.totalQty || 0,
            steelStock,
            companyWise,
            monthly
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addRevenue, getAllRevenue, getRevenueSummary };
