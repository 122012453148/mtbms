const Task = require('../models/Task');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { notifyUser, notifyByRole } = require('../utils/notifyUtils');

// @desc    Create a new task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, deadline } = req.body;
        const task = await Task.create({
            title,
            description,
            assignedTo,
            priority,
            deadline,
            createdBy: req.user._id
        });
        
        const populatedTask = await task.populate('assignedTo', 'name email role');

        // TRIGGER: Manager assigns task → notify Employee
        if (assignedTo) {
            const assignedUser = await User.findById(assignedTo).select('name role');
            await notifyUser(
                assignedTo,
                '📋 New Task Assigned',
                `You have been assigned a new task: "${title}" by ${req.user.name || req.user.username}. Priority: ${priority || 'Medium'}.`,
                'task',
                assignedUser?.role || 'Employee'
            );
        }

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tasks (for Admin/Manager)
// @route   GET /api/tasks
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'name role')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's assigned tasks
// @route   GET /api/tasks/my
exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id).populate('createdBy', 'name _id role');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const isAssigned = task.assignedTo.toString() === req.user._id.toString();
        const isManager = req.user.role === 'Manager' || req.user.role === 'Admin';

        if (!isAssigned && !isManager) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        task.status = status;
        await task.save();

        // TRIGGER: Employee completes task → notify Manager & Admin
        if (status === 'Completed') {
            const employeeName = req.user.name || req.user.username;
            await notifyByRole(
                ['Manager', 'Admin'],
                '✅ Task Completed',
                `"${task.title}" has been marked as completed by ${employeeName}.`,
                'task'
            );
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const isManager = req.user.role === 'Manager' || req.user.role === 'Admin';
        if (!isManager) {
            return res.status(403).json({ message: 'Not authorized to delete tasks' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
