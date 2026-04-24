const Material = require('../models/Material');
const Employee = require('../models/Employee');
const Task = require('../models/Task');

exports.getManagerStats = async (req, res) => {
    try {
        const totalMaterials = await Material.countDocuments();
        const lowStockItems = await Material.countDocuments({ stock: { $lte: 10 } }); // Assuming 10 is low
        const activeEmployees = await Employee.countDocuments();
        
        const tasksPending = await Task.countDocuments({ status: 'Pending' });
        const tasksCompleted = await Task.countDocuments({ status: 'Completed' });

        res.json({
            totalMaterials,
            lowStockItems,
            activeEmployees,
            tasksPending,
            tasksCompleted
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getManagerMaterials = async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getManagerTeam = async (req, res) => {
    try {
        const team = await Employee.find().sort({ name: 1 });
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
