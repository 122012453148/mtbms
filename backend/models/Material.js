const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Unified with prompt requirement
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    location: { type: String, required: true },
    supplier: { type: String },
    threshold: { type: Number, default: 50 },
    status: {
        type: String,
        enum: ['IN STOCK', 'LOW STOCK', 'CRITICAL', 'OUT OF STOCK'],
        default: 'IN STOCK'
    },
    qrCode: String
}, { timestamps: true });

// Auto status update logic based on quantity and threshold
materialSchema.pre('save', function() {
    if (this.quantity === 0) {
        this.status = 'OUT OF STOCK';
    } else if (this.quantity < 20) {
        this.status = 'CRITICAL';
    } else if (this.quantity < this.threshold) {
        this.status = 'LOW STOCK';
    } else {
        this.status = 'IN STOCK';
    }
});

module.exports = mongoose.model('Material', materialSchema);
