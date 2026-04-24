const express = require('express');
const router = express.Router();
const { 
    getVendors, 
    createVendor, 
    updateVendor, 
    deleteVendor 
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getVendors)
    .post(protect, authorize('Admin', 'Manager'), createVendor);

router.route('/:id')
    .put(protect, authorize('Admin', 'Manager'), updateVendor)
    .delete(protect, authorize('Admin'), deleteVendor);

module.exports = router;
