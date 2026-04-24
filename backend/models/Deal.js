const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    status: { 
        type: String, 
        enum: ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'], 
        default: 'Discovery' 
    },
    closingDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
