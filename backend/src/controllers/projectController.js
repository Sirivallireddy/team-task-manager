const { Project, User, ProjectMember, Task } = require('../models');
const { Op } = require('sequelize');

// Create a new project
const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      ownerId: req.user.id
    });

    // Add creator as project admin
    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id,
      role: 'admin'
    });

    const projectWithDetails = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: projectWithDetails
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project'
    });
  }
};

// Get all projects for current user
const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let projectIds = [];
    
    // If user is admin, get all projects; otherwise get only their projects
    if (req.user.role === 'admin') {
      const allProjects = await Project.findAll({ attributes: ['id'] });
      projectIds = allProjects.map(p => p.id);
    } else {
      const memberships = await ProjectMember.findAll({
        where: { userId: req.user.id },
        attributes: ['projectId']
      });
      projectIds = memberships.map(m => m.projectId);
    }

    const where = { id: { [Op.in]: projectIds } };
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows: projects } = await Project.findAndCountAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { 
          model: User, 
          as: 'members', 
          attributes: ['id', 'name', 'email'],
          through: { attributes: ['role'] }
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    // Get task counts for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await Task.findAll({
          where: { projectId: project.id },
          attributes: ['status'],
          raw: true
        });

        const stats = {
          total: taskStats.length,
          todo: taskStats.filter(t => t.status === 'todo').length,
          inProgress: taskStats.filter(t => t.status === 'in-progress').length,
          review: taskStats.filter(t => t.status === 'review').length,
          completed: taskStats.filter(t => t.status === 'completed').length
        };

        return {
          ...project.toJSON(),
          taskStats: stats
        };
      })
    );

    res.json({
      success: true,
      data: {
        projects: projectsWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { 
          model: User, 
          as: 'members', 
          attributes: ['id', 'name', 'email', 'avatar'],
          through: { attributes: ['role'] }
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get task statistics
    const taskStats = await Task.findAll({
      where: { projectId: project.id },
      attributes: ['status', 'priority', 'dueDate'],
      raw: true
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: taskStats.length,
      byStatus: {
        todo: taskStats.filter(t => t.status === 'todo').length,
        inProgress: taskStats.filter(t => t.status === 'in-progress').length,
        review: taskStats.filter(t => t.status === 'review').length,
        completed: taskStats.filter(t => t.status === 'completed').length
      },
      byPriority: {
        low: taskStats.filter(t => t.priority === 'low').length,
        medium: taskStats.filter(t => t.priority === 'medium').length,
        high: taskStats.filter(t => t.priority === 'high').length,
        urgent: taskStats.filter(t => t.priority === 'urgent').length
      },
      overdue: taskStats.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) < today && 
        t.status !== 'completed'
      ).length
    };

    res.json({
      success: true,
      data: {
        ...project.toJSON(),
        taskStats: stats
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project'
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    const project = await Project.findByPk(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;

    await project.save();

    const updatedProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project'
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete all related data
    await Task.destroy({ where: { projectId: project.id } });
    await ProjectMember.destroy({ where: { projectId: project.id } });
    await project.destroy();

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project'
    });
  }
};

// Add member to project
const addMember = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    const { projectId } = req.params;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already a member
    const existingMember = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    await ProjectMember.create({
      projectId,
      userId,
      role
    });

    const member = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'avatar']
    });

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: { ...member.toJSON(), role }
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding member'
    });
  }
};

// Remove member from project
const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findByPk(projectId);
    
    // Cannot remove owner
    if (project.ownerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in this project'
      });
    }

    // Unassign tasks from this user in this project
    await Task.update(
      { assigneeId: null },
      { where: { projectId, assigneeId: userId } }
    );

    await membership.destroy();

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member'
    });
  }
};

// Update member role
const updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    const project = await Project.findByPk(projectId);
    
    // Cannot change owner's role
    if (project.ownerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change project owner role'
      });
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in this project'
      });
    }

    membership.role = role;
    await membership.save();

    res.json({
      success: true,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating member role'
    });
  }
};

// Get project members
const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const members = await ProjectMember.findAll({
      where: { projectId },
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'name', 'email', 'avatar', 'role'] 
        }
      ]
    });

    res.json({
      success: true,
      data: members.map(m => ({
        ...m.user.toJSON(),
        projectRole: m.role
      }))
    });
  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project members'
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
  getProjectMembers
};
