'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Tambahkan kolom yang bisa NULL dulu
    await queryInterface.addColumn('dataPenyuluhs', 'tipe', {
      type: Sequelize.ENUM('pusat', 'swadaya'),
      allowNull: true
    });

    // 2. Update semua data yang sudah ada menjadi 'pusat'
    await queryInterface.sequelize.query(
      "UPDATE `dataPenyuluhs` SET `tipe` = 'pusat' WHERE `tipe` IS NULL"
    );

    // 3. Ubah kolom menjadi NOT NULL
    await queryInterface.changeColumn('dataPenyuluhs', 'tipe', {
      type: Sequelize.ENUM('pusat', 'swadaya'),
      allowNull: false,
      defaultValue: 'pusat'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('dataPenyuluhs', 'tipe');
  }
};