const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getCustomers)
    .post(protect, authorize('Admin', 'Sales'), createCustomer);

router.put('/:id', protect, authorize('Admin', 'Sales'), async (req, res) => {
    try {
        const { Customer } = require('../models/Customer'); // Ensure we use the model correctly
        const customer = await require('../models/Customer').findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
