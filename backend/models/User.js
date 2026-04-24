const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    employeeId: { type: String, unique: true, sparse: true },
    department: { type: String, default: 'General' },
    phone: { type: String },
    joiningDate: { type: Date, default: Date.now },
    location: { type: String },
    manager: { type: String },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    profileImage: { type: String },
    firstLogin: { type: Boolean, default: true },
    role: {
        type: String,
        enum: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'],
        default: 'Employee'
    }
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
