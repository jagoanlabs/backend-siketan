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
    const now = new Date();

    // ========== INSERT ROLES ==========
    console.log('Inserting roles...');
    await queryInterface.bulkInsert(
      'roles',
      [
        {
          name: 'operator_super_admin',
          display_name: 'Operator Super Admin',
          description: 'Memiliki akses penuh ke semua fitur dan pengaturan sistem',
          is_active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          name: 'operator_poktan',
          display_name: 'Operator Poktan',
          description: 'Memiliki akses dibawah operator super admin',
          is_active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          name: 'penyuluh',
          display_name: 'Penyuluh',
          description: 'Penyuluh ',
          is_active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          name: 'operator_admin',
          display_name: 'Operator Admin',
          description: 'Memiliki akses dibawah operator super admin',
          is_active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          name: 'penyuluh_swadaya',
          display_name: 'Penyuluh Swadaya',
          description: 'Penyuluh Swadaya ',
          is_active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          name: 'petani',
          display_name: 'Petani',
          description: 'Petani',
          is_active: true,
          createdAt: now,
          updatedAt: now
        },
      ],
      { returning: true }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('roles', null, {});
  }
};
