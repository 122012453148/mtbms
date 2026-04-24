const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer'); // Keep multer separate

router.post('/', protect, upload.array('images', 5), auditController.createAudit);
router.get('/', protect, auditController.getAudits);
router.get('/manager', protect, auditController.getManagerAudits);
router.get('/:id', protect, auditController.getAuditById);
router.put('/approve/:id', protect, auditController.approveAudit);
router.put('/reject/:id', protect, auditController.rejectAudit);
router.put('/:id', protect, upload.array('images', 5), auditController.updateAudit);

module.exports = router;
