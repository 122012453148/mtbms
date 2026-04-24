const Payroll = require('../models/Payroll');
const User = require('../models/User');

// @desc    Generate payroll for an employee
// @route   POST /api/payroll/create
exports.createPayroll = async (req, res) => {
    try {
        const { userId, month, year, baseSalary, bonus, deductions } = req.body;
        
        const netSalary = Number(baseSalary) + Number(bonus) - Number(deductions);

        const payroll = await Payroll.create({
            userId,
            month,
            year,
            baseSalary,
            bonus,
            deductions,
            netSalary,
            status: 'pending'
        });

        res.status(201).json(payroll);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all payroll (HR)
// @route   GET /api/payroll
exports.getAllPayroll = async (req, res) => {
    try {
        const payrolls = await Payroll.find({})
            .populate('userId', 'name email role employeeId')
            .sort({ year: -1, month: -1 });
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark payroll as paid
// @route   PUT /api/payroll/pay/:id
exports.paySalary = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (payroll) {
            payroll.status = 'paid';
            payroll.paidAt = new Date();
            payroll.transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            await payroll.save();
            res.json(payroll);
        } else {
            res.status(404).json({ message: 'Payroll record not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get my payroll (Employee)
// @route   GET /api/payroll/my
exports.getMyPayroll = async (req, res) => {
    try {
        const payrolls = await Payroll.find({ userId: req.user._id })
            .sort({ year: -1, month: -1 });
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
