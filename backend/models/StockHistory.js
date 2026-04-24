const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    type: { type: String, enum: ['ADD', 'SALE', 'ADJUST'], required: true },
    quantity: { type: Number, required: true }, // Positive for ADD, negative for SALE logic-wise
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String }, // Admin / Manager
    supplier: String,
    purchaseDate: Date,
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StockHistory', stockHistorySchema);
