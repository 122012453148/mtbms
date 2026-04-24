const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half-day'], default: 'Present' }
});

const leaveSchema = new mongoose.Schema({
    startDate: Date,
    endDate: Date,
    reason: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
});

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    contact: String,
    email: { type: String, unique: true },
    salary: { type: Number, default: 0 },
    attendance: [attendanceSchema],
    leaves: [leaveSchema],
    performanceRating: { type: Number, default: 0 },
    hireDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
