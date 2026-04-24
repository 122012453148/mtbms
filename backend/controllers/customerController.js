const Customer = require('../models/Customer');
const { notifyByRole } = require('../utils/notifyUtils');

exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({});
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const customer = new Customer(req.body);
        const createdCustomer = await customer.save();

        // TRIGGER: Sales sends customer → notify Manager
        const salesName = req.user?.name || req.user?.username || 'Sales';
        await notifyByRole(
            ['Manager'],
            '🧑‍💼 New Customer Submitted',
            `${salesName} has submitted a new customer: "${createdCustomer.name || createdCustomer.company || 'Unknown'}". Please review and approve.`,
            'customer'
        );

        res.status(201).json(createdCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
