const express = require('express');
const router = express.Router();
const { loginUser, getUserProfile, changePassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinaryStorage');

router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/change-password', protect, changePassword);
router.put('/update-profile', protect, upload.single('image'), updateProfile);

module.exports = router;
