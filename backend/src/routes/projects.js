const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { isProjectMember, isProjectAdmin } = require('../middleware/projectAuth');

// All routes require authentication
router.use(authenticate);

// Project validation
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required')
];

// Project routes
router.post('/', projectValidation, projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:projectId', isProjectMember, projectController.getProjectById);
router.put('/:projectId', isProjectAdmin, projectController.updateProject);
router.delete('/:projectId', isProjectAdmin, projectController.deleteProject);

// Member management routes
router.get('/:projectId/members', isProjectMember, projectController.getProjectMembers);
router.post('/:projectId/members', isProjectAdmin, projectController.addMember);
router.delete('/:projectId/members/:userId', isProjectAdmin, projectController.removeMember);
router.put('/:projectId/members/:userId/role', isProjectAdmin, projectController.updateMemberRole);

module.exports = router;
