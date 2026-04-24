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
            { username: 'admin', email: 'admin@smtbm.com', password: 'admin123', role: 'Admin', firstLogin: false },
            { username: 'hr', email: 'hr@smtbm.com', password: 'hr123', role: 'HR', firstLogin: false },
            { username: 'manager', email: 'mgr@smtbm.com', password: 'manager123', role: 'Manager', firstLogin: false },
            { username: 'sales', email: 'sls@smtbm.com', password: 'sales123', role: 'Sales', firstLogin: false },
            { username: 'employee', email: 'emp@smtbm.com', password: 'emp123', role: 'Employee', firstLogin: false },
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
