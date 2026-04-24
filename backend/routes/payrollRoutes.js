const express = require('express');
const router = express.Router();
const { 
    createPayroll, 
    getAllPayroll, 
    paySalary, 
    getMyPayroll 
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', protect, authorize('HR', 'Admin'), createPayroll);
router.get('/', protect, authorize('HR', 'Admin'), getAllPayroll);
router.put('/pay/:id', protect, authorize('HR', 'Admin'), paySalary);
router.get('/my', protect, getMyPayroll);

module.exports = router;
