'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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

    // Helper function to add permissions for a role
    const addRolePermissions = (roleName, permissions) => {
      if (roleMap[roleName]) {
        permissions.forEach((permName) => {
          if (permissionMap[permName]) {
            rolePermissionMappings.push({
              role_id: roleMap[roleName],
              permission_id: permissionMap[permName],
              created_at: now,
              updated_at: now
            });
          }
        });
      }
    };

    // Helper function to auto-add export permission if create exists
    const addExportIfCreate = (permissions) => {
      const result = [...permissions];
      permissions.forEach((perm) => {
        if (perm.includes('_create')) {
          const exportPerm = perm.replace('_create', '_export');
          if (!result.includes(exportPerm)) {
            result.push(exportPerm);
          }
        }
        if (perm.includes('_index')) {
          const exportPerm = perm.replace('_index', '_export');
          if (!result.includes(exportPerm)) {
            result.push(exportPerm);
          }
        }
      });
      return result;
    };

    // ===== OPERATOR SUPER ADMIN - ALL PERMISSIONS =====
    if (roleMap['operator_super_admin']) {
      console.log('Setting permissions for operator_super_admin: ALL PERMISSIONS');
      insertedPermissions.forEach((permission) => {
        rolePermissionMappings.push({
          role_id: roleMap['operator_super_admin'],
          permission_id: permission.id,
          created_at: now,
          updated_at: now
        });
      });
    }

    // ===== OPERATOR ADMIN - ALL PERMISSIONS EXCEPT DELETE =====
    if (roleMap['operator_admin']) {
      console.log('Setting permissions for operator_admin: ALL EXCEPT DELETE');
      const adminPermissions = insertedPermissions
        .filter((perm) => !perm.name.includes('_delete'))
        .map((perm) => perm.name);

      addRolePermissions('operator_admin', adminPermissions);
    }

    // ===== OPERATOR POKTAN =====
    if (roleMap['operator_poktan']) {
      console.log('Setting permissions for operator_poktan');
      let poktanPermissions = [
        // Dashboard
        'dashboard_index',

        // Statistik -> create, view, detail, realisasi + export
        'statistic_index',
        'statistic_create',
        'statistic_detail',
        'statistic_realisasi',

        // Tanaman Petani -> create, view, edit + export
        'tanaman_petani_index',
        'tanaman_petani_create',
        'tanaman_petani_detail',
        'tanaman_petani_edit',

        // Daftar Petani -> create, view, edit + export
        'data_petani_index',
        'data_petani_create',
        'data_petani_edit',
        'data_petani_detail',

        // Informasi Petani (Berita dan Acara) -> create, view, edit + export
        'berita_petani_index',
        'berita_petani_create',
        'berita_petani_edit',
        'berita_petani_detail',

        'acara_petani_index',
        'acara_petani_create',
        'acara_petani_edit',
        'acara_petani_detail',

        // Toko Pertanian -> CRUD + export
        'toko_petani_index',
        'toko_petani_create',
        'toko_petani_detail',
        'toko_petani_edit',
        'toko_petani_delete',

        // Data Penyuluh -> CRUD + export
        'data_penyuluh_index',
        'data_penyuluh_create',
        'data_penyuluh_detail',
        'data_penyuluh_edit',
        'data_penyuluh_delete',
        // Note: No delete for data_penyuluh by default, only import

        // Jurnal Penyuluh -> CRUD + export
        'jurnal_penyuluh_index',
        'jurnal_penyuluh_create',
        'jurnal_penyuluh_detail',
        'jurnal_penyuluh_edit',
        'jurnal_penyuluh_delete',

        // Log Aktivitas -> view only + export
        'log_aktivitas_index',

        // Data Sampah -> view, delete, restore + export
        'data_sampah_index',
        'data_sampah_delete',
        'data_sampah_restore',

        // Kelompok Tani -> semua kecuali delete + export
        'data_kelompok_index',
        'data_kelompok_edit'
        // Data Operator (added based on seeder)
        // 'data_operator_index',
        // 'data_operator_create',
        // 'data_operator_detail',
        // 'data_operator_edit',
        // 'data_operator_delete'
      ];

      // Auto-add export permissions
      poktanPermissions = addExportIfCreate(poktanPermissions);

      addRolePermissions('operator_poktan', poktanPermissions);
    }

    // ===== PENYULUH (PUSAT) AND PENYULUH SWADAYA - SAME PERMISSIONS =====
    const penyuluhBasePermissions = [
      // Dashboard
      'dashboard_index',

      // Statistik -> create, view, detail, realisasi + export
      'statistic_index',
      'statistic_create',
      'statistic_detail',
      'statistic_edit',

      // Tanaman Petani -> create, view, edit + export
      'tanaman_petani_index',
      'tanaman_petani_create',
      'tanaman_petani_edit',
      'tanaman_petani_detail',

      // Daftar Petani -> create, view, edit + export
      'data_petani_index',
      'data_petani_create',
      'data_petani_edit',
      'data_petani_detail',

      // Informasi Petani (Berita dan Acara) -> create, view, edit + export
      'berita_petani_index',
      'berita_petani_create',
      'berita_petani_edit',
      'berita_petani_detail',
      'acara_petani_index',
      'acara_petani_create',
      'acara_petani_edit',
      'acara_petani_detail',

      // Toko Pertanian -> create, view, edit + export
      'toko_petani_index',
      'toko_petani_create',
      'toko_petani_edit',
      'toko_petani_detail',

      // Data Penyuluh -> no access (removed)

      // Jurnal Penyuluh -> create, view, edit + export
      'jurnal_penyuluh_index',
      'jurnal_penyuluh_create',
      'jurnal_penyuluh_edit',
      'jurnal_penyuluh_detail',

      // Log Aktivitas -> no access (removed)
      // Data Sampah -> no access (removed)
      // Kelompok Tani -> no access (removed)

      // Profile
      'profile_user_detail',
      'profile_user_edit',

      // Forms
      'isi_form_create',
      'isi_form_detail'
    ];

    // Auto-add export permissions for penyuluh
    const penyuluhPermissions = addExportIfCreate(penyuluhBasePermissions);

    // Apply to both penyuluh and penyuluh_swadaya
    if (roleMap['penyuluh']) {
      console.log('Setting permissions for penyuluh');
      addRolePermissions('penyuluh', penyuluhPermissions);
    }

    if (roleMap['penyuluh_swadaya']) {
      console.log('Setting permissions for penyuluh_swadaya');
      addRolePermissions('penyuluh_swadaya', penyuluhPermissions);
    }

    // ===== PETANI - BASIC ACCESS AND PERSONAL DATA =====
    if (roleMap['petani']) {
      console.log('Setting permissions for petani');
      const petaniPermissions = [
        // Profile - own only
        'profile_user_detail',
        'profile_user_edit',

        // Forms
        'isi_form_create',
        'isi_form_detail'
      ];

      addRolePermissions('petani', petaniPermissions);
    }

    // ========== INSERT ROLE-PERMISSION MAPPINGS ==========
    console.log(`Inserting ${rolePermissionMappings.length} role-permission mappings...`);

    // Remove duplicates (just in case)
    const uniqueMappings = rolePermissionMappings.filter(
      (mapping, index, self) =>
        index ===
        self.findIndex(
          (m) => m.role_id === mapping.role_id && m.permission_id === mapping.permission_id
        )
    );

    console.log(`After removing duplicates: ${uniqueMappings.length} mappings`);

    // Batch insert role-permission mappings
    const batchSize = 100;
    for (let i = 0; i < uniqueMappings.length; i += batchSize) {
      const batch = uniqueMappings.slice(i, i + batchSize);
      await queryInterface.bulkInsert('role_permissions', batch);
    }

    console.log('SIKETAN RBAC seeding completed successfully!');
    console.log(`Created ${insertedRoles.length} roles`);
    console.log(`Created ${insertedPermissions.length} permissions`);
    console.log(`Created ${uniqueMappings.length} role-permission mappings`);

    // Log summary for each role
    const roleCounts = {};
    uniqueMappings.forEach((mapping) => {
      const roleName = insertedRoles.find((r) => r.id === mapping.role_id)?.name;
      if (roleName) {
        roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
      }
    });

    console.log('Permission counts per role:');
    Object.entries(roleCounts).forEach(([roleName, count]) => {
      console.log(`  ${roleName}: ${count} permissions`);
    });
  },

  async down(queryInterface, Sequelize) {
    console.log('Rolling back SIKETAN RBAC data...');

    // Delete in reverse order to maintain referential integrity
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});

    console.log('SIKETAN RBAC rollback completed');
  }
};
