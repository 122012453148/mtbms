const express = require('express');
const router = express.Router();
const { generateEnterpriseReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/generate', protect, generateEnterpriseReport);

module.exports = router;
