const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, updateAttendance } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getEmployees)
    .post(protect, authorize('Admin', 'HR'), createEmployee);

router.post('/attendance', protect, authorize('Admin', 'HR', 'Manager'), updateAttendance);

module.exports = router;
