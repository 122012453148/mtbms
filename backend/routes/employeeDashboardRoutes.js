const express = require('express');
const router = express.Router();
const { getEmployeeStats, getSalaryDetails } = require('../controllers/employeeDashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getEmployeeStats);
router.get('/salary', protect, getSalaryDetails);

module.exports = router;
