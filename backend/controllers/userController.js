const User = require('../models/User');
const Employee = require('../models/Employee');

exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, department, role, username, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        // Create User
        const user = await User.create({
            name,
            email,
            phone,
            department,
            role,
            username,
            password, // Will be hashed by pre-save hook
            firstLogin: true
        });

        // Create corresponding Employee record
        await Employee.create({
            name,
            email,
            contact: phone,
            department,
            role,
            hireDate: new Date()
        });

        res.status(201).json({
            message: 'Employee created successfully',
            credentials: {
                username,
                password
            }
        });
    } catch (error) {
        console.error("CREATE USER ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Role-based restrictions
        const isAdmin = req.user.role === 'Admin';
        const isHR = req.user.role === 'HR';
        const isSelf = req.user._id.toString() === req.params.id;

        if (!isAdmin && !isHR && !isSelf) {
             return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        // Fields employees can update themselves
        const allowedFieldsForSelf = ['name', 'phone', 'email', 'profileImage'];
        
        const updates = req.body;

        for (const key in updates) {
            if (!isAdmin && !isHR) {
                // If the user updating is just the employee themselves, only allow certain fields
                if (!allowedFieldsForSelf.includes(key)) continue;
            }
            // Cannot change role unless Admin/HR
            if (key === 'role' && (!isAdmin && !isHR)) continue;

            // Only update fields that exist in the request body
            if (updates[key] !== undefined) {
                user[key] = updates[key];
            }
        }

        // Handle uploaded image if present
        if (req.file) {
            user.profileImage = req.file.path; // Multer/Cloudinary saves URL to path
        }

        const updatePayload = {};
        for (const k in user.toObject()) {
            if (k !== '_id' && k !== '__v' && k !== 'password') {
                updatePayload[k] = user[k];
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { $set: updatePayload }, 
            { new: true, runValidators: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        console.error("UPDATE USER ERROR:", error);
        res.status(500).json({ message: error.message || "Failed to update user profile" });
    }
};

exports.getStaff = async (req, res) => {
    try {
        const staff = await User.find({ 
            role: { $in: ['Employee', 'Manager', 'Sales', 'HR'] } 
        }).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
