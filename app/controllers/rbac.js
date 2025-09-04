// app/controllers/rbac.js
const {
  role: Role,
  permission: Permission,
  role_permission: RolePermission,
  tbl_akun: User,
  sequelize
} = require('../models');
const ApiError = require('../../utils/ApiError');
const { Op } = require('sequelize');

// ============ ROLE MANAGEMENT ============

// Get all roles with permissions
const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', includePermissions = true } = req.query;

    const whereClause = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { display_name: { [Op.like]: `%${search}%` } }
          ]
        }
      : {};

    const queryOptions = {
      where: whereClause,
      order: [['created_at', 'DESC']]
    };

    if (includePermissions === 'true') {
      queryOptions.include = [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ];
    }

    // Add pagination if needed
    if (limit !== 'all') {
      queryOptions.limit = Number(limit);
      queryOptions.offset = (Number(page) - 1) * Number(limit);
    }

    const roles = await Role.findAndCountAll(queryOptions);

    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan daftar role',
      data: roles.rows,
      total: roles.count,
      currentPage: Number(page),
      totalPages: limit === 'all' ? 1 : Math.ceil(roles.count / Number(limit))
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single role with permissions
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    if (!role) {
      throw new ApiError(404, 'Role tidak ditemukan');
    }

    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan detail role',
      data: role
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new role
const createRole = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, display_name, description, permissions = [] } = req.body;

    // Validate input
    if (!name || !display_name) {
      throw new ApiError(400, 'Nama dan Display Name wajib diisi');
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      throw new ApiError(400, 'Role dengan nama tersebut sudah ada');
    }

    // Create role
    const role = await Role.create(
      {
        name: name.toLowerCase().replace(/\s+/g, '_'),
        display_name,
        description,
        is_active: true
      },
      { transaction }
    );

    // Assign permissions if provided
    if (permissions.length > 0) {
      const rolePermissions = permissions.map((permissionId) => ({
        role_id: role.id,
        permission_id: permissionId
      }));

      await RolePermission.bulkCreate(rolePermissions, { transaction });
    }

    await transaction.commit();

    // Fetch complete role data
    const completeRole = await Role.findByPk(role.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Role berhasil dibuat',
      data: completeRole
    });
  } catch (error) {
    await transaction.rollback();
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Update role
const updateRole = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { display_name, description, permissions, is_active } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      throw new ApiError(404, 'Role tidak ditemukan');
    }

    // Prevent editing system roles
    const systemRoles = ['super_admin', 'petani'];
    if (systemRoles.includes(role.name)) {
      throw new ApiError(403, 'Role sistem tidak dapat diubah');
    }

    // Update role details
    await role.update(
      {
        display_name: display_name || role.display_name,
        description: description || role.description,
        is_active: is_active !== undefined ? is_active : role.is_active
      },
      { transaction }
    );

    // Update permissions if provided
    if (permissions !== undefined) {
      // Remove existing permissions
      await RolePermission.destroy(
        {
          where: { role_id: id }
        },
        { transaction }
      );

      // Add new permissions
      if (permissions.length > 0) {
        const rolePermissions = permissions.map((permissionId) => ({
          role_id: id,
          permission_id: permissionId
        }));

        await RolePermission.bulkCreate(rolePermissions, { transaction });
      }
    }

    await transaction.commit();

    // Fetch updated role
    const updatedRole = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Role berhasil diperbarui',
      data: updatedRole
    });
  } catch (error) {
    await transaction.rollback();
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      throw new ApiError(404, 'Role tidak ditemukan');
    }

    // Prevent deleting system roles
    const systemRoles = ['super_admin', 'petani', 'penyuluh_reguler'];
    if (systemRoles.includes(role.name)) {
      throw new ApiError(403, 'Role sistem tidak dapat dihapus');
    }

    // Check if role is assigned to users
    const usersWithRole = await User.count({ where: { role_id: id } });
    if (usersWithRole > 0) {
      throw new ApiError(
        400,
        `Tidak dapat menghapus role. ${usersWithRole} pengguna masih menggunakan role ini`
      );
    }

    // Delete role permissions first
    await RolePermission.destroy(
      {
        where: { role_id: id }
      },
      { transaction }
    );

    // Delete role
    await role.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Role berhasil dihapus'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// ============ PERMISSION MANAGEMENT ============

