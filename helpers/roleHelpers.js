// helpers/roleHelpers.js - Simple dan clean
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OPERATOR_SUPER_ADMIN: 'operator_super_admin',
  OPERATOR_POKTAN: 'operator_poktan',
  PENYULUH_REGULER: 'penyuluh_reguler',
  PENYULUH_SWADAYA: 'penyuluh_swadaya',
  PETANI: 'petani'
};

const PERMISSIONS = {
  // Dashboard
  DASHBOARD_INDEX: 'dashboard_index',

  // Statistics
  STATISTIC_INDEX: 'statistic_index',
  STATISTIC_CREATE: 'statistic_create',
  STATISTIC_EDIT: 'statistic_edit',
  STATISTIC_DELETE: 'statistic_delete',
  STATISTIC_EXPORT: 'statistic_export',
  STATISTIC_IMPORT: 'statistic_import',

  // Data Petani
  DATA_PETANI_INDEX: 'data_petani_index',
  DATA_PETANI_CREATE: 'data_petani_create',
  DATA_PETANI_EDIT: 'data_petani_edit',
  DATA_PETANI_APPROVE: 'data_petani_approve',
  DATA_PETANI_DELETE: 'data_petani_delete',
  DATA_PETANI_IMPORT: 'data_petani_import',

  // Berita Petani
  BERITA_PETANI_INDEX: 'berita_petani_index',
  BERITA_PETANI_CREATE: 'berita_petani_create',
  BERITA_PETANI_EDIT: 'berita_petani_edit',
  BERITA_PETANI_DELETE: 'berita_petani_delete',

  // Jurnal Penyuluh
  JURNAL_PENYULUH_INDEX: 'jurnal_penyuluh_index',
  JURNAL_PENYULUH_CREATE: 'jurnal_penyuluh_create',
  JURNAL_PENYULUH_EDIT: 'jurnal_penyuluh_edit',
  JURNAL_PENYULUH_DELETE: 'jurnal_penyuluh_delete',
  JURNAL_PENYULUH_APPROVE: 'jurnal_penyuluh_approve',

  // Toko Petani
  TOKO_PETANI_INDEX: 'toko_petani_index',
  TOKO_PETANI_CREATE: 'toko_petani_create',
  TOKO_PETANI_EDIT: 'toko_petani_edit',
  TOKO_PETANI_DELETE: 'toko_petani_delete',

  // Live Chat
  LIVE_CHAT_INDEX: 'live_chat_index',

  // Profile
  PROFILE_USER_DETAIL: 'profile_user_detail',
  PROFILE_USER_EDIT: 'profile_user_edit'
};

// Simple helper functions
class RoleHelpers {
  // Check if user is admin level
  static isAdmin(user) {
    return user.hasRole(ROLES.SUPER_ADMIN) || user.hasRole(ROLES.OPERATOR_SUPER_ADMIN);
  }

  // Check if user is operator level
  static isOperator(user) {
    return this.isAdmin(user) || user.hasRole(ROLES.OPERATOR_POKTAN);
  }

  // Check if user is any type of penyuluh
  static isPenyuluh(user) {
    return user.hasRole(ROLES.PENYULUH_REGULER) || user.hasRole(ROLES.PENYULUH_SWADAYA);
  }

  // Check if user is reguler penyuluh
  static isPenyuluhReguler(user) {
    return user.hasRole(ROLES.PENYULUH_REGULER);
  }

  // Check if user is swadaya penyuluh
  static isPenyuluhSwadaya(user) {
    return user.hasRole(ROLES.PENYULUH_SWADAYA);
  }

  // Check if user is petani
  static isPetani(user) {
    return user.hasRole(ROLES.PETANI);
  }

  // Get user role type for display
  static getUserRoleType(user) {
    if (user.hasRole(ROLES.SUPER_ADMIN)) return 'Super Admin';
    if (user.hasRole(ROLES.OPERATOR_SUPER_ADMIN)) return 'Operator Super Admin';
    if (user.hasRole(ROLES.OPERATOR_POKTAN)) return 'Operator Poktan';
    if (user.hasRole(ROLES.PENYULUH_REGULER)) return 'Penyuluh Reguler';
    if (user.hasRole(ROLES.PENYULUH_SWADAYA)) return 'Penyuluh Swadaya';
    if (user.hasRole(ROLES.PETANI)) return 'Petani';
    return 'Unknown';
  }

  // Check if user can access admin features
  static canAccessAdminFeatures(user) {
    return this.isAdmin(user);
  }

  // Check if user can manage data
  static canManageData(user) {
    return this.isOperator(user) || this.isPenyuluhReguler(user);
  }

  // Check if user can approve data
  static canApproveData(user) {
    return this.isAdmin(user) || this.isPenyuluhReguler(user);
  }

  // Check if user can create content
  static canCreateContent(user) {
    return this.isOperator(user) || this.isPenyuluhReguler(user);
  }

  // Check if user can access own data only
  static canAccessOwnDataOnly(user) {
    return this.isPenyuluhSwadaya(user) || this.isPetani(user);
  }

  // Get user capabilities summary
  static getUserCapabilities(user) {
    return {
      roleType: this.getUserRoleType(user),
      canAccessAdmin: this.canAccessAdminFeatures(user),
      canManageData: this.canManageData(user),
      canApproveData: this.canApproveData(user),
      canCreateContent: this.canCreateContent(user),
      accessLevel: this.getAccessLevel(user)
    };
  }

  // Get access level (for UI purposes)
  static getAccessLevel(user) {
    if (this.isAdmin(user)) return 'admin';
    if (this.isOperator(user)) return 'operator';
    if (this.isPenyuluhReguler(user)) return 'penyuluh_reguler';
    if (this.isPenyuluhSwadaya(user)) return 'penyuluh_swadaya';
    if (this.isPetani(user)) return 'petani';
    return 'guest';
  }
}

module.exports = {
  ROLES,
  PERMISSIONS,
  RoleHelpers
};
