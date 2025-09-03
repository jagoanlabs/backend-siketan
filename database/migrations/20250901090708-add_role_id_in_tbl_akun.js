// Migration 4: Add role_id to existing user tables
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add role_id to tbl_akun
    await queryInterface.addColumn('tbl_akun', 'role_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'password'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tbl_akun', 'role_id');
  }
};