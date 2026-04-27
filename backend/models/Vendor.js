const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactPerson: String,
    email: { type: String, required: true },
    phone: String,
    address: String,
    location: String, // City/Area
    brand: { 
        type: String, 
        default: 'Other'
    },
    materialType: { 
        type: String, 
        enum: ['Steel', 'Electronics', 'Construction'],
        default: 'Steel'
    },
    category: { type: String, default: 'General Provider' },
    status: { type: String, enum: ['Active', 'Blacklisted'], default: 'Active' },
    rating: { type: Number, default: 5 },
    defaultRate: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
