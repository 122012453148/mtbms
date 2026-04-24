const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Company name is required']
    },
    contactPerson: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    source: {
        type: String,
        enum: ['Website', 'Referral', 'LinkedIn', 'Direct', 'Other'],
        default: 'Direct'
    },
    requirement: {
        type: Number, // Steel quantity in tons
        default: 0
    },
    budget: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['lead', 'prospect', 'qualified', 'customer', 'SUBMITTED', 'lost'],
        default: 'lead'
    },
    subStatus: {
        type: String,
        enum: ['Interested', 'Negotiation', 'Quotation Sent', 'Follow-up Pending'],
        default: 'Interested'
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    followUpDate: {
        type: Date
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    projectName: {
        type: String
    },
    steelBrand: {
        type: String, // e.g. TATA, JSW
        enum: ['TATA', 'JSW', 'SAIL', 'Vizag Steel', 'Other']
    },
    deliveryDate: {
        type: Date
    },
    deliveryAddress: {
        type: String
    },
    approvalStatus: {
        type: String,
        enum: ['none', 'pending', 'manager_review', 'admin_approved', 'rejected'],
        default: 'none'
    },
    managerReviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adminApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sentToManager: {
        type: Boolean,
        default: false
    },
    sentToAdmin: {
        type: Boolean,
        default: false
    },
    managerRemarks: {
        type: String
    },
    adminRemarks: {
        type: String
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
