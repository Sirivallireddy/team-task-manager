const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { isProjectMember } = require('../middleware/projectAuth');

// All routes require authentication
router.use(authenticate);

// Task validation
const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required')
];

// My tasks (across all projects)
router.get('/my-tasks', taskController.getMyTasks);

// Overdue tasks
router.get('/overdue', taskController.getOverdueTasks);

// Project-specific task routes
router.post('/project/:projectId', isProjectMember, taskValidation, taskController.createTask);
router.get('/project/:projectId', isProjectMember, taskController.getProjectTasks);

// Individual task routes
router.get('/:taskId', taskController.getTaskById);
router.put('/:taskId', taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);
router.patch('/:taskId/status', taskController.updateTaskStatus);
router.patch('/:taskId/assign', taskController.assignTask);

module.exports = router;