// Get all permissions
const getAllPermissions = async (req, res) => {
  try {
    const { module, search = '' } = req.query;

    let whereClause = {};

    if (module) {
      whereClause.module = module;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { display_name: { [Op.like]: `%${search}%` } },
        { module: { [Op.like]: `%${search}%` } }
      ];
    }

    const permissions = await Permission.findAll({
      where: whereClause,
      order: [
        ['module', 'ASC'],
        ['name', 'ASC']
      ]
    });

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan daftar permission',
      data: permissions,
      grouped: groupedPermissions,
      total: permissions.length
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new permission
const createPermission = async (req, res) => {
  try {
    const { name, display_name, description, module, action } = req.body;

    // Validate input
    if (!name || !display_name || !module || !action) {
      throw new ApiError(400, 'Semua field wajib diisi');
    }

    // Check if permission exists
    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      throw new ApiError(400, 'Permission dengan nama tersebut sudah ada');
    }

    const permission = await Permission.create({
      name: name.toLowerCase().replace(/\s+/g, '_'),
      display_name,
      description,
      module: module.toLowerCase(),
      action: action.toLowerCase(),
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Permission berhasil dibuat',
      data: permission
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Update permission
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { display_name, description, is_active } = req.body;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      throw new ApiError(404, 'Permission tidak ditemukan');
    }

    await permission.update({
      display_name: display_name || permission.display_name,
      description: description || permission.description,
      is_active: is_active !== undefined ? is_active : permission.is_active
    });

    res.status(200).json({
      success: true,
      message: 'Permission berhasil diperbarui',
      data: permission
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete permission
const deletePermission = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      throw new ApiError(404, 'Permission tidak ditemukan');
    }

    // Remove from all roles first
    await RolePermission.destroy(
      {
        where: { permission_id: id }
      },
      { transaction }
    );

    // Delete permission
    await permission.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Permission berhasil dihapus'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// ============ USER ROLE MANAGEMENT ============

// Assign role to user
const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new ApiError(404, 'Role tidak ditemukan');
    }

    await user.update({ role_id: roleId });

    const updatedUser = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: `Role ${role.display_name} berhasil diberikan kepada ${user.nama}`,
      data: updatedUser
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user permissions
const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] },
              where: { is_active: true },
              required: false
            }
          ]
        }
      ]
    });

    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    const permissions = user.role?.permissions || [];

    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan permissions user',
      data: {
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role?.display_name || 'No Role'
        },
        permissions: permissions.map((p) => ({
          id: p.id,
          name: p.name,
          display_name: p.display_name,
          module: p.module,
          action: p.action
        }))
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Check user permission
const checkUserPermission = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permission } = req.body;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    const hasPermission = user.role?.permissions?.some((p) => p.name === permission) || false;

    res.status(200).json({
      success: true,
      hasPermission,
      message: hasPermission
        ? `User memiliki permission ${permission}`
        : `User tidak memiliki permission ${permission}`
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// ============ ROLE & PERMISSION STATISTICS ============

const getRbacStatistics = async (req, res) => {
  try {
    const totalRoles = await Role.count();
    const activeRoles = await Role.count({ where: { is_active: true } });
    const totalPermissions = await Permission.count();
    const activePermissions = await Permission.count({ where: { is_active: true } });

    // Count users per role
    const usersPerRole = await User.findAll({
      attributes: ['role_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['role_id'],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name', 'display_name']
        }
      ]
    });

    // Count permissions per module
    const permissionsPerModule = await Permission.findAll({
      attributes: ['module', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['module']
    });

    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan statistik RBAC',
      data: {
        roles: {
          total: totalRoles,
          active: activeRoles,
          inactive: totalRoles - activeRoles
        },
        permissions: {
          total: totalPermissions,
          active: activePermissions,
          inactive: totalPermissions - activePermissions
        },
        usersPerRole: usersPerRole.map((item) => ({
          role: item.role?.display_name || 'No Role',
          count: parseInt(item.get('count'))
        })),
        permissionsPerModule: permissionsPerModule.map((item) => ({
          module: item.module,
          count: parseInt(item.get('count'))
        }))
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  // Role Management
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,

  // Permission Management
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,

  // User Role Management
  assignRoleToUser,
  getUserPermissions,
  checkUserPermission,

  // Statistics
  getRbacStatistics
};
