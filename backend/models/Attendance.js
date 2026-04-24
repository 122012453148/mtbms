const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
    location: { type: String }, // Optional: for group work or field work
    note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
