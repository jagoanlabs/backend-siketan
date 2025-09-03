// models/tbl_akun.js - Updated dengan simple RBAC methods
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tbl_akun extends Model {
    static associate(models) {
      // Relasi dengan Role (RBAC)
      tbl_akun.belongsTo(models.role, {
        foreignKey: 'role_id',
        as: 'role'
      });

      // Existing relations
      tbl_akun.hasOne(models.dataPetani, {
        foreignKey: 'accountID',
        sourceKey: 'accountID',
        as: 'petani'
      });

      tbl_akun.hasOne(models.dataPenyuluh, {
        foreignKey: 'accountID',
        sourceKey: 'accountID',
        as: 'penyuluh'
      });

      tbl_akun.hasOne(models.dataOperator, {
        foreignKey: 'accountID',
        sourceKey: 'accountID',
        as: 'operator'
      });

      tbl_akun.hasMany(models.penjual, {
        foreignKey: 'accountID',
        sourceKey: 'accountID',
        as: 'penjual'
      });
    }

    // ========== SIMPLE RBAC METHODS ==========

    // Basic role checking
    hasRole(roleName) {
      return this.role && this.role.name === roleName;
    }

    // Basic permission checking
    hasPermission(permissionName) {
      if (!this.role || !this.role.permissions) return false;
      return this.role.permissions.some((permission) => permission.name === permissionName);
    }

    // Multiple permissions checking (OR logic)
    hasAnyPermission(permissionNames) {
      if (!this.role || !this.role.permissions) return false;
      return permissionNames.some((permissionName) =>
        this.role.permissions.some((permission) => permission.name === permissionName)
      );
    }

    // Check all permissions (AND logic)
    hasAllPermissions(permissionNames) {
      if (!this.role || !this.role.permissions) return false;
      return permissionNames.every((permissionName) =>
        this.role.permissions.some((permission) => permission.name === permissionName)
      );
    }

    // ========== CONVENIENCE METHODS ==========

    // Check if user is admin level
    isAdmin() {
      return this.hasRole('super_admin') || this.hasRole('operator_super_admin');
    }

    // Check if user is operator level
    isOperator() {
      return this.isAdmin() || this.hasRole('operator_poktan');
    }

    // Check if user is any type of penyuluh
    isPenyuluh() {
      return this.hasRole('penyuluh_reguler') || this.hasRole('penyuluh_swadaya');
    }

    // Check if user is reguler penyuluh
    isPenyuluhReguler() {
      return this.hasRole('penyuluh_reguler');
    }

    // Check if user is swadaya penyuluh
    isPenyuluhSwadaya() {
      return this.hasRole('penyuluh_swadaya');
    }

    // Check if user is petani
    isPetani() {
      return this.hasRole('petani');
    }

    // ========== USER INFO METHODS ==========

    // Get user role display name
    getRoleDisplayName() {
      return this.role ? this.role.display_name : 'No Role';
    }

    // Get user type based on role
    getUserType() {
      if (this.isAdmin()) return 'admin';
      if (this.isOperator()) return 'operator';
      if (this.isPenyuluhReguler()) return 'penyuluh_reguler';
      if (this.isPenyuluhSwadaya()) return 'penyuluh_swadaya';
      if (this.isPetani()) return 'petani';
      return 'unknown';
    }

    // Get user permissions list
    getUserPermissions() {
      if (!this.role || !this.role.permissions) return [];
      return this.role.permissions.map((permission) => permission.name);
    }

    // Get user summary for API responses
    getUserSummary() {
      return {
        id: this.id,
        accountID: this.accountID,
        nama: this.nama,
        email: this.email,
        role: this.role?.name,
        roleDisplayName: this.getRoleDisplayName(),
        userType: this.getUserType(),
        permissions: this.getUserPermissions(),
        isVerified: this.isVerified
      };
    }

    // ========== BUSINESS LOGIC METHODS ==========

    // Check if user can create data
    canCreateData() {
      return this.isOperator() || this.isPenyuluhReguler();
    }

    // Check if user can approve data
    canApproveData() {
      return this.isAdmin() || this.isPenyuluhReguler();
    }

    // Check if user can delete data
    canDeleteData() {
      return this.isAdmin();
    }

    // Check if user can manage users
    canManageUsers() {
      return this.isAdmin();
    }

    // Check if user can view reports
    canViewReports() {
      return !this.isPetani(); // All except petani can view reports
    }

    // Check if user can export data
    canExportData() {
      return this.isOperator();
    }

    // Check if user can import data
    canImportData() {
      return this.isOperator();
    }

    // Check if user can access admin panel
    canAccessAdminPanel() {
      return this.isOperator();
    }

    // Check if user can only access own data
    isRestrictedToOwnData() {
      return this.isPenyuluhSwadaya() || this.isPetani();
    }

    // ========== UTILITY METHODS ==========

    // Load full user data with all relations
    async loadFullData() {
      return await tbl_akun.findByPk(this.id, {
        include: [
          {
            model: sequelize.models.Role,
            as: 'role',
            include: [
              {
                model: sequelize.models.Permission,
                as: 'permissions',
                where: { is_active: true },
                required: false
              }
            ]
          },
          { model: sequelize.models.dataPetani, as: 'petani' },
          { model: sequelize.models.dataPenyuluh, as: 'penyuluh' },
          { model: sequelize.models.dataOperator, as: 'operator' },
          { model: sequelize.models.penjual, as: 'penjual' }
        ]
      });
    }

    // Check resource ownership
    ownsResource(resource, ownerField = 'accountID') {
      return resource[ownerField] === this.accountID;
    }

    // Can access resource (ownership + permission)
    canAccessResource(resource, requiredPermission, ownerField = 'accountID') {
      // Super admin can access everything
      if (this.hasRole('super_admin')) {
        return true;
      }

      // Check permission first
      if (requiredPermission && !this.hasPermission(requiredPermission)) {
        return false;
      }

      // If no permission but is owner
      if (!requiredPermission && this.ownsResource(resource, ownerField)) {
        return true;
      }

      // If has permission, can access regardless of ownership
      if (requiredPermission && this.hasPermission(requiredPermission)) {
        return true;
      }

      return false;
    }
  }

  tbl_akun.init(
    {
      email: DataTypes.STRING,
      no_wa: DataTypes.STRING,
      nama: DataTypes.STRING,
      password: DataTypes.STRING,
      pekerjaan: DataTypes.STRING,
      peran: DataTypes.STRING, // Keep for backward compatibility
      foto: DataTypes.STRING,
      accountID: {
        type: DataTypes.UUID,
        unique: true
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'tbl_akun',
      tableName: 'tbl_akun'
    }
  );

  return tbl_akun;
};
