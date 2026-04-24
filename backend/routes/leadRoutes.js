const express = require('express');
const router = express.Router();
const { 
    createLead, 
    getLeads, 
    updateLead, 
    deleteLead,
    submitToAcquisition
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getLeads)
    .post(protect, authorize('Sales', 'Manager', 'Admin'), createLead);

router.put('/:id/send', protect, authorize('Sales'), updateLead); 
router.put('/:id/approve', protect, authorize('Manager', 'Admin'), updateLead); 

// New standardized endpoint requested by user
router.put('/send-to-acquisition/:id', protect, authorize('Sales', 'Admin', 'Manager'), submitToAcquisition);
// Keep existing for backward compatibility if needed, but primary is the one above
router.put('/:id/acquisition', protect, authorize('Sales', 'Admin', 'Manager'), submitToAcquisition);

router.route('/:id')
    .put(protect, authorize('Sales', 'Manager', 'Admin'), updateLead)
    .delete(protect, authorize('Sales', 'Manager', 'Admin'), deleteLead);

module.exports = router;
