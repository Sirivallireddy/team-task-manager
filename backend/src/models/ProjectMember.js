const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'member',
    validate: {
      isIn: [['admin', 'member']]
    }
  }
}, {
  tableName: 'project_members',
  timestamps: true
});

module.exports = ProjectMember;
