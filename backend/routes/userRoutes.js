const express = require('express');
const router = express.Router();
const { getUserById, updateUser, getStaff, createUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.post('/', protect, authorize('Admin', 'HR'), createUser);
router.get('/staff', protect, getStaff);

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, upload.single('profileImage'), updateUser);

module.exports = router;
