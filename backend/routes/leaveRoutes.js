const express = require('express');
const router = express.Router();
const { 
    applyLeave, 
    getAllLeaves, 
    getMyLeaves, 
    updateLeaveStatus 
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/leaves/apply
router.post('/apply', protect, authorize('Employee', 'Manager', 'Sales'), applyLeave);

// @route   GET /api/leaves/my
router.get('/my', protect, getMyLeaves);

// @route   GET /api/leaves/fetch-all
router.get('/all', protect, getAllLeaves);
router.get('/fetch-all', protect, getAllLeaves);

// @route   PUT /api/leaves/:id
router.put('/:id', protect, updateLeaveStatus);

// Alias / to /apply for backward compatibility if needed
router.post('/', protect, authorize('Employee', 'Manager', 'Sales'), applyLeave);

module.exports = router;
