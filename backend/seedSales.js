require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Deal = require('./models/Deal');
const Customer = require('./models/Customer');

const seedSales = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for Sales Seeding...');

        // Clear existing leads/deals/customers
        await Lead.deleteMany();
        await Deal.deleteMany();
        await Customer.deleteMany();

        // Find the sales user
        const salesUser = await User.findOne({ role: 'Sales' });
        if (!salesUser) {
            console.error('No sales user found. Run seed.js first.');
            process.exit(1);
        }

        // Create a customer
        const customer = await Customer.create({
            customerName: 'Future Systems Inc',
            contact: {
                email: 'info@futuresys.com',
                phone: '9876543212',
                address: 'Tech Park, Bangalore'
            },
            leadStatus: 'Customer',
            assignedTo: salesUser._id
        });
        console.log('Created customer.');

        // Create some leads
        const leads = [
            { name: 'Tech Corp', contact: '9876543210', source: 'Website', status: 'Lead', assignedTo: salesUser._id },
            { name: 'Global Logistics', contact: '9876543211', source: 'Referral', status: 'Prospect', assignedTo: salesUser._id },
            { name: 'Future Systems', contact: '9876543212', source: 'LinkedIn', status: 'Customer', assignedTo: salesUser._id },
        ];

        const createdLeads = await Lead.insertMany(leads);
        console.log(`Seeded ${createdLeads.length} leads.`);

        // Create some deals
        const deals = [
            { name: 'ERP Implementation', value: 25000, status: 'Negotiation', customer: customer._id },
            { name: 'Annual Maintenance', value: 5000, status: 'Closed Won', customer: customer._id },
        ];

        await Deal.insertMany(deals);
        console.log('Seeded deals.');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedSales();
