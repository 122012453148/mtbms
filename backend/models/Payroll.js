const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true }, // e.g., 'April'
    year: { type: Number, required: true },  // e.g., 2026
    baseSalary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt: { type: Date },
    transactionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
