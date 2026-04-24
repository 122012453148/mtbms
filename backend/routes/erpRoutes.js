const express = require('express');
const router = express.Router();
const { getVendors, createVendor, getOrders, createOrder } = require('../controllers/erpController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/vendors')
    .get(protect, getVendors)
    .post(protect, authorize('Admin', 'Manager'), createVendor);

router.route('/orders')
    .get(protect, getOrders)
    .post(protect, authorize('Admin', 'Manager'), createOrder);

module.exports = router;
