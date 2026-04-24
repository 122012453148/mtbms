const SalaryBudget = require('../models/SalaryBudget');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const { getIO } = require('../utils/socket');
const { notifyUser, notifyByRole } = require('../utils/notifyUtils');

// @desc    Admin allocates budget to HR
// @route   POST /api/salary/allocate
exports.allocateBudget = async (req, res) => {
    try {
        const { hrId, amount, month, year, notes } = req.body;

        const hrUser = await User.findById(hrId);
        if (!hrUser || hrUser.role !== 'HR') {
            return res.status(400).json({ message: 'Selected user must be an HR role' });
        }

        const budget = await SalaryBudget.create({
            allocatedTo: hrId,
            totalAmount: amount,
            remainingAmount: amount,
            month,
            year,
            notes,
            status: 'Allocated',
            createdBy: req.user._id
        });

        const io = getIO();
        io.emit('budgetAllocated', budget);

        // TRIGGER: HR receives budget → notify HR
        const adminName = req.user.name || req.user.username;
        await notifyUser(
            hrId,
            '💰 Salary Budget Allocated',
            `Admin ${adminName} has allocated ₹${Number(amount).toLocaleString()} for ${month}/${year} salary distribution. You may now process employee payroll.`,
            'salary',
            'HR'
        );

        res.status(201).json(budget);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get HR's active budget
// @route   GET /api/salary/my-budget
exports.getHRBudget = async (req, res) => {
    try {
        const budgets = await SalaryBudget.find({ 
            allocatedTo: req.user._id, 
            status: { $in: ['Active', 'Allocated'] } 
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    HR distributes salary to employee
// @route   POST /api/salary/distribute
exports.distributeSalary = async (req, res) => {
    try {
        const { employeeId, budgetId, baseSalary, bonus, deductions, month, year } = req.body;

        const budget = await SalaryBudget.findById(budgetId);
        if (!budget || (budget.status !== 'Active' && budget.status !== 'Allocated')) {
            return res.status(404).json({ message: 'Active or Allocated budget not found' });
        }

        const netSalary = Number(baseSalary) + Number(bonus) - Number(deductions);

        if (netSalary > budget.remainingAmount) {
            return res.status(400).json({ message: 'Insufficient budget remaining for this payout' });
        }

        const payroll = await Payroll.create({
            userId: employeeId,
            month,
            year,
            baseSalary,
            bonus,
            deductions,
            netSalary,
            status: 'pending'
        });

        // Deduct from HR budget
        budget.remainingAmount -= netSalary;
        if (budget.remainingAmount <= 0) budget.status = 'Depleted';
        await budget.save();

        const io = getIO();
        io.emit('salaryDistributed', { payroll, budget });

        // Notify employee their salary record has been created
        const hrName = req.user.name || req.user.username;
        const employeeUser = await User.findById(employeeId).select('role');
        await notifyUser(
            employeeId,
            '💵 Salary Slip Generated',
            `HR ${hrName} has processed your salary for ${month}/${year}. Net amount: ₹${netSalary.toLocaleString()}. Status: Pending payment.`,
            'salary',
            employeeUser?.role || 'Employee'
        );

        res.status(201).json({ payroll, budget });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    HR finalizes (pays) salary
// @route   PUT /api/salary/finalize/:id
exports.finalizeSalary = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });

        payroll.status = 'paid';
        payroll.paidAt = new Date();
        await payroll.save();

        const io = getIO();
        io.emit('salaryPaid', payroll);

        // Notify the employee their salary has been paid
        const hrName = req.user.name || req.user.username;
        const employeeUser = await User.findById(payroll.userId).select('role');
        await notifyUser(
            payroll.userId,
            '🎉 Salary Paid Successfully',
            `Your salary for ${payroll.month}/${payroll.year} (₹${payroll.netSalary?.toLocaleString()}) has been paid by HR ${hrName}.`,
            'salary',
            employeeUser?.role || 'Employee'
        );

        res.json(payroll);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get Employee's salary history
// @route   GET /api/salary/my-history
exports.getEmployeeSalaryHistory = async (req, res) => {
    try {
        const history = await Payroll.find({ userId: req.user._id }).sort('-createdAt');
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin/HR view all payroll (filtered)
// @route   GET /api/salary/all
exports.getAllPayroll = async (req, res) => {
    try {
        const payrolls = await Payroll.find().populate('userId', 'name role username').sort('-createdAt');
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
