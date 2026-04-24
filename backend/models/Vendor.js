const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactPerson: String,
    email: { type: String, required: true },
    phone: String,
    address: String,
    location: String, // City/Area
    materialType: { 
        type: String, 
        enum: ['TATA', 'JSW', 'SAIL', 'Vizag Steel', 'Other'],
        default: 'Other'
    },
    category: { type: String, default: 'Steel Provider' },
    status: { type: String, enum: ['Active', 'Blacklisted'], default: 'Active' },
    rating: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
