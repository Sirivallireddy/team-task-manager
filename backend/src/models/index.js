const sequelize = require('../config/sequelize');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const ProjectMember = require('./ProjectMember');

// User - Project (Owner relationship)
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// User - Task (Creator relationship)
User.hasMany(Task, { foreignKey: 'creatorId', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// User - Task (Assignee relationship)
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

// Project - Task
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User - Project (Many-to-Many through ProjectMember)
User.belongsToMany(Project, { 
  through: ProjectMember, 
  foreignKey: 'userId', 
  otherKey: 'projectId',
  as: 'projects'
});
Project.belongsToMany(User, { 
  through: ProjectMember, 
  foreignKey: 'projectId', 
  otherKey: 'userId',
  as: 'members'
});

// Direct associations for ProjectMember
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
User.hasMany(ProjectMember, { foreignKey: 'userId', as: 'projectMemberships' });
Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'projectMembers' });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  ProjectMember
};
