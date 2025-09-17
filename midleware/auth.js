const jwt = require('jsonwebtoken');
const {
  tbl_akun: tblAkun,
  dataPerson,
  role: roleModel,
  permission: permissionModel
} = require('../app/models');
const dotenv = require('dotenv');
const { ROLES } = require('../helpers/roleHelpers');
dotenv.config();

const auth = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;

    // Check if authorization header exists
    if (!bearerToken) {
      return res.status(401).json({
        status: 'failed',
        message: 'Required authorization'
      });
    }

    // Check if token starts with 'Bearer '
    if (!bearerToken.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid token format. Use Bearer token'
      });
    }

    // Extract token (fix: add space after 'Bearer')
    const token = bearerToken.split('Bearer ')[1];

    if (!token || token.trim() === '') {
      return res.status(401).json({
        status: 'failed',
        message: 'Token not provided'
      });
    }

    console.log('token', token);

    // Verify JWT token
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    console.log('payload', payload);

    // Find user based on payload
    let userInstance;

    if (payload.NIK) {
      // Find in dataPerson table
      userInstance = await dataPerson.findByPk(payload.id, {
        include: [
          {
            model: roleModel,
            as: 'role',
            include: [
              {
                model: permissionModel,
                as: 'permissions',
                where: { is_active: true },
                required: false
              }
            ]
          }
        ]
      });
      if (!userInstance) {
        return res.status(401).json({
          status: 'failed',
          message: 'User not found in dataPerson'
        });
      }
    } else {
      // Find in tbl_akun table
      userInstance = await tblAkun.findByPk(payload.id, {
        include: [
          {
            model: roleModel,
            as: 'role',
            include: [
              {
                model: permissionModel,
                as: 'permissions',
                where: { is_active: true },
                required: false
              }
            ]
          }
        ]
      });
      console.log('userInstance', userInstance);
      if (!userInstance) {
        return res.status(401).json({
          status: 'failed',
          message: 'User not found in tbl_akun'
        });
      }
    }

    // Attach user to request object
    req.user = userInstance;
    req.payload = payload; // Optional: attach payload juga jika diperlukan

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'failed',
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid token'
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        status: 'failed',
        message: 'Token not active'
      });
    }

    // Generic error
    return res.status(401).json({
      status: 'failed',
      message: 'Authentication failed'
    });
  }
};

// Simple permission checker
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi'
      });
    }

    // Super admin bypass
    if (req.user.hasRole(ROLES.OPERATOR_SUPER_ADMIN)) {
      return next();
    }

    // Check permission
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk mengakses resource ini',
        required_permission: permission,
        user_role: req.user.role?.name
      });
    }

    next();
  };
};

// Simple role checker
const hasRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi'
      });
    }

    if (!req.user.hasRole(role)) {
      return res.status(403).json({
        success: false,
        message: `Akses terbatas untuk ${role}`,
        user_role: req.user.role?.name,
        required_role: role
      });
    }

    next();
  };
};

// Multiple roles checker (OR logic)
const hasAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi'
      });
    }

    const hasAccess = roles.some((role) => req.user.hasRole(role));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki role yang diperlukan',
        user_role: req.user.role?.name,
        required_roles: roles
      });
    }

    next();
  };
};

// Ownership checker
const isOwner = (ownerField = 'accountID') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi'
      });
    }

    // Super admin bypass
    if (req.user.hasRole(ROLES.OPERATOR_SUPER_ADMIN)) {
      return next();
    }

    // Check ownership
    const resourceOwnerId = req.params[ownerField] || req.body[ownerField];

    if (resourceOwnerId && resourceOwnerId !== req.user.accountID) {
      return res.status(403).json({
        success: false,
        message: 'Anda hanya dapat mengakses data milik sendiri'
      });
    }

    next();
  };
};

// ========== PREDEFINED MIDDLEWARE COMBINATIONS ==========

// Admin level access
const requireAdmin = [auth, hasAnyRole([ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_SUPER_ADMIN])];

// Operator level access
const requireOperator = [
  auth,
  hasAnyRole([ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_SUPER_ADMIN, ROLES.OPERATOR_POKTAN])
];

// Any penyuluh access
const requirePenyuluh = [auth, hasAnyRole([ROLES.PENYULUH_REGULER, ROLES.PENYULUH_SWADAYA])];

// Reguler penyuluh only
const requirePenyuluhReguler = [auth, hasRole(ROLES.PENYULUH_REGULER)];

// Swadaya penyuluh only
const requirePenyuluhSwadaya = [auth, hasRole(ROLES.PENYULUH_SWADAYA)];

// Petani only
const requirePetani = [auth, hasRole(ROLES.PETANI)];

// Manager level (admin + reguler penyuluh)
const requireManager = [
  auth,
  hasAnyRole([
    ROLES.OPERATOR_ADMIN,
    ROLES.OPERATOR_SUPER_ADMIN,
    ROLES.OPERATOR_POKTAN,
    ROLES.PENYULUH_REGULER
  ])
];

// Data creator level (can create/edit data)
const requireDataCreator = [
  auth,
  hasAnyRole([
    ROLES.OPERATOR_ADMIN,
    ROLES.OPERATOR_SUPER_ADMIN,
    ROLES.OPERATOR_POKTAN,
    ROLES.PENYULUH_REGULER
  ])
];

// Data approver level (can approve data)
const requireDataApprover = [
  auth,
  hasAnyRole([ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_SUPER_ADMIN, ROLES.PENYULUH_REGULER])
];

// Content viewer level (can view content)
const requireContentViewer = [
  auth,
  hasAnyRole([
    ROLES.OPERATOR_ADMIN,
    ROLES.OPERATOR_SUPER_ADMIN,
    ROLES.OPERATOR_POKTAN,
    ROLES.PENYULUH_REGULER,
    ROLES.PENYULUH_SWADAYA,
    ROLES.PETANI
  ])
];

// Helper function untuk create custom middleware
const createRoleMiddleware = (allowedRoles, errorMessage = null) => {
  return [
    auth,
    (req, res, next) => {
      const hasAccess = allowedRoles.some((role) => req.user.hasRole(role));

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: errorMessage || 'Anda tidak memiliki akses ke fitur ini',
          user_role: req.user.role?.name,
          required_roles: allowedRoles
        });
      }

      next();
    }
  ];
};
module.exports = {
  // Basic middleware
  auth,
  hasPermission,
  hasRole,
  hasAnyRole,
  isOwner,

  // Predefined combinations
  requireAdmin,
  requireOperator,
  requirePenyuluh,
  requirePenyuluhReguler,
  requirePenyuluhSwadaya,
  requirePetani,
  requireManager,
  requireDataCreator,
  requireDataApprover,
  requireContentViewer,

  // Helper function
  createRoleMiddleware
};
