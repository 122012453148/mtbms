const express = require('express');
const router = express.Router();
const { 
    createDeal, 
    getAllDeals, 
    updateStatus, 
    managerApprove, 
    adminApprove, 
    assignTask, 
    completeDeal 
} = require('../controllers/acquisitionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All acquisition routes require authentication

router.post('/create', authorize('Sales', 'Admin'), createDeal);
router.get('/all', getAllDeals);
router.put('/update-status/:id', authorize('Manager', 'Admin', 'Sales'), updateStatus);
router.put('/manager-approve/:id', authorize('Manager', 'Admin'), managerApprove);
router.put('/admin-approve/:id', authorize('Admin'), adminApprove);
router.put('/assign-task/:id', authorize('Manager', 'Admin'), assignTask);
router.put('/complete/:id', authorize('Employee', 'Manager', 'Admin'), completeDeal);

module.exports = router;
