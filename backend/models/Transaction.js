const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Income', 'Expense'],
        required: true
    },
    category: {
        type: String,
        required: true // e.g., 'Material Sale', 'Payroll', 'Vendor Payment'
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: String,
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Link to Order, Payroll, etc.
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
