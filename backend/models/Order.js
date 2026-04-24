const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    vendorName: String, // Denormalized for quick view
    material: {
        type: String,
        enum: ['TATA', 'JSW', 'SAIL', 'Vizag Steel', 'Other'],
        required: true
    },
    quantity: { type: Number, required: true }, // In Tons
    rate: { type: Number, required: true }, // Rate per Ton
    totalAmount: { type: Number, required: true },
    deliveryDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Auto calculate totalAmount before validation
orderSchema.pre('validate', function(next) {
    if (this.quantity && this.rate) {
        this.totalAmount = this.quantity * this.rate;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
