'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class role extends Model {
    static associate(models) {
      // Role has many permissions through role_permissions
      role.belongsToMany(models.permission, {
        through: models.role_permission,
        foreignKey: 'role_id',
        otherKey: 'permission_id',
        as: 'permissions'
      });

      // Role has many users
      role.hasMany(models.tbl_akun, { foreignKey: 'role_id', as: 'users' });
    }
  }
  role.init(
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
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'role',
      tableName: 'roles'
    }
  );
  return role;
};
