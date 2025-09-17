// helpers/roleHelpers.js - Complete and structured
const ROLES = {
  OPERATOR_SUPER_ADMIN: 'operator_super_admin',
  OPERATOR_ADMIN: 'operator_admin',
  OPERATOR_POKTAN: 'operator_poktan',
  PENYULUH_REGULER: 'penyuluh_reguler',
  PENYULUH_SWADAYA: 'penyuluh_swadaya',
  PETANI: 'petani'
};

const PERMISSIONS = {
  // ===== DASHBOARD PERMISSIONS =====
  DASHBOARD_INDEX: 'dashboard_index',

  // ===== STATISTIC PERMISSIONS =====
  STATISTIC_INDEX: 'statistic_index',
  STATISTIC_CREATE: 'statistic_create',
  STATISTIC_DETAIL: 'statistic_detail',
  STATISTIC_EDIT: 'statistic_edit',
  STATISTIC_DELETE: 'statistic_delete',
  STATISTIC_REALISASI: 'statistic_realisasi',
  STATISTIC_EXPORT: 'statistic_export',
  STATISTIC_IMPORT: 'statistic_import',

  // ===== TANAMAN PETANI PERMISSIONS =====
  TANAMAN_PETANI_INDEX: 'tanaman_petani_index',
  TANAMAN_PETANI_CREATE: 'tanaman_petani_create',
  TANAMAN_PETANI_DETAIL: 'tanaman_petani_detail',
  TANAMAN_PETANI_EDIT: 'tanaman_petani_edit',
  TANAMAN_PETANI_DELETE: 'tanaman_petani_delete',
  TANAMAN_PETANI_IMPORT: 'tanaman_petani_import',
  TANAMAN_PETANI_EXPORT: 'tanaman_petani_export',

  // ===== DATA PETANI PERMISSIONS =====
  DATA_PETANI_INDEX: 'data_petani_index',
  DATA_PETANI_CREATE: 'data_petani_create',
  DATA_PETANI_DETAIL: 'data_petani_detail',
  DATA_PETANI_EDIT: 'data_petani_edit',
  DATA_PETANI_APPROVE: 'data_petani_approve',
  DATA_PETANI_DELETE: 'data_petani_delete',
  DATA_PETANI_IMPORT: 'data_petani_import',

  // ===== BERITA PETANI PERMISSIONS =====
  BERITA_PETANI_INDEX: 'berita_petani_index',
  BERITA_PETANI_CREATE: 'berita_petani_create',
  BERITA_PETANI_DETAIL: 'berita_petani_detail',
  BERITA_PETANI_EDIT: 'berita_petani_edit',
  BERITA_PETANI_DELETE: 'berita_petani_delete',

  // ===== ACARA PETANI PERMISSIONS =====
  ACARA_PETANI_INDEX: 'acara_petani_index',
  ACARA_PETANI_CREATE: 'acara_petani_create',
  ACARA_PETANI_DETAIL: 'acara_petani_detail',
  ACARA_PETANI_EDIT: 'acara_petani_edit',
  ACARA_PETANI_DELETE: 'acara_petani_delete',

  // ===== TOKO PETANI PERMISSIONS =====
  TOKO_PETANI_INDEX: 'toko_petani_index',
  TOKO_PETANI_CREATE: 'toko_petani_create',
  TOKO_PETANI_DETAIL: 'toko_petani_detail',
  TOKO_PETANI_EDIT: 'toko_petani_edit',
  TOKO_PETANI_DELETE: 'toko_petani_delete',

  // ===== LIVE CHAT PERMISSIONS =====
  LIVE_CHAT_INDEX: 'live_chat_index',

  // ===== DATA PENYULUH PERMISSIONS =====
  DATA_PENYULUH_INDEX: 'data_penyuluh_index',
  DATA_PENYULUH_CREATE: 'data_penyuluh_create',
  DATA_PENYULUH_DETAIL: 'data_penyuluh_detail',
  DATA_PENYULUH_EDIT: 'data_penyuluh_edit',
  DATA_PENYULUH_IMPORT: 'data_penyuluh_import',

  // ===== JURNAL PENYULUH PERMISSIONS =====
  JURNAL_PENYULUH_INDEX: 'jurnal_penyuluh_index',
  JURNAL_PENYULUH_CREATE: 'jurnal_penyuluh_create',
  JURNAL_PENYULUH_DETAIL: 'jurnal_penyuluh_detail',
  JURNAL_PENYULUH_EDIT: 'jurnal_penyuluh_edit',
  JURNAL_PENYULUH_DELETE: 'jurnal_penyuluh_delete',

  // ===== VERIFIKASI USER PERMISSIONS =====
  VERIFIKASI_USER_INDEX: 'verifikasi_user_index',
  VERIFIKASI_USER_APPROVE: 'verifikasi_user_approve',
  VERIFIKASI_USER_REJECT: 'verifikasi_user_reject',

  // ===== UBAH HAK AKSES PERMISSIONS =====
  UBAH_HAK_AKSES_INDEX: 'ubah_hak_akses_index',
  UBAH_HAK_AKSES_EDIT: 'ubah_hak_akses_edit',

  // ===== LOG AKTIVITAS PERMISSIONS =====
  LOG_AKTIVITAS_INDEX: 'log_aktivitas_index',

  // ===== DATA SAMPAH PERMISSIONS =====
  DATA_SAMPAH_INDEX: 'data_sampah_index',
  DATA_SAMPAH_RESTORE: 'data_sampah_restore',
  DATA_SAMPAH_DELETE_PERMANENT: 'data_sampah_delete',

  // ===== DATA KELOMPOK PERMISSIONS =====
  DATA_KELOMPOK_INDEX: 'data_kelompok_index',
  DATA_KELOMPOK_EDIT: 'data_kelompok_edit',
  DATA_KELOMPOK_DELETE: 'data_kelompok_delete',
  DATA_KELOMPOK_IMPORT: 'data_kelompok_import',

  // ===== PROFILE ADMIN PERMISSIONS =====
  PROFILE_ADMIN_INDEX: 'profile_admin_index',

  // ===== PROFILE USER PERMISSIONS =====
  PROFILE_USER_DETAIL: 'profile_user_detail',
  PROFILE_USER_EDIT: 'profile_user_edit',

  // ===== ISI FORM PERMISSIONS =====
  ISI_FORM_CREATE: 'isi_form_create',
  ISI_FORM_DETAIL: 'isi_form_detail'
};

