const { Task, Project, User, ProjectMember } = require('../models');
const { Op } = require('sequelize');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

    // Project statistics
    const projectStats = await Project.findAll({
      where: { id: { [Op.in]: projectIds } },
      attributes: ['status'],
      raw: true
    });

    const projectsByStatus = {
      active: projectStats.filter(p => p.status === 'active').length,
      completed: projectStats.filter(p => p.status === 'completed').length,
      onHold: projectStats.filter(p => p.status === 'on-hold').length,
      cancelled: projectStats.filter(p => p.status === 'cancelled').length
    };

    // Task statistics
    const allTasks = await Task.findAll({
      where: { projectId: { [Op.in]: projectIds } },
      attributes: ['status', 'priority', 'dueDate', 'completedAt', 'assigneeId'],
      raw: true
    });

    const tasksByStatus = {
      todo: allTasks.filter(t => t.status === 'todo').length,
      inProgress: allTasks.filter(t => t.status === 'in-progress').length,
      review: allTasks.filter(t => t.status === 'review').length,
      completed: allTasks.filter(t => t.status === 'completed').length
    };

    const tasksByPriority = {
      low: allTasks.filter(t => t.priority === 'low').length,
      medium: allTasks.filter(t => t.priority === 'medium').length,
      high: allTasks.filter(t => t.priority === 'high').length,
      urgent: allTasks.filter(t => t.priority === 'urgent').length
    };

    // Overdue tasks
    const overdueTasks = allTasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < today && 
      t.status !== 'completed'
    ).length;

    // Tasks due this week
    const tasksDueThisWeek = allTasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) >= thisWeekStart && 
      new Date(t.dueDate) <= thisWeekEnd &&
      t.status !== 'completed'
    ).length;

    // Tasks completed this week
    const tasksCompletedThisWeek = allTasks.filter(t => 
      t.completedAt && 
      new Date(t.completedAt) >= thisWeekStart
    ).length;

    // My tasks (assigned to current user)
    const myTasks = allTasks.filter(t => t.assigneeId === req.user.id);
    const myTasksByStatus = {
      todo: myTasks.filter(t => t.status === 'todo').length,
      inProgress: myTasks.filter(t => t.status === 'in-progress').length,
      review: myTasks.filter(t => t.status === 'review').length,
      completed: myTasks.filter(t => t.status === 'completed').length
    };

    const myOverdueTasks = myTasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < today && 
      t.status !== 'completed'
    ).length;

    // Recent activity - get recent tasks
    const recentTasks = await Task.findAll({
      where: { projectId: { [Op.in]: projectIds } },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProjects: projectIds.length,
          totalTasks: allTasks.length,
          overdueTasks,
          tasksDueThisWeek,
          tasksCompletedThisWeek
        },
        projects: projectsByStatus,
        tasks: {
          byStatus: tasksByStatus,
          byPriority: tasksByPriority
        },
        myStats: {
          totalAssigned: myTasks.length,
          byStatus: myTasksByStatus,
          overdue: myOverdueTasks
        },
        recentActivity: recentTasks
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

module.exports = {
  getDashboardStats
};
