const express = require('express');
const router = express.Router();
const { 
    checkIn, 
    checkOut, 
    getTodayAttendance, 
    getMyAttendance 
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/today', protect, authorize('HR', 'Admin', 'Manager'), getTodayAttendance);
router.get('/my', protect, getMyAttendance);

module.exports = router;
