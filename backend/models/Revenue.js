const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    companyName: { type: String, required: true },
    projectName: { type: String, required: true },
    material: { type: String, default: 'Steel' },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'ton' },
    rate: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Revenue', revenueSchema);
