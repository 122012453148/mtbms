const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { addRevenue, getAllRevenue, getRevenueSummary } = require('../controllers/revenueController');

// Summary (aggregated analytics) — Admin, Manager & HR
router.get('/summary', protect, authorize('Admin', 'Manager', 'HR'), getRevenueSummary);

// All records with optional filters — Admin, Manager & HR
router.get('/', protect, authorize('Admin', 'Manager', 'HR'), getAllRevenue);

// Add a new sale — Manager only
router.post('/', protect, authorize('Admin', 'Manager'), addRevenue);

module.exports = router;
