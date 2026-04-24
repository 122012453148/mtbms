const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Call', 'Email', 'Meeting', 'Chat'] },
    notes: String
});

const customerSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    contact: {
        email: String,
        phone: String,
        address: String
    },
    leadStatus: {
        type: String,
        enum: ['Lead', 'Prospect', 'Qualified', 'Customer', 'Lost'],
        default: 'Lead'
    },
    notes: String,
    interactions: [interactionSchema],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
