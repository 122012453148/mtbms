const mongoose = require('mongoose');

const acquisitionSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    companyName: { type: String, required: true },
    projectName: { type: String, required: true },
    material: { type: String, default: 'Steel' },
    quantity: { type: Number, required: true }, // Tons
    ratePerTon: { type: Number, required: true },
    totalAmount: { type: Number },
    deliveryDate: { type: Date, required: true },
    address: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['NEW', 'MANAGER VERIFIED', 'ADMIN APPROVED', 'TASK ASSIGNED', 'IN PROGRESS', 'COMPLETED', 'REJECTED'],
        default: 'NEW'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    managerApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    auditStatus: { 
        type: String, 
        enum: ['NONE', 'PENDING', 'VERIFIED', 'FAILED'],
        default: 'NONE'
    },
    auditImages: [String],
    auditRemarks: String,
    timeline: [
        {
            status: String,
            timestamp: { type: Date, default: Date.now },
            note: String,
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ]
}, { timestamps: true });

// Auto calculate totalAmount before save
acquisitionSchema.pre('save', function() {
    if (this.quantity && this.ratePerTon) {
        this.totalAmount = this.quantity * this.ratePerTon;
    }
});

module.exports = mongoose.model('Acquisition', acquisitionSchema);
