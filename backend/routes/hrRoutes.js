const express = require('express');
const router = express.Router();
const { loginHR, changePassword } = require('../controllers/hrAuthController');
const { getHRDashboardStats } = require('../controllers/hrDashboardController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginHR);
router.post('/change-password', protect, changePassword);
router.get('/stats', protect, getHRDashboardStats);

module.exports = router;
