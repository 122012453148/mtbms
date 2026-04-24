require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Leave = require('./models/Leave');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for unified seeding...');

        await User.deleteMany();
        await Leave.deleteMany();
        
        const users = [
            { username: 'admin', email: 'admin@mtbms.com', password: 'admin123', role: 'Admin', firstLogin: false },
            { username: 'hr', email: 'hr@mtbms.com', password: 'hr123', role: 'HR', firstLogin: false },
            { username: 'manager', email: 'mgr@mtbms.com', password: 'manager123', role: 'Manager', firstLogin: false },
            { username: 'sales', email: 'sls@mtbms.com', password: 'sales123', role: 'Sales', firstLogin: false },
            { username: 'employee', email: 'emp@mtbms.com', password: 'emp123', role: 'Employee', firstLogin: false },
        ];

        for (let u of users) {
            await User.create(u);
        }

        console.log('System users seeded successfully.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedUsers();
