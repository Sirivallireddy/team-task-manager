const { ProjectMember } = require('../models');

// Check if user is a member of the project
const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    // Admins have access to all projects
    if (req.user.role === 'admin') {
      return next();
    }

    const membership = await ProjectMember.findOne({
      where: {
        projectId,
        userId: req.user.id
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    req.projectMembership = membership;
    next();
  } catch (error) {
    console.error('Project member check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check if user is project admin
const isProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    // System admins have full access
    if (req.user.role === 'admin') {
      return next();
    }

    const membership = await ProjectMember.findOne({
      where: {
        projectId,
        userId: req.user.id
      }
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Project admin privileges required.'
      });
    }

    req.projectMembership = membership;
    next();
  } catch (error) {
    console.error('Project admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  isProjectMember,
  isProjectAdmin
};
