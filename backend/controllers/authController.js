const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token (Unified Login)
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Find user by username or email or name (for backward compatibility)
        const user = await User.findOne({ 
            $or: [{ username: username }, { email: username }, { name: username }] 
        });
        
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                role: user.role, 
                firstLogin: user.firstLogin,
                profileImage: user.profileImage,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Change password with verification
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify old password if firstLogin is false
        if (!user.firstLogin) {
            const isMatch = await user.matchPassword(oldPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Old password incorrect' });
            }
        }

        user.password = newPassword;
        user.firstLogin = false;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile info and image
// @route   PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.department = req.body.department || user.department;
            
            if (req.file) {
                user.profileImage = req.file.path; // Cloudinary URL
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                department: updatedUser.department,
                profileImage: updatedUser.profileImage,
                firstLogin: updatedUser.firstLogin
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
