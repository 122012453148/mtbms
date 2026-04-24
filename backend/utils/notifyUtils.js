/**
 * notifyUtils.js
 * Central notification dispatch utility.
 * Finds target users by role and creates a notification for each.
 */
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('./socket');

/**
 * Notify all users with a given role.
 * @param {string[]} roles   - e.g. ['Admin', 'Manager']
 * @param {string}   title   - Short heading
 * @param {string}   message - Full detail line
 * @param {string}   type    - Notification type enum value
 */
const notifyByRole = async (roles, title, message, type = 'system') => {
    try {
        const users = await User.find({ role: { $in: roles } }).select('_id role');
        if (!users.length) return;

        const io = getIO();

        const docs = users.map(u => ({
            userId: u._id,
            role: u.role,
            title,
            message,
            type,
            isRead: false
        }));

        const created = await Notification.insertMany(docs);

        // Push real-time to each connected socket room
        created.forEach(n => {
            io.to(n.userId.toString()).emit('newNotification', n);
        });
    } catch (err) {
        console.error('[NotifyUtil] Failed to dispatch notifications:', err.message);
    }
};

/**
 * Notify a single specific user by their userId.
 * @param {ObjectId|string} userId
 * @param {string}          title
 * @param {string}          message
 * @param {string}          type
 * @param {string}          role   - role label for the notification doc
 */
const notifyUser = async (userId, title, message, type = 'system', role = 'Employee') => {
    try {
        const io = getIO();
        const notification = await Notification.create({ userId, role, title, message, type });
        io.to(userId.toString()).emit('newNotification', notification);
    } catch (err) {
        console.error('[NotifyUtil] Failed to dispatch user notification:', err.message);
    }
};

module.exports = { notifyByRole, notifyUser };