// Permission Groups for easier management
const PERMISSION_GROUPS = {
  DASHBOARD: [PERMISSIONS.DASHBOARD_INDEX],

  STATISTICS: [
    PERMISSIONS.STATISTIC_INDEX,
    PERMISSIONS.STATISTIC_CREATE,
    PERMISSIONS.STATISTIC_DETAIL,
    PERMISSIONS.STATISTIC_EDIT,
    PERMISSIONS.STATISTIC_DELETE,
    PERMISSIONS.STATISTIC_REALISASI,
    PERMISSIONS.STATISTIC_EXPORT,
    PERMISSIONS.STATISTIC_IMPORT
  ],

  DATA_PETANI: [
    PERMISSIONS.DATA_PETANI_INDEX,
    PERMISSIONS.DATA_PETANI_CREATE,
    PERMISSIONS.DATA_PETANI_DETAIL,
    PERMISSIONS.DATA_PETANI_EDIT,
    PERMISSIONS.DATA_PETANI_APPROVE,
    PERMISSIONS.DATA_PETANI_DELETE,
    PERMISSIONS.DATA_PETANI_IMPORT
  ],

  TANAMAN_PETANI: [
    PERMISSIONS.TANAMAN_PETANI_INDEX,
    PERMISSIONS.TANAMAN_PETANI_CREATE,
    PERMISSIONS.TANAMAN_PETANI_DETAIL,
    PERMISSIONS.TANAMAN_PETANI_EDIT,
    PERMISSIONS.TANAMAN_PETANI_DELETE,
    PERMISSIONS.TANAMAN_PETANI_IMPORT,
    PERMISSIONS.TANAMAN_PETANI_EXPORT
  ],

  BERITA_PETANI: [
    PERMISSIONS.BERITA_PETANI_INDEX,
    PERMISSIONS.BERITA_PETANI_CREATE,
    PERMISSIONS.BERITA_PETANI_DETAIL,
    PERMISSIONS.BERITA_PETANI_EDIT,
    PERMISSIONS.BERITA_PETANI_DELETE
  ],

  ACARA_PETANI: [
    PERMISSIONS.ACARA_PETANI_INDEX,
    PERMISSIONS.ACARA_PETANI_CREATE,
    PERMISSIONS.ACARA_PETANI_DETAIL,
    PERMISSIONS.ACARA_PETANI_EDIT,
    PERMISSIONS.ACARA_PETANI_DELETE
  ],

  TOKO_PETANI: [
    PERMISSIONS.TOKO_PETANI_INDEX,
    PERMISSIONS.TOKO_PETANI_CREATE,
    PERMISSIONS.TOKO_PETANI_DETAIL,
    PERMISSIONS.TOKO_PETANI_EDIT,
    PERMISSIONS.TOKO_PETANI_DELETE
  ]
};

// Simple helper functions
class RoleHelpers {
  // Check if user is admin level
  static isAdmin(user) {
    return user.hasRole(ROLES.OPERATOR_SUPER_ADMIN) || user.hasRole(ROLES.OPERATOR_ADMIN);
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
    if (user.hasRole(ROLES.OPERATOR_SUPER_ADMIN)) return 'Super Admin';
    if (user.hasRole(ROLES.OPERATOR_ADMIN)) return 'Operator Admin';
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

  // Check if user has any permission from a list
  static hasAnyPermission(user, permissions) {
    if (!user || !user.role || !user.role.permissions) return false;

    return permissions.some((permission) =>
      user.role.permissions.some((perm) => perm.name === permission && perm.is_active === true)
    );
  }

  // Check if user has all permissions from a list
  static hasAllPermissions(user, permissions) {
    if (!user || !user.role || !user.role.permissions) return false;

    return permissions.every((permission) =>
      user.role.permissions.some((perm) => perm.name === permission && perm.is_active === true)
    );
  }
}

module.exports = {
  ROLES,
  PERMISSIONS,
  PERMISSION_GROUPS,
  RoleHelpers
};
