const express = require('express');
const router = express.Router();
const { getFinancialStats, addTransaction } = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getFinancialStats);
router.post('/transaction', protect, addTransaction);

module.exports = router;
