'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    console.log('Updating existing users role_id based on peran field...');

    // Get all roles for mapping
    const roles = await queryInterface.sequelize.query('SELECT id, name FROM roles', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
      transaction
    });

    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    console.log('Available roles:', roleMap);
    const roleMapping = [
      {
        peranValue: 'operator super admin',
        roleName: 'operator_super_admin',
        description: 'Operator Super Admin'
      },
      {
        peranValue: 'operator admin',
        roleName: 'operator_admin',
        description: 'Operator Admin'
      },
      {
        peranValue: 'operator poktan',
        roleName: 'operator_poktan',
        description: 'Operator Poktan'
      },
      {
        peranValue: 'petani',
        roleName: 'petani',
        description: 'Petani'
      },
      {
        peranValue: 'penyuluh',
        roleName: 'penyuluh',
        description: 'Penyuluh'
      },
      {
        peranValue: 'penyuluh swadaya',
        roleName: 'penyuluh_swadaya',
        description: 'Penyuluh Swadaya'
      }
    ]; // Update users based on peran field with exact matching
    // Update users based on peran field with exact matching
    let totalUpdated = 0;

    for (const mapping of roleMapping) {
      if (roleMap[mapping.roleName]) {
        const result = await queryInterface.sequelize.query(
          `UPDATE tbl_akun 
           SET role_id = :roleId 
           WHERE LOWER(TRIM(peran)) = LOWER(:peran) 
           AND role_id IS NULL`,
          {
            replacements: {
              roleId: roleMap[mapping.roleName],
              peran: mapping.peranValue
            },
            transaction
          }
        );

        const updatedCount = result[1];
        totalUpdated += updatedCount;
        console.log(
          `✅ Updated ${updatedCount} users with peran '${mapping.peranValue}' -> ${mapping.description} (role_id: ${roleMap[mapping.roleName]})`
        );
      } else {
        console.log(`❌ Role '${mapping.roleName}' not found for peran '${mapping.peranValue}'`);
      }
    }

    // Handle edge cases and variations
    console.log('\n🔍 Handling edge cases and variations...');

    // Handle case variations and extra spaces
    const edgeCases = [
      { pattern: '%operator%super%admin%', roleName: 'operator_super_admin' },
      { pattern: '%operator%admin%', roleName: 'operator_admin' },
      { pattern: '%operator%poktan%', roleName: 'operator_poktan' },
      { pattern: '%penyuluh%swadaya%', roleName: 'penyuluh_swadaya' }
    ];

    for (const edgeCase of edgeCases) {
      if (roleMap[edgeCase.roleName]) {
        const result = await queryInterface.sequelize.query(
          `UPDATE tbl_akun 
           SET role_id = :roleId 
           WHERE LOWER(TRIM(peran)) LIKE LOWER(:pattern) 
           AND role_id IS NULL`,
          {
            replacements: {
              roleId: roleMap[edgeCase.roleName],
              pattern: edgeCase.pattern
            },
            transaction
          }
        );

        if (result[1] > 0) {
          totalUpdated += result[1];
          console.log(
            `✅ Updated ${result[1]} additional users matching pattern '${edgeCase.pattern}'`
          );
        }
      }
    }

    // Set default role for users without recognized peran
    if (roleMap['petani']) {
      const defaultResult = await queryInterface.sequelize.query(
        `UPDATE tbl_akun 
         SET role_id = :defaultRoleId 
         WHERE role_id IS NULL`,
        {
          replacements: {
            defaultRoleId: roleMap['petani']
          },
          transaction
        }
      );

      if (defaultResult[1] > 0) {
        totalUpdated += defaultResult[1];
        console.log(
          `⚠️  Set ${defaultResult[1]} users with unrecognized/null peran to default role 'petani'`
        );
      }
    }

    console.log(`\n📊 Total users updated: ${totalUpdated}`);

    // Show final statistics
    const finalStats = await queryInterface.sequelize.query(
      `SELECT 
        r.name as role_name, 
        r.display_name,
        COUNT(ta.id) as user_count,
        GROUP_CONCAT(DISTINCT ta.peran SEPARATOR ', ') as original_perans
      FROM roles r 
      LEFT JOIN tbl_akun ta ON r.id = ta.role_id 
      GROUP BY r.id, r.name, r.display_name
      ORDER BY user_count DESC`,
      { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
    );

    console.log('\n👤 Final role distribution:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    finalStats.forEach((stat) => {
      const originalPerans = stat.original_perans || 'None';
      console.log(
        `${stat.role_name.padEnd(20)} | ${stat.user_count.toString().padEnd(5)} users | Original perans: ${originalPerans}`
      );
    });

    // Check for any remaining users without roles
    const usersWithoutRole = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM tbl_akun WHERE role_id IS NULL',
      { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
    );

    if (usersWithoutRole[0].count > 0) {
      console.log(
        `\n⚠️  Warning: ${usersWithoutRole[0].count} users still don't have role_id assigned`
      );

      // Show these users for debugging
      const orphanUsers = await queryInterface.sequelize.query(
        'SELECT nama, email, peran FROM tbl_akun WHERE role_id IS NULL LIMIT 10',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      console.log('Sample users without role:');
      orphanUsers.forEach((user) => {
        console.log(`  - ${user.nama} (${user.email}) | peran: "${user.peran}"`);
      });
    } else {
      console.log('\n✅ All users have been assigned roles successfully!');
    }

    await transaction.commit();
    console.log('\n🎉 Role assignment completed successfully!');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    console.log('🔄 Rolling back role_id updates...');

    // Reset all role_id to NULL
    await queryInterface.sequelize.query('UPDATE tbl_akun SET role_id = NULL');

    console.log('✅ All user role_id reset to NULL');
  }
};
