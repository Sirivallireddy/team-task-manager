const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 300]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'todo',
    validate: {
      isIn: [['todo', 'in-progress', 'review', 'completed']]
    }
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'medium',
    validate: {
      isIn: [['low', 'medium', 'high', 'urgent']]
    }
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assigneeId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  hooks: {
    beforeUpdate: async (task) => {
      if (task.changed('status') && task.status === 'completed') {
        task.completedAt = new Date();
      }
    }
  }
});

module.exports = Task;
