const { Task, User, Project, ProjectMember } = require('../models');
const { Op } = require('sequelize');

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assigneeId } = req.body;
    const { projectId } = req.params;

    // Verify assignee is a project member (if provided)
    if (assigneeId) {
      const isMember = await ProjectMember.findOne({
        where: { projectId, userId: assigneeId }
      });

      if (!isMember && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a project member'
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      projectId,
      assigneeId,
      creatorId: req.user.id
    });

    const taskWithDetails = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: taskWithDetails
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task'
    });
  }
};

// Get tasks for a project
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigneeId, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { projectId };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['priority', 'DESC'],
        ['dueDate', 'ASC'],
        ['createdAt', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task'
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const task = await Task.findByPk(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify assignee is a project member (if changing)
    if (assigneeId && assigneeId !== task.assigneeId) {
      const isMember = await ProjectMember.findOne({
        where: { projectId: task.projectId, userId: assigneeId }
      });

      if (!isMember && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a project member'
        });
      }
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;

    await task.save();

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task'
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.destroy();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task'
    });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByPk(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.status = status;
    await task.save();

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task status'
    });
  }
};

// Assign task to user
const assignTask = async (req, res) => {
  try {
    const { assigneeId } = req.body;
    const task = await Task.findByPk(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify assignee is a project member
    if (assigneeId) {
      const isMember = await ProjectMember.findOne({
        where: { projectId: task.projectId, userId: assigneeId }
      });

      if (!isMember && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a project member'
        });
      }
    }

    task.assigneeId = assigneeId;
    await task.save();

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] }
      ]
    });

    res.json({
      success: true,
      message: assigneeId ? 'Task assigned successfully' : 'Task unassigned successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning task'
    });
  }
};

// Get my tasks (across all projects)
const getMyTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { assigneeId: req.user.id };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['dueDate', 'ASC'],
        ['priority', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your tasks'
    });
  }
};

// Get overdue tasks
const getOverdueTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user's project IDs
    let projectIds = [];
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

    const tasks = await Task.findAll({
      where: {
        projectId: { [Op.in]: projectIds },
        dueDate: { [Op.lt]: today },
        status: { [Op.ne]: 'completed' }
      },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] }
      ],
      order: [
        ['dueDate', 'ASC'],
        ['priority', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue tasks'
    });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  getMyTasks,
  getOverdueTasks
};
