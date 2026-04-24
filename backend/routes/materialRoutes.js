const express = require('express');
const router = express.Router();
const { 
    getMaterials, 
    createMaterial, 
    updateMaterial, 
    deleteMaterial,
    addStock,
    getStockHistory 
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getMaterials)
    .post(protect, authorize('Admin'), createMaterial);

router.post('/add-stock', protect, authorize('Admin'), addStock);
router.get('/history/:id', protect, getStockHistory);

router.route('/:id')
    .put(protect, authorize('Admin', 'Manager'), updateMaterial)
    .delete(protect, authorize('Admin'), deleteMaterial);

module.exports = router;
