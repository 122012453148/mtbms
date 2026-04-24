const express = require('express');
const router = express.Router();
const { getManagerStats, getManagerMaterials, getManagerTeam } = require('../controllers/managerDashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getManagerStats);
router.get('/materials', protect, getManagerMaterials);
router.get('/team', protect, getManagerTeam);

module.exports = router;
