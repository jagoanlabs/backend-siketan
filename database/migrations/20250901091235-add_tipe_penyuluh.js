'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Tambahkan kolom yang bisa NULL dulu
    await queryInterface.addColumn('dataPenyuluhs', 'tipe', {
      type: Sequelize.ENUM('reguler', 'swadaya'),
      allowNull: true
    });

    // 2. Update semua data yang sudah ada menjadi 'reguler'
    await queryInterface.sequelize.query(
      "UPDATE `dataPenyuluhs` SET `tipe` = 'reguler' WHERE `tipe` IS NULL"
    );

    // 3. Ubah kolom menjadi NOT NULL
    await queryInterface.changeColumn('dataPenyuluhs', 'tipe', {
      type: Sequelize.ENUM('reguler', 'swadaya'),
      allowNull: false,
      defaultValue: 'reguler'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('dataPenyuluhs', 'tipe');
  }
};