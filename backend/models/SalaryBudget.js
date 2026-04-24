const mongoose = require('mongoose');

const salaryBudgetSchema = new mongoose.Schema({
    allocatedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // The HR user who receives the budget
    totalAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    month: { type: String, required: true }, // e.g., 'June'
    year: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Depleted', 'Closed', 'Allocated'], default: 'Active' },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin who allocated
}, { timestamps: true });

module.exports = mongoose.model('SalaryBudget', salaryBudgetSchema);
