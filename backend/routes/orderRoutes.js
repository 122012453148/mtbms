const express = require('express');
const router = express.Router();
const { 
    getOrders, 
    createOrder, 
    approveOrder, 
    deliverOrder, 
    getPurchaseSummary 
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getOrders)
    .post(protect, authorize('Admin', 'Manager'), createOrder);

router.get('/summary', protect, getPurchaseSummary);

router.put('/approve/:id', protect, authorize('Admin'), approveOrder);
router.put('/deliver/:id', protect, authorize('Admin', 'Manager'), deliverOrder);

module.exports = router;
