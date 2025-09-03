'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class role_permission extends Model {
    static associate(models) {
      this.belongsTo(models.role, {
        foreignKey: 'role_id',
        as: 'role'
      });

      this.belongsTo(models.permission, {
        foreignKey: 'permission_id',
        as: 'permission'
      });
    }
  }

  role_permission.init(
    {
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'role_permission',
      tableName: 'role_permissions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return role_permission;
};
