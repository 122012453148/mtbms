require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');

const seedVendors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for vendor seeding...');

        const vendors = [
            {
                name: 'TATA Steel Ltd',
                contactPerson: 'Rahul Sharma',
                email: ' Rahul@tatasteel.com',
                phone: '9876543210',
                location: 'Jamshedpur',
                materialType: 'TATA',
                category: 'Steel Provider',
                rating: 5,
                defaultRate: 45000
            },
            {
                name: 'JSW Steel South',
                contactPerson: 'Vikram Singh',
                email: 'sales@jsw.in',
                phone: '9988776655',
                location: 'Bellary',
                materialType: 'JSW',
                category: 'Manufacturer',
                rating: 4,
                defaultRate: 42500
            },
            {
                name: 'SAIL Authority',
                contactPerson: 'Amit Gupta',
                email: 'info@sail.gov.in',
                phone: '8877665544',
                location: 'Bhilai',
                materialType: 'SAIL',
                category: 'Government Supplier',
                rating: 5,
                defaultRate: 41000
            }
        ];

        for (let v of vendors) {
            const exists = await Vendor.findOne({ name: v.name });
            if (!exists) {
                await Vendor.create(v);
                console.log(`Vendor ${v.name} created.`);
            } else {
                await Vendor.findOneAndUpdate({ name: v.name }, v);
                console.log(`Vendor ${v.name} updated.`);
            }
        }

        console.log('Vendors seeded successfully.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedVendors();
