const Material = require('../models/Material');
const StockHistory = require('../models/StockHistory');
const { createNotification } = require('./notificationController');
const User = require('../models/User');
const { getIO } = require('../utils/socket');
const { notifyByRole } = require('../utils/notifyUtils');

// Low stock threshold check helper
const checkAndNotifyLowStock = async (material) => {
    if (material.status === 'LOW STOCK' || material.status === 'CRITICAL' || material.status === 'OUT OF STOCK') {
        const statusLabel = material.status === 'OUT OF STOCK' 
            ? '🚨 OUT OF STOCK' 
            : material.status === 'CRITICAL' 
            ? '⚠️ CRITICAL STOCK' 
            : '📉 Low Stock Alert';

        await notifyByRole(
            ['Admin', 'Manager'],
            `${statusLabel}: ${material.name}`,
            `Material "${material.name}" (${material.category}) is now at ${material.quantity} units — status: ${material.status}. Please reorder or update inventory.`,
            'stock'
        );
    }
};

// @desc    Get all materials
// @route   GET /api/materials
exports.getMaterials = async (req, res) => {
    try {
        const materials = await Material.find({}).sort('-updatedAt');
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a material (Initialize Resource)
// @route   POST /api/materials
exports.createMaterial = async (req, res) => {
    try {
        const qrData = `SMTBMS-MAT-${Date.now()}`;
        const material = await Material.create({
            ...req.body,
            qrCode: qrData
        });
        
        // Log history for initialization
        if (material.quantity > 0) {
            await StockHistory.create({
                materialId: material._id,
                type: 'ADD',
                quantity: material.quantity,
                performedBy: req.user._id,
                role: req.user.role,
                supplier: material.supplier,
                purchaseDate: new Date()
            });
        }

        const io = getIO();
        io.emit('materialCreated', material);

        // Check if new material starts at low/critical/out-of-stock
        await checkAndNotifyLowStock(material);

        res.status(201).json(material);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add Stock to existing material
// @route   POST /api/materials/add-stock
exports.addStock = async (req, res) => {
    try {
        const { materialId, addedQuantity, supplier, purchaseDate } = req.body;
        const material = await Material.findById(materialId);
        
        if (!material) return res.status(404).json({ message: 'Material not found' });

        material.quantity += Number(addedQuantity);
        if (supplier) material.supplier = supplier;
        
        const updatedMaterial = await material.save();

        // Create transaction history
        const history = await StockHistory.create({
            materialId,
            type: 'ADD',
            quantity: addedQuantity,
            performedBy: req.user._id,
            role: req.user.role,
            supplier,
            purchaseDate
        });

        const io = getIO();
        io.emit('materialUpdated', updatedMaterial);
        io.emit('stockHistoryCreated', history);

        // TRIGGER: Low stock check after update
        await checkAndNotifyLowStock(updatedMaterial);

        res.json({ material: updatedMaterial, history });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get Stock History for a material
// @route   GET /api/materials/history/:id
exports.getStockHistory = async (req, res) => {
    try {
        const history = await StockHistory.find({ materialId: req.params.id })
            .populate('performedBy', 'name username')
            .sort('-date');
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update material settings
// @route   PUT /api/materials/:id
exports.updateMaterial = async (req, res) => {
    try {
        const material = await Material.findByIdAndUpdate(req.params.id, req.body, { 
            new: true,
            runValidators: true 
        });
        
        if (!material) return res.status(404).json({ message: 'Material not found' });

        const io = getIO();
        io.emit('materialUpdated', material);

        // TRIGGER: Check low stock after any update
        await checkAndNotifyLowStock(material);

        res.json(material);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Common helper for sale stock deduction (to be used by revenue/sale controller)
exports.deductStockForSale = async (materialName, soldQuantity, userId, userRole) => {
    try {
        const material = await Material.findOne({ name: new RegExp(`^${materialName}$`, 'i') });
        if (!material) throw new Error(`Material ${materialName} not found in inventory.`);
        
        if (material.quantity < soldQuantity) {
            throw new Error(`Insufficient stock. Available: ${material.quantity}, Requested: ${soldQuantity}`);
        }

        material.quantity -= Number(soldQuantity);
        await material.save();

        await StockHistory.create({
            materialId: material._id,
            type: 'SALE',
            quantity: -soldQuantity,
            performedBy: userId,
            role: userRole,
            date: new Date()
        });

        const io = getIO();
        io.emit('materialUpdated', material);

        // TRIGGER: Check low stock after sale deduction
        await checkAndNotifyLowStock(material);
        
        return material;
    } catch (error) {
        throw error;
    }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
exports.deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findByIdAndDelete(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });
        
        const io = getIO();
        io.emit('materialDeleted', req.params.id);
        res.json({ message: 'Material removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
