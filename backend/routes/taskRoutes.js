const express = require('express');
const router = express.Router();
const { 
    getAllTasks, 
    createTask, 
    updateTaskStatus, 
    getMyTasks,
    deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllTasks)
    .post(protect, createTask);

router.get('/my', protect, getMyTasks);

router.route('/:id')
    .put(protect, updateTaskStatus)
    .delete(protect, deleteTask);

module.exports = router;
