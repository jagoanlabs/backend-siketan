'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class permission extends Model {
    static associate(models) {
      // Permission belongs to many roles through role_permissions
      permission.belongsToMany(models.role, {
        through: models.role_permission,
        foreignKey: 'permission_id',
        otherKey: 'role_id',
        as: 'roles'
      });
    }
  }
  permission.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      display_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: DataTypes.TEXT,
      module: {
        type: DataTypes.STRING,
        allowNull: false
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'permission',
      tableName: 'permissions'
    }
  );
  return permission;
};
