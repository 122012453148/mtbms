const express = require('express');
const router = express.Router();
const { 
    allocateBudget, 
    getHRBudget, 
    distributeSalary, 
    finalizeSalary, 
    getEmployeeSalaryHistory,
    getAllPayroll
} = require('../controllers/salaryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/allocate', protect, authorize('Admin'), allocateBudget);
router.get('/my-budget', protect, authorize('HR'), getHRBudget);
router.post('/distribute', protect, authorize('HR'), distributeSalary);
router.put('/finalize/:id', protect, authorize('HR'), finalizeSalary);
router.get('/my-history', protect, getEmployeeSalaryHistory);
router.get('/all', protect, authorize('Admin', 'HR'), getAllPayroll);

module.exports = router;
