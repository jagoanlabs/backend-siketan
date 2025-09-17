// app/router/rbac.js
const router = require('express').Router();
const { auth, hasRole } = require('../../midleware/auth');
const { ROLES } = require('../../helpers/roleHelpers');
const {
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
} = require('../controllers/rbac');

// ========== ROLE MANAGEMENT ROUTES ==========
// Only super admin can manage roles
router.get('/roles', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), getAllRoles);

router.get('/roles/:id', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), getRoleById);

router.post('/roles', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), createRole);

router.put('/roles/:id', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), updateRole);

router.delete('/roles/:id', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), deleteRole);

// ========== PERMISSION MANAGEMENT ROUTES ==========
// Only super admin can manage permissions
router.get('/permissions', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), getAllPermissions);

router.post('/permissions', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), createPermission);

router.put('/permissions/:id', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), updatePermission);

router.delete('/permissions/:id', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), deletePermission);

// ========== USER ROLE MANAGEMENT ROUTES ==========
// Super admin and operator super admin can assign roles
router.post('/users/assign-role', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), assignRoleToUser);

router.get(
  '/users/:userId/permissions',
  auth,
  hasRole(ROLES.OPERATOR_SUPER_ADMIN),
  getUserPermissions
);

router.post(
  '/users/:userId/check-permission',
  auth,
  hasRole(ROLES.OPERATOR_SUPER_ADMIN),
  checkUserPermission
);

// ========== RBAC STATISTICS ==========
router.get('/statistics', auth, hasRole(ROLES.OPERATOR_SUPER_ADMIN), getRbacStatistics);

// ========== CURRENT USER PERMISSIONS ==========
// Get current user's permissions (any authenticated user can check their own)
router.get('/my-permissions', auth, async (req, res) => {
  try {
    const user = await req.user.loadFullData();

    const permissions = user.role?.permissions || [];

    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan permissions Anda',
      data: {
        role: {
          id: user.role?.id,
          name: user.role?.name,
          display_name: user.role?.display_name
        },
        permissions: permissions.map((p) => ({
          id: p.id,
          name: p.name,
          display_name: p.display_name,
          module: p.module,
          action: p.action
        })),
        // Helper data for frontend
        modules: [...new Set(permissions.map((p) => p.module))],
        actions: permissions.reduce((acc, p) => {
          if (!acc[p.module]) acc[p.module] = [];
          acc[p.module].push(p.action);
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// Check if current user has specific permission
router.post('/my-permissions/check', auth, async (req, res) => {
  try {
    const { permission } = req.body;

    const hasPermission = req.user.hasPermission(permission);

    res.status(200).json({
      success: true,
      hasPermission,
      message: hasPermission
        ? `Anda memiliki permission ${permission}`
        : `Anda tidak memiliki permission ${permission}`
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
