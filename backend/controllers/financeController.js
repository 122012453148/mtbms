const Transaction = require('../models/Transaction');
const { getIO } = require('../utils/socket');

exports.getFinancialStats = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        
        const totalIncome = transactions
            .filter(t => t.type === 'Income')
            .reduce((acc, t) => acc + t.amount, 0);
            
        const totalExpense = transactions
            .filter(t => t.type === 'Expense')
            .reduce((acc, t) => acc + t.amount, 0);
            
        const netProfit = totalIncome - totalExpense;

        res.json({
            totalIncome,
            totalExpense,
            netProfit,
            transactionHistory: transactions.slice(0, 50)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.create(req.body);
        
        const io = getIO();
        io.emit('transactionAdded', transaction);

        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
