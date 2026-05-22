const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all users (admin only for full list, members can see limited info)
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Admin only routes
router.put('/:id/role', isAdmin, userController.updateUserRole);
router.put('/:id/deactivate', isAdmin, userController.deactivateUser);
router.put('/:id/reactivate', isAdmin, userController.reactivateUser);

module.exports = router;
