const Order = require('../models/Order');
const Material = require('../models/Material');
const StockHistory = require('../models/StockHistory');
const { getIO } = require('../utils/socket');

// @desc    Get all Purchase Orders
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('vendor', 'name location materialType')
            .populate('createdBy', 'name username')
            .populate('approvedBy', 'name username')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new Purchase Order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const { vendor, material, quantity, rate, deliveryDate } = req.body;
        
        const order = await Order.create({
            vendor,
            material,
            quantity,
            rate,
            deliveryDate,
            createdBy: req.user._id,
            status: 'Pending'
        });

        const io = getIO();
        io.emit('orderCreated', order);

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Approve Purchase Order (Admin Only)
// @route   PUT /api/orders/approve/:id
exports.approveOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = 'Approved';
        order.approvedBy = req.user._id;
        await order.save();

        const io = getIO();
        io.emit('orderUpdated', order);

        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Mark as Delivered & Update Stock
// @route   PUT /api/orders/deliver/:id
exports.deliverOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('vendor');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'Approved') return res.status(400).json({ message: 'Only approved orders can be delivered' });

        // Update Inventory
        // Find material by name (enum matching)
        let materialItem = await Material.findOne({ name: new RegExp(`^${order.material}$`, 'i') });
        
        if (!materialItem) {
            // Auto-initialize if it doesn't exist? Or throw error. 
            // Better to match existing materials.
            return res.status(404).json({ message: `Material ${order.material} not found in inventory. Please initialize it first.` });
        }

        // Add quantity to stock
        materialItem.quantity += Number(order.quantity);
        await materialItem.save();

        // Log Stock History
        await StockHistory.create({
            materialId: materialItem._id,
            type: 'ADD', // Replenishment from PO
            quantity: order.quantity,
            performedBy: req.user._id,
            role: req.user.role,
            supplier: order.vendor?.name,
            purchaseDate: new Date()
        });

        // Update Order Status
        order.status = 'Delivered';
        await order.save();

        const io = getIO();
        io.emit('orderUpdated', order);
        io.emit('materialUpdated', materialItem);

        res.json({ order, materialItem });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get Financial Summary (Monthly Spending)
// @route   GET /api/orders/summary
exports.getPurchaseSummary = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        const summary = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, totalSpent: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        res.json(summary[0] || { totalSpent: 0, count: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
