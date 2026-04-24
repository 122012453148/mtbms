const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../utils/socket');
const { notifyByRole, notifyUser } = require('../utils/notifyUtils');

// @desc    Get all user notifications (by userId param)
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my notifications (uses auth token)
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark one notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification) {
            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark ALL notifications as read for logged-in user
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (notification) {
            res.json({ message: 'Notification removed' });
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Utility to create notifications internally (legacy support)
exports.createNotification = async (userId, title, message, type) => {
    try {
        const notification = await Notification.create({ userId, title, message, type });
        const io = getIO();
        io.to(userId.toString()).emit('newNotification', notification);
        return notification;
    } catch (error) {
        console.error('Notification creation failed', error);
    }
};
