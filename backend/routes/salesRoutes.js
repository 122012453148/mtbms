const express = require('express');
const router = express.Router();
const { getSalesStats, getPipelineData } = require('../controllers/salesDashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getSalesStats);
router.get('/pipeline', protect, getPipelineData);

module.exports = router;
