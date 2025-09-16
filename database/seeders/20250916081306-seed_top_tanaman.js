'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Daftar komoditas sesuai jenis
    const komoditasMapping = {
      'TANAMAN PANGAN': [
        'Padi Organik',
        'Padi Konvensional',
        'Jagung',
        'Kedelai',
        'Ubi Kayu',
        'Ubi Jalar',
        'Kacang Tanah'
      ],
      SAYURAN: ['Cabai', 'Tomat', 'Bawang Merah', 'Bawang Putih', 'Kubis'],
      BUAHAN: ['Pisang', 'Mangga', 'Jeruk', 'Semangka', 'Melon'],
      PERKEBUNAN: ['Kopi', 'Kakao', 'Kelapa Sawit', 'Teh', 'Karet']
    };

    // Pilih kategori random
    const kategoriList = Object.keys(komoditasMapping);

    // Generate 10 data dummy
    const dummyData = Array.from({ length: 10 }).map(() => {
      const kategori = kategoriList[Math.floor(Math.random() * kategoriList.length)];
      const komoditasList = komoditasMapping[kategori];
      const komoditas = komoditasList[Math.floor(Math.random() * komoditasList.length)];

      return {
        statusKepemilikanLahan: 'MILIK SENDIRI',
        luasLahan: Math.floor(Math.random() * 500) + 100,
        kategori,
        jenis: kategori, // sesuai kategori
        komoditas, // random sesuai jenis
        periodeMusimTanam: 'Tanaman Semusim',
        periodeBulanTanam: 'September', // fokus bulan sekarang
        prakiraanLuasPanen: Math.floor(Math.random() * 400) + 80,
        prakiraanProduksiPanen: Math.floor(Math.random() * 600) + 100,
        prakiraanBulanPanen: ['Oktober', 'November', 'Desember'][Math.floor(Math.random() * 3)], // random 3 bulan ke depan
        fk_petaniId: Math.floor(Math.random() * 5) + 200, // random 200-204
        createdAt: now,
        updatedAt: now
      };
    });

    await queryInterface.bulkInsert('tanamanPetanis', dummyData, {});
  },

  async down(queryInterface, Sequelize) {
    // Hapus hanya data yang dibuat pada bulan September 2025
    await queryInterface.bulkDelete(
      'tanamanPetanis',
      {
        createdAt: {
          [Sequelize.Op.between]: [new Date('2025-09-01 00:00:00'), new Date('2025-09-30 23:59:59')]
        }
      },
      {}
    );
  }
};
