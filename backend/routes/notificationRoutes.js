const express = require('express');
const router = express.Router();
const { 
    getNotifications, 
    getMyNotifications,
    markAsRead, 
    markAllRead,
    deleteNotification 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyNotifications);
router.put('/read-all', protect, markAllRead);
router.get('/:userId', protect, getNotifications);
router.put('/read/:id', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
