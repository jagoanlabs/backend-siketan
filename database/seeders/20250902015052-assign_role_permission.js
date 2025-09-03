'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    // ========== GET INSERTED DATA FOR ROLE-PERMISSION MAPPING ==========
    console.log('Creating role-permission mappings...');
    const now = new Date();

    const insertedRoles = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const insertedPermissions = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Create permission lookup map
    const permissionMap = {};
    insertedPermissions.forEach((perm) => {
      permissionMap[perm.name] = perm.id;
    });

    // Create role lookup map
    const roleMap = {};
    insertedRoles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    // ========== ROLE-PERMISSION MAPPINGS ==========
    const rolePermissionMappings = [];

    // ===== OPERATOR SUPER ADMIN - ALL PERMISSIONS =====
    if (roleMap['operator_super_admin']) {
      insertedPermissions.forEach((permission) => {
        rolePermissionMappings.push({
          role_id: roleMap['operator_super_admin'],
          permission_id: permission.id,
          created_at: now,
          updated_at: now
        });
      });
    }

    // ===== OPERATOR POKTAN - MOST MANAGEMENT PERMISSIONS =====
    if (roleMap['operator_poktan']) {
      const adminPermissions = [
        // Dashboard
        'dashboard_index',

        // Statistics - full access
        'statistic_index',
        'statistic_create',
        'statistic_detail',
        'statistic_edit',
        'statistic_delete',
        'statistic_realisasi',
        'statistic_export',
        'statistic_import',

        // Data Management - full access
        'tanaman_petani_index',
        'tanaman_petani_create',
        'tanaman_petani_detail',
        'tanaman_petani_edit',
        'tanaman_petani_delete',
        'tanaman_petani_import',
        'tanaman_petani_export',

        'data_petani_index',
        'data_petani_create',
        'data_petani_detail',
        'data_petani_edit',
        'data_petani_approve',
        'data_petani_delete',
        'data_petani_import',

        'data_penyuluh_index',
        'data_penyuluh_create',
        'data_penyuluh_detail',
        'data_penyuluh_edit',
        'data_penyuluh_import',

        // Content Management
        'berita_petani_index',
        'berita_petani_create',
        'berita_petani_detail',
        'berita_petani_edit',
        'berita_petani_delete',
        'acara_petani_index',
        'acara_petani_create',
        'acara_petani_detail',
        'acara_petani_edit',
        'acara_petani_delete',

        // Marketplace
        'toko_petani_index',
        'toko_petani_create',
        'toko_petani_detail',
        'toko_petani_edit',
        'toko_petani_delete',

        // Communication
        'live_chat_index',

        // Journal Management
        'jurnal_penyuluh_index',
        'jurnal_penyuluh_create',
        'jurnal_penyuluh_detail',
        'jurnal_penyuluh_edit',
        'jurnal_penyuluh_delete',

        // User Management
        'verifikasi_user_index',
        'verifikasi_user_approve',
        'verifikasi_user_reject',
        'ubah_hak_akses_index',
        'ubah_hak_akses_edit',

        // System Management
        'log_aktivitas_index',
        'data_sampah_index',
        'data_sampah_restore',
        'data_sampah_delete',
        'data_kelompok_index',
        'data_kelompok_edit',
        'data_kelompok_delete',
        'data_kelompok_import',

        // Profile
        'profile_admin_index',
        'profile_user_detail',
        'profile_user_edit'
      ];

      adminPermissions.forEach((permName) => {
        if (permissionMap[permName]) {
          rolePermissionMappings.push({
            role_id: roleMap['operator_poktan'],
            permission_id: permissionMap[permName],
            created_at: now,
            updated_at: now
          });
        }
      });
    }

    // ===== PENYULUH - MONITORING AND JOURNAL FOCUSED =====
    if (roleMap['penyuluh']) {
      const penyuluhPermissions = [
        // Journal - full access for their own journal
        'jurnal_penyuluh_index',
        'jurnal_penyuluh_create',
        'jurnal_penyuluh_detail',
        'jurnal_penyuluh_edit',
        'jurnal_penyuluh_delete',

        // Profile
        'profile_user_detail',
        'profile_user_edit',

        // Forms
        'isi_form_create',
        'isi_form_detail'
      ];

      penyuluhPermissions.forEach((permName) => {
        if (permissionMap[permName]) {
          rolePermissionMappings.push({
            role_id: roleMap['penyuluh'],
            permission_id: permissionMap[permName],
            created_at: now,
            updated_at: now
          });
        }
      });
    }

    // ===== PENYULUH SWADAYA - MONITORING AND JOURNAL FOCUSED =====
    if (roleMap['penyuluh_swadaya']) {
      const penyuluhPermissions = [
        // Profile
        'profile_user_detail',
        'profile_user_edit',

        // Forms
        'isi_form_create',
        'isi_form_detail'
      ];

      penyuluhPermissions.forEach((permName) => {
        if (permissionMap[permName]) {
          rolePermissionMappings.push({
            role_id: roleMap['penyuluh_swadaya'],
            permission_id: permissionMap[permName],
            created_at: now,
            updated_at: now
          });
        }
      });
    }

    // ===== PETANI - BASIC ACCESS AND PERSONAL DATA =====
    if (roleMap['petani']) {
      const petaniPermissions = [
        // Profile - own only
        'profile_user_detail',
        'profile_user_edit',

        // Forms
        'isi_form_create',
        'isi_form_detail'
      ];

      petaniPermissions.forEach((permName) => {
        if (permissionMap[permName]) {
          rolePermissionMappings.push({
            role_id: roleMap['petani'],
            permission_id: permissionMap[permName],
            created_at: now,
            updated_at: now
          });
        }
      });
    }

    // ========== INSERT ROLE-PERMISSION MAPPINGS ==========
    console.log(`Inserting ${rolePermissionMappings.length} role-permission mappings...`);

    // Batch insert role-permission mappings
    const batchSize = 100;
    for (let i = 0; i < rolePermissionMappings.length; i += batchSize) {
      const batch = rolePermissionMappings.slice(i, i + batchSize);
      await queryInterface.bulkInsert('role_permissions', batch);
    }

    console.log('SIKETAN RBAC seeding completed successfully!');
    console.log(`Created ${insertedRoles.length} roles`);
    console.log(`Created ${insertedPermissions.length} permissions`);
    console.log(`Created ${rolePermissionMappings.length} role-permission mappings`);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    console.log('Rolling back SIKETAN RBAC data...');

    // Delete in reverse order to maintain referential integrity
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});

    console.log('SIKETAN RBAC rollback completed');
  }
};
